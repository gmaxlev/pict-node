import { isRecord, isPositiveNumber } from "../utils";

const WEIGHT_OPERATOR: unique symbol = Symbol("WEIGHT_OPERATOR");

export interface WeightOperatorObject<T extends unknown> {
  [WEIGHT_OPERATOR]: T;
  getValue: () => T;
  getWeight: () => number;
}

export function weight<T extends unknown>(value: T, weight: number) {
  if (!isPositiveNumber(weight)) {
    throw new Error("Weight must be a positive number");
  }

  return {
    [WEIGHT_OPERATOR]: value,
    getValue: () => value,
    getWeight: () => weight,
  };
}

export function isWeightOperator(
  value: unknown
): value is WeightOperatorObject<unknown> {
  return isRecord(value) && WEIGHT_OPERATOR in value;
}
