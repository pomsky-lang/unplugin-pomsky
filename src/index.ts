import { createRequire } from "module";
import { compile, initSync } from "pomsky-wasm";
import { createUnplugin } from "unplugin";

import fs from "node:fs";
import path from "node:path";

const _require = createRequire(import.meta.url);

type UserOptions = {
	flavor?: string;
	includeOriginal?: boolean;
};

const wasmPath = path.join(
	_require.resolve("pomsky-wasm"),
	"..",
	"pomsky_wasm_bg.wasm"
);
initSync(fs.readFileSync(wasmPath));

const template = fs.readFileSync(
	path.resolve(__dirname, "template.js"),
	"utf8"
);

function findRowColContext(str: string, start: number) {
	const previousLines = str.slice(0, start).split("\n");
	const row = previousLines.length;
	const column = (previousLines[previousLines.length - 1] ?? "").length + 1;
	const context = str.split("\n")[previousLines.length];

	return { row, column, context };
}

export default createUnplugin((options: UserOptions) => {
	return {
		name: "unplugin-pomsky",
		transformInclude(id) {
			return id.endsWith(".pom") || id.endsWith(".pomsky");
		},
		async transform(code) {
			const { diagnostics, output } = compile(
				code,
				options.flavor ?? "js"
			);
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

			return (
				`export const pomsky = ${
					options.includeOriginal
						? `\`${code.replace(/`/g, "\\`")}\``
						: "null"
				};\nexport const regex = "${output
					?.replace(/\\/g, "\\\\")
					.replace(/"/g, '\\"')}";\n` + template
			);
		},
	};
});
