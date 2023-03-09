import { ModelBuilder } from "../common/ModelBuilder";
import { isAliasOperator } from "../operators/alias";
import { isNegativeOperator } from "../operators/negative";
import { isWeightOperator } from "../operators/weight";
import { ValuesIdMap } from "./ValuesIdMap";
import { ParameterValuesIdCounter } from "./ParameterValueIdCounter";
import type {
  InputPictTypedModelToRecord,
  InputPictTypedModel,
  InputPictTypedSeed,
  InputPictTypedSubModels,
} from "./types";
import { SeedBuilder } from "../common/SeedBuilder";
import { callPict, CallPictOptions, pictEntries } from "../builder";
import { isBoolean, isNumber, isRecord, isUndefined } from "../utils";

function createModel<M extends ReadonlyArray<InputPictTypedModel>>(
  models: M,
  subModels?: InputPictTypedSubModels<M>
) {
  const modelBuilder = new ModelBuilder();
  const valuesIdMap = new ValuesIdMap();
  const parameterValueIdCounter = new ParameterValuesIdCounter();

  for (const paramItem of models) {
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
          valuesIdMap.add(paramItem.name, paramId, value, id);
        });

        const aliasValuesIds = aliasValuesWithId.map((item) => item.id);
        modelBuilder.addAliasParameter(paramId, aliasValuesIds);

        continue;
      }

      const uniqueValueId = parameterValueIdCounter.nextValue();

      if (isNegativeOperator(valueItem)) {
        const value = valueItem.getValue();
        valuesIdMap.add(paramItem.name, paramId, value, uniqueValueId);
        modelBuilder.addNegativeParameter(paramId, uniqueValueId);
        continue;
      }

      if (isWeightOperator(valueItem)) {
        const value = valueItem.getValue();
        const weight = valueItem.getWeight();
        valuesIdMap.add(paramItem.name, paramId, value, uniqueValueId);
        modelBuilder.addParameterWithWeight(paramId, uniqueValueId, weight);
        continue;
      }

      valuesIdMap.add(paramItem.name, paramId, valueItem, uniqueValueId);
      modelBuilder.addParameter(paramId, uniqueValueId);
    }
  }

  if (subModels) {
    for (const subModelsItem of subModels) {
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

function createSeed<
  S extends InputPictTypedSeed<ReadonlyArray<InputPictTypedModel>>
>(seeds: S, valuesIdMap: ValuesIdMap) {
  const seedBuilder = new SeedBuilder();

  for (const key in seeds) {
    const parameters = seeds[key];

    if (!Array.isArray(parameters)) {
      throw new Error("Seed values must be an array");
    }

    parameters.forEach((value) => {
      const result = valuesIdMap.getParameterAndValueIdFromValues(key, value);
      seedBuilder.add(result.parameterId, result.valueId);
    });
  }

  return seedBuilder.getString();
}

function parseResult(
  result: string,
  valuesIdMap: ValuesIdMap
): Array<Record<PropertyKey, unknown>> {
  const cases: any[] = [];

  for (const item of pictEntries(result)) {
    let currentCase;

    if (item.valueIndex === 0) {
      currentCase = {};
      cases.push(currentCase);
    } else {
      currentCase = cases[cases.length - 1];
    }

    const from = valuesIdMap.idToValuesMap.get(item.value);

    if (!from) {
      throw new Error(`Can't find value by id ${item.value}`);
    }

    currentCase[from.parameter.name] = from.value;

    cases[cases.length - 1] = currentCase;
  }

  return cases;
}

export async function make<M extends ReadonlyArray<InputPictTypedModel>>(
  model: {
    model: M;
    sub?: InputPictTypedSubModels<M>;
    seed?: InputPictTypedSeed<M>;
  },
  options?: {
    order?: number;
    random?: boolean | number;
  }
): Promise<Array<InputPictTypedModelToRecord<M>>> {
  const { modelText, valuesIdMap } = createModel(model.model, model.sub);

  const binaryOptions: CallPictOptions = {
    modelText,
  };

  if (model.seed) {
    binaryOptions.seedText = createSeed(model.seed, valuesIdMap);
  }

  if (isRecord(options)) {
    if (isNumber(options.order)) {
      binaryOptions.order = options.order;
    }

    if (
      !isUndefined(options.random) &&
      ((isBoolean(options.random) && options.random) ||
        isNumber(options.random))
    ) {
      binaryOptions.random = options.random;
    }
  }

  const result = await callPict(binaryOptions);

  return parseResult(result, valuesIdMap) as Array<
    InputPictTypedModelToRecord<M>
  >;
}
