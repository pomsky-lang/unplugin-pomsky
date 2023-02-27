// Include the types for the .pom and .pomsky files.
/// <reference path="../types.d.ts" />

import { createRequire } from "module";
import { compile, initSync } from "pomsky-wasm";
import { createUnplugin } from "unplugin";

import fs from "node:fs";
import path from "node:path";

import { dirname } from "path";
import { fileURLToPath } from "url";

import { parse } from "@swc/wasm";
import df from "d-forest";
import MagicString from "magic-string";

const __dirname = dirname(fileURLToPath(import.meta.url));

const _require = createRequire(import.meta.url);

type UserOptions = {
	flavor?:
		| "js"
		| "javascript"
		| "java"
		| ".net"
		| "dotnet"
		| "pcre"
		| "python"
		| "ruby"
		| "rust";
	includeOriginal?: boolean;
	fileExtensions?: (string | RegExp)[];
};

const wasmPath = path.join(
	_require.resolve("pomsky-wasm"),
	"..",
	"pomsky_wasm_bg.wasm"
);
initSync(fs.readFileSync(wasmPath));

const moduleTemplate = fs
	.readFileSync(path.resolve(__dirname, "moduleTemplate.js"), "utf8")
	.trim();
const ftTemp = fs
	.readFileSync(path.resolve(__dirname, "functionalTemplate.js"), "utf8")
	.trim();
const functionalTemplate = ftTemp.substring(0, ftTemp.length - 1);

function findRowColContext(str: string, start: number) {
	const previousLines = str.slice(0, start).split("\n");
	const row = previousLines.length;
	const column = (previousLines[previousLines.length - 1] ?? "").length + 1;
	const context = str.split("\n")[previousLines.length] ?? str;

	return { row, column, context };
}

function isPomskyFile(filePath: string) {
	return /\.pom(?:sky)?(?:\?.+)?/.test(filePath);
}

function transformPomskyFile(
	filePath: string,
	code: string,
	options: UserOptions
) {
	const pomskyFlavor = new URL(filePath).searchParams.get("flavor");

	return transformTemplate.bind(this)(
		moduleTemplate,
		filePath,
		code,
		{ ...options, flavor: pomskyFlavor ?? options.flavor ?? "js" },
		true
	);
}

function shouldTransformNonPomskyFile(
	filePath: string,
	options: UserOptions
): boolean {
	const defaultExtensions = [".js", ".jsx", ".ts", ".tsx"];
	if (defaultExtensions.some((ext) => filePath.endsWith(ext))) {
		return true;
	}

	return options.fileExtensions?.some((ext) => {
		if (typeof ext === "string") {
			if (filePath.endsWith(ext)) return true;
			return false;
		}
		return ext.test(filePath);
	});
}

function shouldTransformFile(filePath: string, options: UserOptions) {
	return (
		isPomskyFile(filePath) ||
		shouldTransformNonPomskyFile(filePath, options)
	);
}

function transformTemplate(
	template: string,
	filePath: string,
	code: string,
	options: UserOptions,
	sourceMap: boolean
) {
	const { diagnostics, output } = compile(code, options.flavor ?? "js");
	if (output == null) {
		let error = "Failed to compile Pomsky code.";
		for (const item of diagnostics) {
			error += `\n${item.kind} ${item.severity}: ${item.code}`;

			const { row, column, context } = findRowColContext(
				code,
				item.range[0]
			);
			error += `\n${
				item.message
			} at line ${row.toLocaleString()}, column ${column.toLocaleString()}.`;

			if (item.help) error += `\n${item.help}?`;

			error += "\n```regex";
			error += `\n${context}`;
			error += "\n```";
		}
		this.error(error);
		return;
	}

	const pomsky = options.includeOriginal
		? `\`${code.replace(/`/g, "\\`")}\``
		: "null";
	const regex = output?.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

	const filledTemplate = template.replace(
		/("\$\$POMSKY\$\$"|\$\$REGEX\$\$)/g,
		(s) => {
			if (s === '"$$POMSKY$$"') {
				return pomsky;
			} else if (s === "$$REGEX$$") {
				return regex;
			}
			return s;
		}
	);

	if (!sourceMap) return { code: filledTemplate, map: null };

	const msPomsky = new MagicString(code);

	msPomsky.overwrite(0, msPomsky.length(), filledTemplate);

	return {
		code: msPomsky.toString(),
		map: msPomsky.generateMap({
			source: filePath,
			file: `${path.basename(filePath)}.map`,
			includeContent: true,
		}),
	};
}

async function transformNonPomskyFile(
	filePath: string,
	code: string,
	options: UserOptions
) {
	const ast = await parse(code, {
		syntax: "typescript",
		decorators: true,
		tsx: true,
	});

	/*
		S - Short: SWC, the only thing shorter than your name is your attention span.
		W - Wacky: If SWC were a computer program, it would have a "wacky" offset.
		C - Clumsy: SWC's offset is like his coordination - clumsy and out of sync.
	*/
	const offset = BigInt(ast.span.start);

	const nodes = df.findNodes(ast, (node) => {
		if (node.type === "CallExpression") {
			node = node.callee;
			if (node.type === "Identifier" && node.value === "pomsky$") {
				return true;
			}
		}
		return false;
	});

	if (nodes.length > 0) {
		const msCode = new MagicString(code);
		for (const node of nodes as any[]) {
			if (
				node.arguments[0].expression.expressions?.length > 0 ||
				node.arguments[1]?.expression.expressions?.length > 0
			) {
				this.error(
					"Inline Pomsky is precompiled. You can not include JavaScript variables in the source."
				);
			}

			const pomskyCodeSpan = node.arguments[0].expression.span;
			const pomskyCode = msCode
				.toString()
				.substring(
					Number(BigInt(pomskyCodeSpan.start) - offset) + 1,
					Number(BigInt(pomskyCodeSpan.end) - offset) - 1
				);

			const pomskyFlavorSpan = node.arguments[1]?.expression.span;
			const pomskyFlavor = pomskyFlavorSpan
				? msCode
						.toString()
						.substring(
							Number(BigInt(pomskyFlavorSpan.start) - offset) + 1,
							Number(BigInt(pomskyFlavorSpan.end) - offset) - 1
						)
				: null;

			msCode.update(
				Number(BigInt(node.span.start) - offset),
				Number(BigInt(node.span.end) - offset),
				transformTemplate.bind(this)(
					functionalTemplate,
					filePath,
					pomskyCode,
					{ ...options, flavor: pomskyFlavor ?? options.flavor ?? "js" },
					false
				).code
			);
		}

		return {
			code: msCode.toString(),
			map: msCode.generateMap({
				source: filePath,
				file: `${path.basename(filePath)}.map`,
				includeContent: true,
			}),
		};
	}

	return { code: code, map: null };
}

const pluginInstance = createUnplugin((options: UserOptions) => {
	return {
		name: "unplugin-pomsky",
		transformInclude(filePath) {
			return shouldTransformFile(filePath, options);
		},
		async transform(code, filePath) {
			if (isPomskyFile(filePath)) {
				return transformPomskyFile.bind(this)(filePath, code, options);
			} else if (shouldTransformNonPomskyFile(filePath, options)) {
				return transformNonPomskyFile.bind(this)(filePath, code, options);
			}
		},
	};
});

export default pluginInstance;
