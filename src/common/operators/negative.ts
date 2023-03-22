import { isRecord } from "../utils";

export const NEGATIVE_OPERATOR: unique symbol = Symbol("NEGATIVE_OPERATOR");

export interface NegativeOperatorObject<T extends unknown> {
  [NEGATIVE_OPERATOR]: T;
  getValue: () => T;
}

export function negative<T extends unknown>(value: T) {
  return {
    [NEGATIVE_OPERATOR]: value,
    getValue: () => value,
  };
}

export function isNegativeOperator(
  value: unknown
): value is NegativeOperatorObject<unknown> {
  return isRecord(value) && NEGATIVE_OPERATOR in value;
}
