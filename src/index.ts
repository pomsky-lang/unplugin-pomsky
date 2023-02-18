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

export default createUnplugin((options: UserOptions) => {
	return {
		name: "unplugin-pomsky",
		transformInclude(id) {
			return id.endsWith(".pom") || id.endsWith(".pomsky");
		},
		async transform(code) {
			const { output } = compile(code, options.flavor ?? "js");
			if (output == null) {
				console.warn(`Failed to compile Pomsky: ${code}`);
				return null;
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
