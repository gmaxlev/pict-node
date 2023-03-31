import {
  isInputSeed,
  isRandomOption,
  isModelSeparator,
  RandomOption,
  ModelSeparator,
  InputPictModelToRecord,
  InputSeed,
  InputSubModel,
} from "../../common/types";
import { callPict, CallPictOptions } from "../../common/pict";
import {
  isArray,
  isRecord,
  isUndefined,
  isPositiveNumber,
  isBoolean,
} from "../../common/utils";
import { createStringModel } from "./model";
import { createSeed } from "./seed";
import { parseResult } from "./parse";
import { PictStringModel, InputConstraints, isInputConstraints } from "./types";

export interface StringsOptions {
  order?: number;
  random?: RandomOption;
  aliasSeparator?: ModelSeparator;
  valueSeparator?: ModelSeparator;
  negativePrefix?: ModelSeparator;
  caseSensitive?: boolean;
}

export async function strings<M extends ReadonlyArray<PictStringModel>>(
  model: {
    model: M;
    sub?: ReadonlyArray<InputSubModel<M>>;
    seed?: InputSeed<M>;
    constraints?: InputConstraints;
  },
  options?: StringsOptions
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

    if (!isUndefined(model.constraints)) {
      isInputConstraints.assert(model.constraints, '"constraints"');
    }

    let validatedOptions: StringsOptions = {};

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

    if (!isUndefined(validatedOptions.aliasSeparator)) {
      isModelSeparator.assert(
        validatedOptions.aliasSeparator,
        '"aliasSeparator"'
      );
    }

    if (!isUndefined(validatedOptions.valueSeparator)) {
      isModelSeparator.assert(
        validatedOptions.valueSeparator,
        '"valueSeparator"'
      );
    }

    if (!isUndefined(validatedOptions.negativePrefix)) {
      isModelSeparator.assert(
        validatedOptions.negativePrefix,
        '"negativePrefix"'
      );
    }

    const { modelText, separators } = createStringModel({
      models: model.model,
      subModels: model.sub,
      constraints: model.constraints,
      aliasSeparator: validatedOptions?.aliasSeparator,
      valueSeparator: validatedOptions?.valueSeparator,
      negativePrefix: validatedOptions?.negativePrefix,
    });

    const callPictOptions: CallPictOptions = {
      modelText,
      options: {
        order,
        ...separators,
      },
    };

    if (!isUndefined(validatedOptions.caseSensitive)) {
      isBoolean.assert(validatedOptions.caseSensitive, '"caseSensitive"');
      callPictOptions.options.caseSensitive = validatedOptions.caseSensitive;
    }

    if (!isUndefined(random)) {
      isRandomOption.assert(random, "options.random");
      callPictOptions.options.random = random;
    }

    if (!isUndefined(model.seed)) {
      isInputSeed.assert(model.seed, '"seed"');
      callPictOptions.seedText = createSeed(model.seed, model.model);
    }

    const result = await callPict(callPictOptions);

    return parseResult(result) as Array<InputPictModelToRecord<M>>;
  } catch (error) {
    console.error('Error while calling "pict" function.');
    throw error;
  }
}
