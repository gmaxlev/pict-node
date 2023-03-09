import type { AliasOperatorObject } from "../operators/alias";
import type { NegativeOperatorObject } from "../operators/negative";
import type { WeightOperatorObject } from "../operators/weight";
import type { UnionToIntersection } from "type-fest";

export type PictModelId = string;

export interface InputPictTypedModel {
  name: PropertyKey;
  values: ReadonlyArray<unknown>;
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

type PictTypedModelToRecord<ModelArg> = ModelArg extends infer ModelArgInfer
  ? ModelArgInfer extends InputPictTypedModel
    ? Record<
        ModelArgInfer["name"],
        ExtractParameterValue<ModelArgInfer["values"]>
      >
    : never
  : never;

export type InputPictTypedSubModels<
  M extends ReadonlyArray<InputPictTypedModel>
> = ReadonlyArray<{
  keys: ReadonlyArray<M[number]["name"]>;
  order?: number;
}>;

export type InputPictTypedSeed<
  M extends ReadonlyArray<InputPictTypedModel>,
  T = Partial<InputPictTypedModelToRecord<M>>
> = keyof T extends infer KeysInfer
  ? KeysInfer extends keyof T
    ? Partial<Record<KeysInfer, ReadonlyArray<T[KeysInfer]>>>
    : never
  : never;

export type InputPictTypedModelToRecord<ModelArg> = UnionToIntersection<
  ModelArg extends infer ModelArgInfer
    ? ModelArgInfer extends ReadonlyArray<InputPictTypedModel>
      ? ModelArgInfer[number] extends infer ModelItem
        ? ModelItem extends InputPictTypedModel
          ? PictTypedModelToRecord<ModelItem>
          : never
        : never
      : never
    : never
>;
