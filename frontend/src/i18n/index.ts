import { en, type Dictionary } from "./en";

// Single active locale for now; add `id` here (same Dictionary shape) to enable Indonesian.
const dictionaries: Record<string, Dictionary> = { en };

export const locale = "en";
export const t: Dictionary = dictionaries[locale];