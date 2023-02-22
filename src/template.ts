// @ts-nocheck

const cache = new Map();

export function make(flags) {
	if (!flags) flags = "";

	if (cache.has(flags)) {
		return cache.get(flags);
	}

	const compiledRegex = new RegExp(regex, flags);
	cache.set(flags, compiledRegex);
	return compiledRegex;
}

export default make;
