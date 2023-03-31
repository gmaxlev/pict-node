import type { AliasOperatorObject } from "./operators/alias";
import type { NegativeOperatorObject } from "./operators/negative";
import type { WeightOperatorObject } from "./operators/weight";
import type { UnionToIntersection } from "type-fest";
import {
  createTypeGuard,
  isNumber,
  isPositiveNumber,
  isRecord,
  isString,
  isUndefined,
  TypeGuard,
} from "./utils";

export interface PictCliOptions {
  order: number;
  random: RandomOption;
  aliasSeparator: string;
  valueSeparator: string;
  negativePrefix: string;
  caseSensitive: boolean;
  seeds: string;
}

export type PickPictCliOptions<T extends keyof PictCliOptions> = Pick<
  PictCliOptions,
  T
>;

export type PictModelId = string;

export interface PictModel<
  Key extends PropertyKey = PropertyKey,
  Values extends unknown = unknown
> {
  key: Key;
  values: ReadonlyArray<Values>;
}

type ExtractParameterValue<ParameterValues> =
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

type PictModelToRecord<ModelArg> = ModelArg extends infer ModelArgInfer
  ? ModelArgInfer extends PictModel
    ? Record<
        ModelArgInfer["key"],
        ExtractParameterValue<ModelArgInfer["values"]>
      >
    : never
  : never;

export type InputSubModel<M extends ReadonlyArray<PictModel>> = {
  keys: ReadonlyArray<M[number]["key"]>;
  order?: number;
};

export const isInputSubModel: TypeGuard<
  InputSubModel<ReadonlyArray<PictModel>>
> = createTypeGuard(
  "must be an type { keys: Array<PropertyKey>; order?: number }",
  (value: unknown): value is InputSubModel<ReadonlyArray<PictModel>> => {
    if (!isRecord(value)) {
      return false;
    }

    if (!Array.isArray(value["keys"])) {
      return false;
    }

    if (!isUndefined(value["order"]) && !isPositiveNumber(value["order"])) {
      return false;
    }

    return true;
  }
);

export type InputSeed<
  M extends ReadonlyArray<PictModel>,
  T = Partial<InputPictModelToRecord<M>>
> = keyof T extends infer KeysInfer
  ? KeysInfer extends keyof T
    ? Partial<Record<KeysInfer, ReadonlyArray<T[KeysInfer]>>>
    : never
  : never;

export const isInputSeed: TypeGuard<InputSeed<ReadonlyArray<PictModel>>> =
  createTypeGuard(
    "must be a type { [key: PropertyKey]: Array<unknown> }",
    (value: unknown): value is InputSeed<ReadonlyArray<PictModel>> =>
      isRecord(value)
  );

export type InputPictModelToRecord<ModelArg> = UnionToIntersection<
  ModelArg extends infer ModelArgInfer
    ? ModelArgInfer extends ReadonlyArray<PictModel>
      ? ModelArgInfer[number] extends infer ModelItem
        ? ModelItem extends PictModel
          ? PictModelToRecord<ModelItem>
          : never
        : never
      : never
    : never
>;

export type RandomOption = number | string | boolean;

export const isRandomOption: TypeGuard<RandomOption> = createTypeGuard(
  "must be a number or boolean",
  (value: unknown): value is RandomOption => isNumber(value) || value === true
);

export type ModelSeparator = string;

export const isModelSeparator: TypeGuard<ModelSeparator> = createTypeGuard(
  "must be a string containing a single character",
  (value: unknown): value is ModelSeparator => {
    return isString(value) && value.length === 1;
  }
);
