import { isRecord } from "../types";

const ALIAS_OPERATOR: unique symbol = Symbol("ALIAS_OPERATOR");

export interface AliasOperatorObject<T extends ReadonlyArray<unknown>> {
  [ALIAS_OPERATOR]: T;
  getValues: () => T;
}

export function alias<T extends ReadonlyArray<unknown>>(values: T) {
  if (!Array.isArray(values)) {
    throw new Error("Alias values must be an array");
  }

  return {
    [ALIAS_OPERATOR]: values,
    getValues: () => values,
  };
}

export function isAliasOperator(
  value: unknown
): value is AliasOperatorObject<ReadonlyArray<unknown>> {
  return isRecord(value) && ALIAS_OPERATOR in value;
}
