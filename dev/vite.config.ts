import pomsky from "unplugin-pomsky";
import { UserConfigExport } from "vite";

export default {
	plugins: [
		pomsky.vite({
			flavor: "js",
			includeOriginal: true,
			fileExtensions: [".javascript"],
		}),
	],
	root: "./",
} as UserConfigExport;
