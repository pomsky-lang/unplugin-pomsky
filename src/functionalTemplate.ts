(() => {
	const pomsky: string | null = "$$POMSKY$$";
	const regex = "$$REGEX$$";

	const cache = new Map();

	return Object.assign(
		function (flags: string) {
			if (!flags) flags = "";

			if (cache.has(flags)) {
				return cache.get(flags);
			}

			const compiledRegex = new RegExp(regex, flags);
			cache.set(flags, compiledRegex);
			return compiledRegex;
		},
		{
			pomsky,
			regex,
			cache,
		}
	);
})();
