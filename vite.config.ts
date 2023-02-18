import { UserConfigExport } from "vite";
import pomsky from "./src/index.js";

export default {
	plugins: [
		pomsky.vite({
			flavor: "js",
			includeOriginal: false,
		}),
	],
	root: "./test",
} as UserConfigExport;
