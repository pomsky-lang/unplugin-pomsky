import make, { pomsky, regex } from "./regex.pom";

document.body.append(
	Object.assign(document.createElement("h1"), { textContent: "Pomsky" }),
	Object.assign(document.createElement("pre"), { textContent: pomsky }),
	Object.assign(document.createElement("h1"), { textContent: "RegEx" }),
	Object.assign(document.createElement("pre"), { textContent: regex })
);
console.log(make());
