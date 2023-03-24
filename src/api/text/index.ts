import type { CallPictOptions } from "./../../common/pict";
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
import { isRecord } from "../../common/utils";
import { callPict, callPictBinary, pictEntries } from "../../common/pict";

interface FileOptions {
  model: string;
  seed?: string;
  options?: Partial<Omit<PictCliOptions, "seed">>;
}

function validate(options: FileOptions) {
  isRecord.assert(options, "the first argument");
  isString.assert(options.model, '"model"');

  if (!isUndefined(options.seed)) {
    isString.assert(options.seed, '"seed"');
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

export async function text(options: FileOptions) {
  const start = performance.now();

  validate(options);

  const callPictOptions: CallPictOptions = {
    modelText: options.model,
    options: {},
  };

  if (isString(options.seed)) {
    callPictOptions.seedText = options.seed;
  }

  if (isRecord(options.options)) {
    callPictOptions.options = options.options;
  }

  const result = await callPict(callPictOptions);

  const cases = parseResult(result);

  const end = performance.now() - start;

  return {
    cases,
    length: cases.length,
    time: end,
    pict: {
      model: options.model,
      seed: options.seed,
      result,
    },
  };
}
