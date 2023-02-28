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

console.log("Import.");
console.log(make());

const poms = pomsky$(`[d]`);

console.log("Inline.");
console.log(poms());
console.log(poms.pomsky);
console.log(poms.regex);

// @ts-ignore Unknown file type.
import("./test.javascript");
