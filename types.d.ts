declare module "*.pom" {
	export const pomsky: string | null;
	export const regex: string;

	export function make(flags?: string): RegExp;
	export default make;
}

declare module "*.pomsky" {
	export const pomsky: string | null;
	export const regex: string;

	export function make(flags?: string): RegExp;
	export default make;
}
