import type { UnionToIntersection } from "type-fest";
import { ModelBuilder } from "./ModelBuilder";
import { isAliasOperator } from "./operators/alias";
import {
  isNegativeOperator,
  NegativeOperatorObject,
} from "./operators/negative";
import type { AliasOperatorObject } from "./operators/alias";
import {
  callPictBinary,
  iteratePictResult,
  savePictModelToFile,
} from "./builder";
import { isUndefined } from "./types";
import type { WeightOperatorObject } from "./operators/weight";
import { isWeightOperator } from "./operators/weight";

interface Model {
  name: PropertyKey;
  values: ReadonlyArray<unknown>;
}

/**
 * Receives a parameter values and unpack values from operators into top level
 *
 * For example, we have the following values:
 * [1, alias([2,3]), 4]]
 *
 * Without this type, the result would be:
 * [1, { [ALIAS_OPERATOR]: values }, 4]
 *
 * PICT will return "2" and "3" separately,
 * so we need to unpack the values from the operator to make it like usual values.
 *
 * The inferred type from above example will be:
 * 1 | 2 | 3 | 4
 */
type UnpackOperatorValues<ParameterValues> =
  ParameterValues extends ReadonlyArray<infer ParameterValuesItem>
    ? ParameterValuesItem extends AliasOperatorObject<
        infer ValueFromAliasOperator
      >
      ? ValueFromAliasOperator[number]
      : ParameterValuesItem extends NegativeOperatorObject<
          infer ValueFromNegativeOperator
        >
      ? ValueFromNegativeOperator
      : ParameterValuesItem extends WeightOperatorObject<
          infer ValueFromNegativeOperator
        >
      ? ValueFromNegativeOperator
      : ParameterValuesItem
    : never;

/**
 * Receives a Model and returns a Record type with the key from the model and union values from the model
 *
 * For example, we have the following model:
 *
 * {
 *     key: "size",
 *     values: [1, 2, 3]
 * }
 *
 * The inferred type from above example will be:
 * {
 *     key: 1 | 2 | 3
 * }
 */
type ModelToRecord<ModelArg> = ModelArg extends infer ModelArgInfer
  ? ModelArgInfer extends Model
    ? Record<
        ModelArgInfer["name"],
        UnpackOperatorValues<ModelArgInfer["values"]>
      >
    : never
  : never;

/**
 * Receives a Model array and returns a Record type with the key from the model and union values from the model
 *
 * For example, we have the following model:
 * [
 *  {
 *     key: "os",
 *     values: ["Windows", "Ubuntu", alias(["MacOS", "iOS"])
 *  }
 * ],
 * [
 *  {
 *     key: "device",
 *     values: ["Desktop", "Mobile"]
 *  }
 * ],
 *
 * The inferred type from above example will be:
 * {
 *     os: "Windows" | "Ubuntu" | "MacOS" | "iOS",
 *     device: "Desktop" | "Mobile"
 * }
 */
type ModelsToRecord<ModelArg> = UnionToIntersection<
  ModelArg extends infer ModelArgInfer
    ? ModelArgInfer extends ReadonlyArray<Model>
      ? ModelArgInfer[number] extends infer ModelItem
        ? ModelItem extends Model
          ? ModelToRecord<ModelItem>
          : never
        : never
      : never
    : never
>;

type SubModel<K extends PropertyKey> = {
  keys: ReadonlyArray<K>;
  order?: number;
};

export async function make<M extends ReadonlyArray<Model>>(
  model: {
    model: M;
    sub?: ReadonlyArray<SubModel<M[number]["name"]>>;
  },
  options?: {
    order: number;
  }
): Promise<Array<ModelsToRecord<M>>> {
  const modelBuilder = new ModelBuilder();
  const parameterNameToIdMap = new Map<PropertyKey, number>();
  const idToValueMap = new Map<string, unknown>();

  for (const [paramIndex, paramItem] of model.model.entries()) {
    parameterNameToIdMap.set(paramItem.name, paramIndex);

    let valueId = 0;
    const getUniqId = () => `${paramIndex}.${valueId}`;
    const getValueIdAndIncrement = () => valueId++;

    for (const valueItem of paramItem.values) {
      if (isAliasOperator(valueItem)) {
        const transform = valueItem.getValues().map((aliasValueItem) => {
          idToValueMap.set(getUniqId(), aliasValueItem);
          return getValueIdAndIncrement();
        });
        modelBuilder.addAliasParameter(paramIndex, transform);
        continue;
      }

      if (isNegativeOperator(valueItem)) {
        idToValueMap.set(getUniqId(), valueItem.getValue());
        modelBuilder.addNegativeParameter(paramIndex, getValueIdAndIncrement());
        continue;
      }

      if (isWeightOperator(valueItem)) {
        idToValueMap.set(getUniqId(), valueItem.getValue());
        modelBuilder.addParameterWithWeight(
          paramIndex,
          getValueIdAndIncrement(),
          valueItem.getWeight()
        );
        continue;
      }

      idToValueMap.set(getUniqId(), valueItem);
      modelBuilder.addParameter(paramIndex, getValueIdAndIncrement());
    }
  }

  if (model.sub) {
    for (const subModelItem of model.sub) {
      const indexArray = subModelItem.keys.map((key) => {
        const value = parameterNameToIdMap.get(key);

        if (isUndefined(value)) {
          throw new Error("System error. This shouldn't have happened!");
        }

        return value;
      });
      modelBuilder.addSubModel(indexArray, subModelItem.order);
    }
  }

  const modelText = modelBuilder.getModelText();

  const file = await savePictModelToFile(modelText);

  let result = callPictBinary(file.path);

  const finish: any = [];

  iteratePictResult(
    result,
    (rowName, rowIndex, parameterName, parameterIndex) => {
      if (parameterIndex === 0) {
        finish.push({});
      }

      const current = finish[finish.length - 1];

      const modelParameter = model.model[Number(rowName)] as Model;
      const key = modelParameter.name;

      const formatParameterName = parameterName.replace("~", "");

      current[key] = idToValueMap.get(
        `${rowName}.${formatParameterName}`
      ) as any;
    }
  );

  return finish as unknown as Promise<Array<ModelsToRecord<M>>>;
}
