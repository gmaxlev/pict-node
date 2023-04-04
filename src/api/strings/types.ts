import {
  createTypeGuard,
  TypeGuard,
  isString,
  isArray,
  isRecord,
} from "tsguarder";
import type { WeightOperatorObject } from "./../../common/operators/weight";
import type { NegativeOperatorObject } from "./../../common/operators/negative";
import type { AliasOperatorObject } from "./../../common/operators/alias";
import type { InputSubModel, PictModel } from "../../common/types";

export interface CreateModelOptions<M extends ReadonlyArray<PictStringModel>> {
  models: M;
  aliasSeparator?: string | undefined;
  valueSeparator?: string | undefined;
  negativePrefix?: string | undefined;
  subModels?: ReadonlyArray<InputSubModel<M>> | undefined;
  constraints?: InputConstraints | undefined;
}

export type InputConstraints = string | string[];

export const isInputConstraints: TypeGuard<InputConstraints> = createTypeGuard(
  "must be a string or an array of strings",
  (value: unknown): value is InputConstraints => {
    return isString(value) || isArray(value);
  }
);

export type PictStringModel = PictModel<
  string,
  | string
  | AliasOperatorObject<ReadonlyArray<string>>
  | NegativeOperatorObject<string>
  | WeightOperatorObject<string>
>;

export const isPictStringModel: TypeGuard<PictStringModel> = createTypeGuard(
  "must be a type { key: string, values: Array<string> }",
  (value: unknown): value is PictStringModel => {
    if (!isRecord(value)) {
      return false;
    }

    if (!isString(value["key"])) {
      return false;
    }

    if (!Array.isArray(value["values"])) {
      return false;
    }

    return true;
  }
);
