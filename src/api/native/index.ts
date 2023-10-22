import { isUndefined, isBoolean, isRecord } from "tsguarder";
import { ModelSource, isModelSource } from "./types";
import type { CallPictOptions } from "./../../common/pict";
import { isPositiveNumber } from "./../../common/utils";
import {
  PictCliOptions,
  isRandomOption,
  isModelSeparator,
  PictNodeStatistics,
} from "../../common/types";
import { callPict } from "../../common/pict";
import { getModelFromSource } from "./utils";
import { parseResult } from "./parse";
import { performance } from "perf_hooks";
import { parseStatistics } from "../../common/statistics";

interface NativeOptions {
  model: ModelSource;
  seed?: ModelSource;
  options?: Partial<Omit<PictCliOptions, "seed" | "statistics">>;
}

type Native = {
  (options: NativeOptions): Promise<Record<string, string>[]>;
  stats: (options: NativeOptions) => Promise<PictNodeStatistics>;
};

function validate(options: NativeOptions) {
  isRecord.assert(options, "the first argument");
  isModelSource.assert(options.model, '"model"');

  if (!isUndefined(options.seed)) {
    isModelSource.assert(options.seed, '"seed"');
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

async function prepare(options: NativeOptions) {
  validate(options);

  const callPictOptions: CallPictOptions = {
    modelText: await getModelFromSource(options.model),
    options: {},
  };

  if (!isUndefined(options.seed)) {
    callPictOptions.seedText = await getModelFromSource(options.seed);
  }

  if (!isUndefined(options.options)) {
    callPictOptions.options = options.options;
  }

  return callPictOptions;
}

export const native: Native = async function native(options: NativeOptions) {
  try {
    const callPictOptions = await prepare(options);

    callPictOptions.options.statistics = false;

    const result = await callPict(callPictOptions);

    return parseResult(result);
  } catch (error) {
    console.error('Error while calling "native" function.');
    throw error;
  }
};

native.stats = async function native(options: NativeOptions) {
  try {
    const start = performance.now();

    const callPictOptions = await prepare(options);

    callPictOptions.options.statistics = true;

    const result = await callPict(callPictOptions);

    const end = performance.now() - start;

    return parseStatistics(result, end);
  } catch (error) {
    console.error('Error while calling "native.stats" function.');
    throw error;
  }
};
