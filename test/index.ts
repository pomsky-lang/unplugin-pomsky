// Include the types for the .pom and .pomsky files.
/// <reference path="../types.d.ts" />

import make, { pomsky, regex } from "./regex.pom?flavor=rust";

document.body.append(
	Object.assign(document.createElement("h1"), { textContent: "Pomsky" }),
	Object.assign(document.createElement("pre"), {
		textContent: pomsky,
	}),
	Object.assign(document.createElement("h1"), { textContent: "RegEx" }),
	Object.assign(document.createElement("pre"), {
		textContent: regex,
	})
);
console.log(make());

const poms = pomsky$(
	`
['-+']?
%
('0' | ['1'-'9'] (','? ['0'-'9'])*)
('.' ['0'-'9']+)?
%
[d]
`,
	"rust"
);

console.log(poms.regex);

console.log(poms("i").test("thingtHingthing"));
