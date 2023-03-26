import {
	CacheMap,
	Flags,
	MakeFunction,
	MakeFunctionInstance,
	PomskyValue,
	RegExValue,
} from "../types";

export const flagMap: Record<keyof Flags, string> = {
	hasIndices: "d",
	global: "g",
	ignoreCase: "i",
	multiline: "m",
	dotAll: "s",
	unicode: "u",
	sticky: "y",
};
export function makeFlagsString(flags: Flags): string {
	let flagsString = "";
	let hadUnicode = false;
	for (const [flag, enabled] of Object.entries(flags)) {
		if (flag === "unicode") hadUnicode = true;
		flagsString += enabled ? flagMap[flag] : "";
	}
	return flagsString + (hadUnicode ? "" : "u");
}
export function makeMakeFunction(
	pomsky: PomskyValue,
	regex: RegExValue,
	cache: CacheMap
): MakeFunctionInstance {
	const makeFunction: MakeFunction = (flags) => {
		const flagsString =
			typeof flags === "string" ? `u${flags}` : makeFlagsString(flags ?? {});

		if (cache.has(flagsString)) {
			return cache.get(flagsString);
		}

		const compiledRegex = new RegExp(regex, flagsString);
		cache.set(flagsString, compiledRegex);
		return compiledRegex;
	};
	return Object.assign(makeFunction, {
		pomsky,
		regex,
	});
}
