import { makeMakeFunction } from "virtual:unplugin-pomsky/utils";
import type { PomskyValue, RegExValue } from "../types";

export const pomsky: PomskyValue = "$$POMSKY$$";
export const regex: RegExValue = "$$REGEX$$";
export default makeMakeFunction(pomsky, regex, new Map());
