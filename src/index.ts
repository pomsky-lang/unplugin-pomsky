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

function findRowColContext(str: string, start: number, col: number) {
	const tempString = str.substring(0, start);
	const allLines = str.split("\n");
	const lines = tempString.split("\n");
	const errorLine = lines.length - 1;
	return [
		lines.length,
		start - (tempString.length - lines[lines.length - 1].length) + 1,
		allLines[errorLine],
	];
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
				for (const item of diagnostics) {
					let error = "Failed to compile Pomsky code.";
					error += `\n${item.kind} ${item.severity}: ${item.code}`;

					const [row, col, line] = findRowColContext(
						code,
						item.range[0],
						item.range[1]
					);
					error += `\n${
						item.message
					} at line ${row.toLocaleString()}, column ${col.toLocaleString()}.`;

					if (item.help) error += `\n${item.help}?`;

					error += "\n```regex";
					error += `\n${line}`;
					error += "\n```";
					this.error(error);
				}
				return;
			}

			return (
				`export const pomsky = ${
					options.includeOriginal
						? `\`${code.replace(/`/g, "\\`")}\``
						: "null"
				};\nexport const regex = "${output?.replace(/"/g, '\\"')}";\n` +
				template
			);
		},
	};
});
