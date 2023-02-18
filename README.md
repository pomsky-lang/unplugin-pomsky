# Unplugin Pomsky

Use Pomsky along with your JavaScript.

## Support

- [x] ESM
- [ ] CJS
- [x] Vite
- [x] Rollup
- [x] Webpack
- [x] ESBuild

## Installation

```bash
pnpm i -D unplugin-pomsky
```

`vite.config.ts`
```ts
import { UserConfigExport } from "vite";
import pomsky from "unplugin-pomsky/vite";

export default {
	plugins: [
		pomsky({
			flavor: "js", // default = "js"
			includeOriginal: false, // default = false
		}),
	],
	root: "./test",
} as UserConfigExport;
```

`tsconfig.json`
```ts
{
	"compilerOptions": {
		"types": ["unplugin-pomsky"]
	}
}
```

## Usage

```ts
import make, { pomsky, regex } from "./regex.pom";

// The regex source is inlined and the Pomsky code is compiled on build.

make(); // Compiles the regex when called.

make("gi"); // Optional flags.

for (let i = 0; i < 1_000_000; i++) {
	make(); // Automatic caching. Works with flags too!
}

pomsky; // The original Pomsky source. Only included with `includeOriginal: true` in the plugin options.

regex; // The regex source.
```
