import { isArray, isRecord, isUndefined } from "tsguarder";
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
import { isPositiveNumber } from "../../common/utils";
import { createModel } from "./model";
import { createSeed } from "./seed";
import { parseResult } from "./parse";

interface AllOptions {
  order?: number;
  random?: RandomOption;
}

export async function pict<M extends ReadonlyArray<PictTypedModel>>(
  model: {
    model: M;
    sub?: ReadonlyArray<InputSubModel<M>>;
    seed?: InputSeed<M>;
  },
  options?: AllOptions
) {
  try {
    isRecord.assert(model, "the first argument");
    isArray.assert(model.model, '"model"');

    if (model.model.length < 1) {
      throw new Error('"model" must contain at least 1 item');
    }

    if (!isUndefined(model.sub)) {
      isArray.assert(model.sub, '"sub"');
    }

    let validatedOptions: AllOptions = {};

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

    const result = await callPict(callPictOptions);

    return parseResult(result, valuesIdMap) as Array<InputPictModelToRecord<M>>;
  } catch (error) {
    console.error('Error while calling "pict" function.');
    throw error;
  }
}
