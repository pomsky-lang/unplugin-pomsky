// Include the types for the .pom and .pomsky files.
/// <reference path="../types.d.ts" />

console.log("Custom file extensions.");

const poms = pomsky$(`[d]`, "rust");

console.log(poms());
console.log(poms.pomsky);
console.log(poms.regex);
