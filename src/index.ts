// Include the types for the .pom and .pomsky files.
/// <reference path="../types.d.ts" />

import { createRequire } from "module";
import init, { compile } from "pomsky-wasm";
import {
	TransformResult,
	UnpluginBuildContext,
	UnpluginContext,
	createUnplugin,
} from "unplugin";

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { dirname } from "path";
import { fileURLToPath } from "url";

import { Node, walk } from "estree-walker";
import MagicString from "magic-string";
import { Flavor } from "../types";

const __dirname = dirname(fileURLToPath(import.meta.url));

const _require = createRequire(import.meta.url);

type UserOptions = {
	flavor?: Flavor;
	includeOriginal?: boolean;
	fileExtensions?: (string | RegExp)[];
	pomskyWASM?: Uint8Array | Buffer;
};

const wasmPath = path.join(
	_require.resolve("pomsky-wasm"),
	"..",
	"pomsky_wasm_bg.wasm"
);
const defaultWASM = fs.readFileSync(wasmPath);

const utilsImport = `import { makeMakeFunction } from "virtual:unplugin-pomsky/utils";`;
const utilsModule = fs
	.readFileSync(path.resolve(__dirname, "utils.js"), "utf8")
	.trim();
const moduleTemplate = fs
	.readFileSync(path.resolve(__dirname, "moduleTemplate.js"), "utf8")
	.trim();
const ftTemp = fs
	.readFileSync(path.resolve(__dirname, "functionalTemplate.js"), "utf8")
	.replace(utilsImport, "")
	.trim();
const functionalTemplate = ftTemp.substring(0, ftTemp.length - 1);

function findRowColContext(str: string, start: number) {
	const previousLines = str.slice(0, start).split("\n");
	const row = previousLines.length;
	const column = (previousLines[previousLines.length - 1] ?? "").length + 1;
	const context = str.split("\n")[previousLines.length] ?? str;

	return { row, column, context };
}

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isPomskyFile(filePath: string) {
	return /\.pom(?:sky)?(?:\?.+)?/.test(filePath);
}

function transformPomskyFile(
	unplugin: UnpluginBuildContext & UnpluginContext,
	filePath: string,
	code: string,
	options: UserOptions
) {
	const pomskyFlavor: string = url
		.pathToFileURL(filePath)
		.searchParams.get("flavor");

	return transformTemplate(
		unplugin,
		moduleTemplate,
		filePath,
		code,
		{
			...options,
			// It's "safe" to wrecklessly cast here because the compiler will throw its own error.
			flavor: (pomskyFlavor as Flavor) ?? options.flavor ?? "js",
		},
		true
	);
}

function shouldTransformNonPomskyFile(
	filePath: string,
	options: UserOptions
): boolean {
	const defaultExtensions = /\.[cm]?[jt]sx?(?:\?.+)?$/;
	if (defaultExtensions.test(filePath)) {
		return true;
	}

	return options.fileExtensions?.some((ext) => {
		if (typeof ext === "string") {
			if (new RegExp(`${escapeRegExp(ext)}(?:\\?.+)?`)) return true;
			return false;
		}
		return ext.test(filePath);
	});
}

function shouldTransformFile(filePath: string, options: UserOptions) {
	return (
		isPomskyFile(filePath) || shouldTransformNonPomskyFile(filePath, options)
	);
}

