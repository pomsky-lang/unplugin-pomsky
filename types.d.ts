/// <reference path="./files.d.ts" />

export type Flags = {
	hasIndices?: boolean;
	global?: boolean;
	ignoreCase?: boolean;
	multiline?: boolean;
	dotAll?: boolean;
	unicode?: boolean;
	sticky?: boolean;
};
export type Flavor =
	| "js"
	| "javascript"
	| "java"
	| ".net"
	| "dotnet"
	| "pcre"
	| "python"
	| "ruby"
	| "rust";
export type PomskyValue = string | null;
export type RegExValue = string;

export type MakeFunction = (flags?: string | Flags) => RegExp;
export type MakeFunctionInstance = MakeFunction & {
	pomsky: PomskyValue;
	regex: RegExValue;
};
export type CacheMap = Map<string, RegExp>;

declare global {
	function pomsky$(
		code: string,
		flavor?: Flavor
	): ((flags?: Flags) => RegExp) & {
		pomsky: string | null;
		regex: string;
	};
}

export {};
