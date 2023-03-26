import { makeMakeFunction } from "virtual:unplugin-pomsky/utils";
import type { PomskyValue, RegExValue } from "../types";

(() => {
	const pomsky: PomskyValue = "$$POMSKY$$";
	const regex: RegExValue = "$$REGEX$$";
	return makeMakeFunction(pomsky, regex, new Map());
})();
