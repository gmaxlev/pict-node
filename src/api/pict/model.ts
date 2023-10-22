import { isInputSubModel, InputSubModel } from "../../common/types";
import { ParameterValuesIdCounter } from "./ParameterValueIdCounter";
import { ValuesIdMap } from "./ValuesIdMap";
import { ModelBuilder } from "../../common/ModelBuilder";
import { PictTypedModel, isPictTypedModel } from "./types";
import { isAliasOperator } from "../../common/operators/alias";
import { isNegativeOperator } from "../../common/operators/negative";
import { isWeightOperator } from "../../common/operators/weight";

/**
 * Creates PICT model from user's input
 */
export function createModel<M extends ReadonlyArray<PictTypedModel>>(
  models: M,
  subModels?: ReadonlyArray<InputSubModel<M>>
) {
  const modelBuilder = new ModelBuilder();
  const valuesIdMap = new ValuesIdMap();
  const parameterValueIdCounter = new ParameterValuesIdCounter();

  for (const paramIndex in models) {
    const paramItem = models[paramIndex];

    isPictTypedModel.assert(paramItem, `model[${paramIndex}]`);

    const paramId = parameterValueIdCounter.nextParameter();

    for (const valueItem of paramItem.values) {
      if (isAliasOperator(valueItem)) {
        const aliasValuesWithId = valueItem
          .getValues()
          .map((aliasValueItem) => {
            const id = parameterValueIdCounter.nextValue();
            return {
              id,
              value: aliasValueItem,
            };
          });

        aliasValuesWithId.forEach(({ value, id }) => {
          valuesIdMap.add(paramItem.key, paramId, value, id);
        });

        const aliasValuesIds = aliasValuesWithId.map((item) => item.id);
        modelBuilder.addAliasParameter(paramId, aliasValuesIds);

        continue;
      }

      const uniqueValueId = parameterValueIdCounter.nextValue();

      if (isNegativeOperator(valueItem)) {
        const value = valueItem.getValue();
        valuesIdMap.add(paramItem.key, paramId, value, uniqueValueId);
        modelBuilder.addNegativeParameter(paramId, uniqueValueId);

        continue;
      }

      if (isWeightOperator(valueItem)) {
        const value = valueItem.getValue();
        const weight = valueItem.getWeight();
        valuesIdMap.add(paramItem.key, paramId, value, uniqueValueId);
        modelBuilder.addParameterWithWeight(paramId, uniqueValueId, weight);

        continue;
      }

      valuesIdMap.add(paramItem.key, paramId, valueItem, uniqueValueId);
      modelBuilder.addParameter(paramId, uniqueValueId);
    }
  }

  if (subModels) {
    for (const subModelIndex in subModels) {
      const subModelsItem = subModels[subModelIndex];

      isInputSubModel.assert(subModelsItem, `sub[${subModelIndex}]`);

      const indexArray = subModelsItem.keys.map((parameter) =>
        valuesIdMap.getParameterIdByParameterName(parameter)
      );
      modelBuilder.addSubModel(indexArray, subModelsItem.order);
    }
  }

  return {
    modelText: modelBuilder.getModelText(),
    valuesIdMap,
  };
}
