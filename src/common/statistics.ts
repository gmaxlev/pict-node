import { EOL } from "os";
import type { PictNodeStatistics } from "./types";

/**
 * Parsing and formatting native PICT statistics to JS object
 */

/**
 * Normalizes raw string value and formats keys
 */
function normalizeParameter(key: string, value: string) {
  switch (key) {
    case "Combinations":
      return {
        combinations: Number.parseInt(value),
      } as const;

    case "Generated tests":
      return {
        generatedTests: Number.parseInt(value),
      } as const;

    case "Generation time":
      return {
        generationTime: value,
      } as const;

    default:
      throw new Error("Unexpected statistic key");
  }
}

/**
 * Parses a statistic parameter
 */
function parseParameter(raw: string) {
  const dividerIndex = raw.indexOf(":");

  if (dividerIndex === -1) {
    throw new Error("Unexpected statistic value");
  }

  const key = raw.substring(0, dividerIndex);
  const value = raw.substring(dividerIndex + 1).trim();

  return normalizeParameter(key, value);
}

/**
 * Receives raw PICT's statistics output and return normalized statistics
 */
export function parseStatistics(raw: string, generationTimeNodeJs: number) {
  return raw
    .split(EOL)
    .filter(Boolean)
    .map(parseParameter)
    .reduce<Partial<PictNodeStatistics>>(
      (stats, item) => {
        return { ...stats, ...item } as PictNodeStatistics;
      },
      { generationTimeNodeJs }
    ) as PictNodeStatistics;
}
