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
import { UserConfigExport } from "vite";
import pomsky from "unplugin-pomsky";

export default {
	plugins: [
		pomsky.vite({
			flavor: "js", // default = "js"
			includeOriginal: false, // default = false
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

### Separate File

```ts
// The flavor is optional.
// The regex source is inlined and the Pomsky code is compiled on build.
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
// The regex source is inlined and the Pomsky code is compiled on build.
// Compiles the regex when called.
// No need to import this function since it doesn't actually exist.
// The flavor is optional.
const make = pomsky$(`
['-+']?
%
('0' | ['1'-'9'] (','? ['0'-'9'])*)
('.' ['0'-'9']+)?
%
`, "js");

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