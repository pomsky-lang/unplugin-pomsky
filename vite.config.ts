import { UserConfigExport } from "vite";
import pomsky from "./src/index.js";

export default {
	plugins: [
		pomsky.vite({
			flavor: "js",
			includeOriginal: true,
		}),
	],
	root: "./test",
} as UserConfigExport;
