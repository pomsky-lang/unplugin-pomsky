/// <reference path="./files.d.ts" />

declare global {
	function pomsky$(
		code: string,
		flavor?:
			| "js"
			| "javascript"
			| "java"
			| ".net"
			| "dotnet"
			| "pcre"
			| "python"
			| "ruby"
			| "rust"
	): ((flags?: string) => RegExp) & {
		pomsky: string | null;
		regex: string;
	};
}

export {};
