export const pomsky: string | null = "$$POMSKY$$";
export const regex = "$$REGEX$$";

const cache = new Map();

export function make(flags: string) {
	if (!flags) flags = "";

	if (cache.has(flags)) {
		return cache.get(flags);
	}

	const compiledRegex = new RegExp(regex, flags);
	cache.set(flags, compiledRegex);
	return compiledRegex;
}

export default make;
