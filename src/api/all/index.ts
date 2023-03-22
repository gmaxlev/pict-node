import {
  isInputSeed,
  isRandomOption,
  InputPictModelToRecord,
  InputSeed,
  InputSubModel,
  RandomOption,
} from "../../common/types";
import type { PictTypedModel } from "./types";
import { callPict, CallPictOptions } from "../../common/pict";
import {
  isArray,
  isPositiveNumber,
  isRecord,
  isUndefined,
} from "../../common/utils";
import { createModel } from "./model";
import { createSeed } from "./seed";
import { parseResult } from "./parse";

interface AllOptions {
  order?: number;
  random?: RandomOption;
}

export async function all<M extends ReadonlyArray<PictTypedModel>>(
  model: {
    models: M;
    sub?: ReadonlyArray<InputSubModel<M>>;
    seed?: InputSeed<M>;
  },
  options?: AllOptions
) {
  const start = performance.now();

  isRecord.assert(model, "the first argument");
  isArray.assert(model.models, '"models"');

  if (model.models.length < 1) {
    throw new Error('"models" must contain at least 1 item');
  }

  if (!isUndefined(model.sub)) {
    isArray.assert(model.sub, '"sub"');
  }

  let validatedOptions: AllOptions = {};

  if (!isUndefined(options)) {
    isRecord.assert(options, "the second argument");
    validatedOptions = options;
  }

  const defaultOrder = Math.min(2, model.models.length);

  const { order = defaultOrder, random } = validatedOptions;

  isPositiveNumber.assert(order, '"order"');

  if (order > model.models.length) {
    throw new Error('"order" cannot be larger than number of parameters');
  }

  const { modelText, valuesIdMap } = createModel(model.models, model.sub);

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

  const result = await callPict(callPictOptions);

  const cases = parseResult(result, valuesIdMap) as Array<
    InputPictModelToRecord<M>
  >;

  const end = performance.now() - start;

  return {
    cases,
    length: cases.length,
    time: end,
    pict: {
      model: modelText,
      seed: callPictOptions.seedText,
    },
  };
}
