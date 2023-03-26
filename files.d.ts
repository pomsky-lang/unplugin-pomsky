/*
 * Behold, the true wonders of TypeScript!
 *
 * This file can't import or export anything,
 * otherwise it doesn't actually declare the
 * file modules.
 *
 * The helper types below need to be copied
 * from ./types.d.ts every time they change.
 */

type Flags = {
	hasIndices?: boolean;
	global?: boolean;
	ignoreCase?: boolean;
	multiline?: boolean;
	dotAll?: boolean;
	unicode?: boolean;
	sticky?: boolean;
};
type Flavor =
	| "js"
	| "javascript"
	| "java"
	| ".net"
	| "dotnet"
	| "pcre"
	| "python"
	| "ruby"
	| "rust";
type PomskyValue = string | null;
type RegExValue = string;

type MakeFunction = (flags?: string | Flags) => RegExp;
type MakeFunctionInstance = MakeFunction & {
	pomsky: PomskyValue;
	regex: RegExValue;
};
type CacheMap = Map<string, RegExp>;

declare module "*.pom" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=js" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=javascript" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=java" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=.net" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=dotnet" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=pcre" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=python" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=ruby" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pom?flavor=rust" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=js" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=javascript" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=java" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=.net" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=dotnet" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=pcre" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=python" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=ruby" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}

declare module "*.pomsky?flavor=rust" {
	export const pomsky: PomskyValue;
	export const regex: RegExValue;

	export const make: MakeFunction;
	export default make;
}
