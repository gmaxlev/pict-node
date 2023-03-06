export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isRecord(
  value: unknown
): value is Record<PropertyKey, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === "undefined";
}

export function isBuffer(value: unknown): value is Buffer {
  return value instanceof Buffer;
}

export interface PictCliOptions {
  // file: string;
  orderOfCombinations: number;
  // separatorForValues: string;
  // separatorForAliases: string;
  // negativeValuePrefix: string;
  random: boolean;
  caseSensitive: boolean;
  // statistics: boolean;
}

export type PickCliOptions<Key extends keyof PictCliOptions> = Pick<
  PictCliOptions,
  Key
>;
