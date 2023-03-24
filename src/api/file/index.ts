import {
  isString,
  isUndefined,
  isPositiveNumber,
  isBoolean,
} from "./../../common/utils";
import {
  PictCliOptions,
  isRandomOption,
  isModelSeparator,
} from "../../common/types";
import fsp from "fs/promises";
import { isRecord } from "../../common/utils";
import { callPictBinary, pictEntries } from "../../common/pict";
import path from "path";

interface FileOptions {
  modelPath: string;
  seedPath?: string;
  options?: Partial<Omit<PictCliOptions, "seed">>;
}

function validate(options: FileOptions) {
  isRecord.assert(options, "the first argument");
  isString.assert(options.modelPath, '"modelPath"');

  if (!isUndefined(options.seedPath)) {
    isString.assert(options.seedPath, '"seedPath"');
  }

  if (!isUndefined(options.options)) {
    isRecord.assert(options.options, '"options"');

    if (!isUndefined(options.options.order)) {
      isPositiveNumber.assert(options.options.order, '"options.order"');
    }

    if (!isUndefined(options.options.random)) {
      isRandomOption.assert(options.options.random, '"options.random"');
    }

    if (!isUndefined(options.options.aliasSeparator)) {
      isModelSeparator.assert(
        options.options.aliasSeparator,
        '"options.aliasSeparator"'
      );
    }
    if (!isUndefined(options.options.valueSeparator)) {
      isModelSeparator.assert(
        options.options.aliasSeparator,
        '"options.valueSeparator"'
      );
    }
    if (!isUndefined(options.options.negativePrefix)) {
      isModelSeparator.assert(
        options.options.aliasSeparator,
        '"options.negativePrefix"'
      );
    }

    if (!isUndefined(options.options.caseSensitive)) {
      isBoolean.assert(
        options.options.caseSensitive,
        '"options.caseSensitive"'
      );
    }
  }
}

function parseResult(result: string): Array<Record<string, string>> {
  const cases: any[] = [];

  for (const item of pictEntries(result)) {
    let currentCase;

    if (item.valueIndex === 0) {
      currentCase = {};
      cases.push(currentCase);
    } else {
      currentCase = cases[cases.length - 1];
    }

    currentCase[item.rowName as string] = item.value;

    cases[cases.length - 1] = currentCase;
  }

  return cases;
}

export async function file(options: FileOptions) {
  const start = performance.now();

  validate(options);

  const resolvedModelPath = path.resolve(options.modelPath);

  try {
    await fsp.access(resolvedModelPath);
  } catch (error) {
    console.log("Error: model file access error", resolvedModelPath);
    throw error;
  }

  const callPictOptions: Partial<PictCliOptions> = {
    ...options.options,
  };

  if (options.seedPath) {
    try {
      const resolvedSeedPath = path.resolve(options.seedPath);
      await fsp.access(resolvedSeedPath);
      callPictOptions.seeds = resolvedSeedPath;
    } catch (error) {
      console.log("Error: seed file access error");
      throw error;
    }
  }

  const result = callPictBinary(resolvedModelPath, callPictOptions);

  const cases = parseResult(result);

  const end = performance.now() - start;

  return {
    cases,
    length: cases.length,
    time: end,
    pict: {
      modelPath: resolvedModelPath,
      seedPath: options.seedPath,
      result,
    },
  };
}
