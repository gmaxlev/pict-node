import {
  isPictStringModel,
  PictStringModel,
  CreateModelOptions,
} from "./types";
import { isString, isArray } from "../../common/utils";
import { ModelBuilder, ModelBuilderOptions } from "../../common/ModelBuilder";
import { isAliasOperator } from "../../common/operators/alias";
import { isNegativeOperator } from "../../common/operators/negative";
import { isWeightOperator } from "../../common/operators/weight";
import { isInputSubModel } from "../../common/types";

/**
 * Creates a model from the given user's input
 * @returns The PICT model text
 */
export function createStringModel<M extends ReadonlyArray<PictStringModel>>({
  models,
  subModels,
  constraints,
  aliasSeparator,
  valueSeparator,
  negativePrefix,
}: CreateModelOptions<M>) {
  const modelBuilderOptions: ModelBuilderOptions = {};

  if (isString(aliasSeparator)) {
    modelBuilderOptions.aliasSeparator = aliasSeparator;
  }

  if (isString(valueSeparator)) {
    modelBuilderOptions.valueSeparator = valueSeparator;
  }

  if (isString(negativePrefix)) {
    modelBuilderOptions.negativePrefix = negativePrefix;
  }

  const modelBuilder = new ModelBuilder(modelBuilderOptions);

  for (const paramIndex in models) {
    const paramItem = models[paramIndex];

    isPictStringModel.assert(paramItem, `model[${paramIndex}]`);

    const paramKey = paramItem.key;

    for (const valueIndex in paramItem.values) {
      const valueItem = paramItem.values[valueIndex];

      if (isAliasOperator(valueItem)) {
        const aliasValues = valueItem.getValues() as string[];

        aliasValues.forEach((aliasValueItem) => {
          isString.assert(
            aliasValueItem,
            `model[${paramIndex}].values[${valueIndex}]`
          );
        });

        modelBuilder.addAliasParameter(paramKey, aliasValues);

        continue;
      }

      if (isNegativeOperator(valueItem)) {
        const value = valueItem.getValue();
        isString.assert(value, `model[${paramIndex}].values[${valueIndex}]`);
        modelBuilder.addNegativeParameter(paramKey, value);
        continue;
      }

      if (isWeightOperator(valueItem)) {
        const value = valueItem.getValue();
        const weight = valueItem.getWeight();
        isString.assert(value, `model[${paramIndex}].values[${valueIndex}]`);
        modelBuilder.addParameterWithWeight(paramKey, value, weight);
        continue;
      }

      isString.assert(valueItem, `model[${paramIndex}].values[${valueIndex}]`);

      modelBuilder.addParameter(paramKey, valueItem);
    }
  }

  if (subModels) {
    for (const subModelIndex in subModels) {
      const subModelsItem = subModels[subModelIndex];
      isInputSubModel.assert(subModelsItem, `sub[${subModelIndex}]`);
      modelBuilder.addSubModel(subModelsItem.keys, subModelsItem.order);
    }
  }

  if (constraints) {
    const constraintsList = isArray(constraints) ? constraints : [constraints];
    for (const constraintIndex in constraintsList) {
      const constraintItem = constraintsList[constraintIndex];
      isString.assert(constraintItem, `constraints[${constraintIndex}]`);
      modelBuilder.addConstraint(constraintItem);
    }
  }

  return {
    modelText: modelBuilder.getModelText(),
    separators: modelBuilder.getSeparators(),
  };
}
