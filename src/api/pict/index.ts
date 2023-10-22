import { isArray, isRecord, isUndefined } from "tsguarder";
import {
  isInputSeed,
  isRandomOption,
  InputPictModelToRecord,
  InputSeed,
  InputSubModel,
  RandomOption,
  PictNodeStatistics,
} from "../../common/types";
import type { PictTypedModel } from "./types";
import { callPict, CallPictOptions } from "../../common/pict";
import { isPositiveNumber } from "../../common/utils";
import { createModel } from "./model";
import { createSeed } from "./seed";
import { parseResult } from "./parse";
import { parseStatistics } from "../../common/statistics";
import { performance } from "perf_hooks";

interface PictOptions {
  order?: number;
  random?: RandomOption;
}

type Pict = {
  <M extends readonly PictTypedModel[]>(
    model: { model: M; sub?: readonly InputSubModel<M>[]; seed?: InputSeed<M> },
    options?: PictOptions
  ): Promise<InputPictModelToRecord<M>[]>;
  stats: <M extends readonly PictTypedModel[]>(
    model: { model: M; sub?: readonly InputSubModel<M>[]; seed?: InputSeed<M> },
    options?: PictOptions
  ) => Promise<PictNodeStatistics>;
};

export function prepare<M extends ReadonlyArray<PictTypedModel>>(
  model: {
    model: M;
    sub?: ReadonlyArray<InputSubModel<M>>;
    seed?: InputSeed<M>;
  },
  options?: PictOptions
) {
  isRecord.assert(model, "the first argument");
  isArray.assert(model.model, '"model"');

  if (model.model.length < 1) {
    throw new Error('"model" must contain at least 1 item');
  }

  if (!isUndefined(model.sub)) {
    isArray.assert(model.sub, '"sub"');
  }

  let validatedOptions: PictOptions = {};

  if (!isUndefined(options)) {
    isRecord.assert(options, "the second argument");
    validatedOptions = options;
  }

  const defaultOrder = Math.min(2, model.model.length);

  const { order = defaultOrder, random } = validatedOptions;

  isPositiveNumber.assert(order, '"order"');

  if (order > model.model.length) {
    throw new Error('"order" cannot be larger than number of parameters');
  }

  const { modelText, valuesIdMap } = createModel(model.model, model.sub);

  const callPictOptions: CallPictOptions = {
    modelText,
    options: {
      order,
    },
  };

  if (!isUndefined(random)) {
    isRandomOption.assert(random, "options.random");
    callPictOptions.options.random = random;
  }

  if (!isUndefined(model.seed)) {
    isInputSeed.assert(model.seed, '"seed"');
    callPictOptions.seedText = createSeed(model.seed, valuesIdMap);
  }

  return { callPictOptions, valuesIdMap };
}

export const pict: Pict = async function pict<
  M extends ReadonlyArray<PictTypedModel>
>(
  model: {
    model: M;
    sub?: ReadonlyArray<InputSubModel<M>>;
    seed?: InputSeed<M>;
  },
  options?: PictOptions
) {
  try {
    const { callPictOptions, valuesIdMap } = prepare(model, options);

    const result = await callPict(callPictOptions);

    return parseResult(result, valuesIdMap) as Array<InputPictModelToRecord<M>>;
  } catch (error) {
    console.error('Error while calling "pict" function.');
    throw error;
  }
};

pict.stats = async function stats<M extends ReadonlyArray<PictTypedModel>>(
  model: {
    model: M;
    sub?: ReadonlyArray<InputSubModel<M>>;
    seed?: InputSeed<M>;
  },
  options?: PictOptions
) {
  try {
    const start = performance.now();

    const { callPictOptions, valuesIdMap } = prepare(model, options);

    callPictOptions.options.statistics = true;

    const result = await callPict(callPictOptions);

    const end = performance.now() - start;

    return parseStatistics(result, end);
  } catch (error) {
    console.error('Error while calling "pict.stats" function.');
    throw error;
  }
};