function transformTemplate(
	unplugin: UnpluginBuildContext & UnpluginContext,
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

			const { row, column, context } = findRowColContext(code, item.range[0]);
			error += `\n${
				item.message
			} at line ${row.toLocaleString()}, column ${column.toLocaleString()}.`;

			if (item.help) error += `\n${item.help}?`;

			error += "\n```regex";
			error += `\n${context}`;
			error += "\n```";
		}
		unplugin.error(error);
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
	unplugin: UnpluginBuildContext & UnpluginContext,
	filePath: string,
	code: string,
	options: UserOptions
): Promise<TransformResult> {
	// Quickly check if there might be an inline to transform.
	if (!code.includes("pomsky$")) {
		return;
	}

	const magicCode = new MagicString(code);

	magicCode.prepend(utilsImport);

	const ast = unplugin.parse(code);

	walk(ast as Node, {
		enter(_node) {
			if (_node.type !== "CallExpression") return;
			if (_node.callee.type !== "Identifier") return;
			if (_node.callee.name !== "pomsky$") return;

			// Utility function for ensuring the node has the correct types.
			function hasStartEnd<T>(node: T): T & { start: number; end: number } {
				return node as T & { start: number; end: number };
			}

			const node = hasStartEnd(_node);
			const pomskyIdentifierNode = hasStartEnd(node.callee);
			const pomskyCodeNode = hasStartEnd(node.arguments[0]);
			const pomskyFlavorNode = hasStartEnd(node.arguments[1]);

			function getErrorLocation(n: any): string {
				return `${filePath}:${n.loc.start.line}:${n.loc.start.column}`;
			}

			if (pomskyCodeNode == null) {
				unplugin.error(
					`Inline Pomsky code is missing.\n${getErrorLocation(pomskyIdentifierNode)}`
				);
				return;
			}

			// Grab the Pomsky code.
			let pomskyCode = null;
			if (pomskyCodeNode.type === "Literal" && "value" in pomskyCodeNode) {
				pomskyCode = pomskyCodeNode.value.toString();
			} else if (pomskyCodeNode.type === "TemplateLiteral") {
				// Cannot have any runtime expressions.
				// Template literals here are only for multiline.
				if (pomskyCodeNode.expressions.length > 0) {
					unplugin.error(
						`Inline Pomsky code cannot contain runtime expressions.\n${getErrorLocation(
							pomskyCodeNode.expressions[0]
						)}`
					);
					return;
				}

				// Add and subtract one to remove the quotes.
				pomskyCode = code.slice(pomskyCodeNode.start + 1, pomskyCodeNode.end - 1);
			}

			if (pomskyCode == null) {
				unplugin.error(
					`Couldn't find the Pomsky code on inline transform.\n${getErrorLocation(
						pomskyCodeNode
					)}`
				);
				return;
			}

			let pomskyFlavor = null;
			if (pomskyFlavorNode != null) {
				if (pomskyFlavorNode.type === "Literal" && "value" in pomskyFlavorNode) {
					pomskyFlavor = pomskyFlavorNode.value.toString();
				} else if (pomskyFlavorNode.type === "TemplateLiteral") {
					// Cannot have any runtime expressions.
					// Template literals here are only for multiline.
					if (pomskyFlavorNode.expressions.length > 0) {
						unplugin.error(
							`Inline Pomsky flavor cannot contain runtime expressions.\n${getErrorLocation(
								pomskyFlavorNode.expressions[0]
							)}`
						);
						return;
					}

					// Add and subtract one to remove the quotes.
					pomskyFlavor = code.slice(
						pomskyFlavorNode.start + 1,
						pomskyFlavorNode.end - 1
					);
				}
			}

			magicCode.update(
				node.start,
				node.end,
				transformTemplate(
					unplugin,
					functionalTemplate,
					filePath,
					pomskyCode,
					{
						...options,
						// It's "safe" to wrecklessly cast here because the compiler will throw its own error.
						flavor: (pomskyFlavor as Flavor) ?? options.flavor ?? "js",
					},
					false
				).code
			);
		},
	});

	if (magicCode.hasChanged()) {
		return {
			code: magicCode.toString(),
			map: magicCode.generateMap({
				source: filePath,
				includeContent: true,
			}),
		};
	}
}

const virtualUtilsID = "virtual:unplugin-pomsky/utils";
const resolvedVirtualUtilsID = "\0" + virtualUtilsID;

const pluginInstance = createUnplugin((options: UserOptions) => {
	return {
		name: "@pomsky-lang/unplugin",
		resolveId(id) {
			if (id === virtualUtilsID) return resolvedVirtualUtilsID;
		},
		transformInclude(filePath) {
			return shouldTransformFile(filePath, options);
		},
		async buildStart() {
			await init(options.pomskyWASM ?? defaultWASM);
		},
		load(id) {
			if (id === resolvedVirtualUtilsID) {
				return utilsModule;
			}
		},
		async transform(code, filePath) {
			if (isPomskyFile(filePath)) {
				return transformPomskyFile(this, filePath, code, options);
			} else if (shouldTransformNonPomskyFile(filePath, options)) {
				return transformNonPomskyFile(this, filePath, code, options);
			}
		},
	};
});

export default pluginInstance;
