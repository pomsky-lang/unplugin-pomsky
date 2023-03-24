import fs from "node:fs";
import pomsky from "unplugin-pomsky";
import { UserConfigExport } from "vite";

export default {
	plugins: [
		pomsky.vite({
			flavor: "js",
			includeOriginal: true,
			fileExtensions: [".javascript"],
			pomskyWASM: fs.readFileSync("./node_modules/pomsky-wasm/pomsky_wasm_bg.wasm"),
		}),
	],
	root: "./",
} as UserConfigExport;
