# Unplugin Pomsky

Use [Pomsky](https://pomsky-lang.org/) along with your JavaScript.

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
import fs from "node:fs";
import pomsky from "unplugin-pomsky";
import { UserConfigExport } from "vite";

export default {
	plugins: [
		pomsky.vite({
			flavor: "js", // default = "js"
			includeOriginal: false, // default = false
			fileExtensions: [".javascript"], // default = []; always checks /"." ["c" "m"]? ["j" "t"] "s" "x"? $/
			pomskyWASM: fs.readFileSync("path/to/custom/pomsky.wasm"), // default = unplugin-pomsky's package.json pomsky-wasm
		}),
	],
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

### Import

```ts
// The regex source is inlined and the Pomsky code is compiled on build.
// The flavor is optional.
import make, { pomsky, regex } from "./regex.pom?flavor=rust";

// Compiles the regex when called.
make();

// Optional flags.
make("gi");

// Automatic caching. Works with flags too!
for (let i = 0; i < 1_000_000; i++) {
	make();
}

// The original Pomsky source. Only included with `includeOriginal: true` in the plugin options.
pomsky;

// The regex source.
regex;
```

### Inline

```ts
// The regex source is inlined and the Pomsky code is compiled on buid.

// No need to import this function since it doesn't actually exist.
// The flavor is optional.
const make = pomsky$(`
['-+']?
%
('0' | ['1'-'9'] (','? ['0'-'9'])*)
('.' ['0'-'9']+)?
%
`, "js");

// Compiles the regex when called.
make();

// Optional flags.
make("gi");

// Automatic caching. Works with flags too!
for (let i = 0; i < 1_000_000; i++) {
	make();
}

// The original Pomsky source. Only included with `includeOriginal: true` in the plugin options.
make.pomsky;

// The regex source.
make.regex;
```

## Unicode Aware

Pomsky is unicode aware by default, so the unicode flag is enabled by default.

There's no clean way to represent disabling unicode with the standard string format, so the plugin provides an object form which has the ability to disable unicode.

```ts
make().flags; // "u"
make("").flags; // "u"
make("i").flags; // "iu"
make({ ignoreCase: true, unicode: false }).flags; // "i"
```
