import fsp from "fs/promises";
import * as temp from "temp";

/**
 * Creates a temporary file and writes the content to it.
 * @returns The path to the temporary file and a cleanup function.
 */
export async function writeTempFile(content: string) {
  const file = temp.openSync();

  await fsp.writeFile(file.path, content);

  return file;
}

export type TypeGuard<T> = {
  (value: unknown): value is T;
  assert: (value: unknown, before?: string) => asserts value is T;
};

export function createTypeGuard<T>(
  description: string,
  guard: (value: unknown) => value is T
) {
  function check(value: unknown) {
    return guard(value);
  }

  check.assert = function (
    value: unknown,
    before?: string
  ): asserts value is T {
    if (!guard(value)) {
      const message = before ? `${before}: ${description}` : description;
      throw new TypeError(message);
    }
  };

  return check as TypeGuard<T>;
}

export const isRecord: TypeGuard<Record<PropertyKey, unknown>> =
  createTypeGuard("must be an object", function (value): value is Record<
    PropertyKey,
    unknown
  > {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  });

export const isPropertyKey: TypeGuard<PropertyKey> = createTypeGuard(
  "must be a string, number or symbol",
  (value): value is PropertyKey => {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "symbol"
    );
  }
);

export const isNumber: TypeGuard<number> = createTypeGuard(
  "must be a number",
  (value): value is number => {
    return typeof value === "number";
  }
);

export const isPositiveNumber: TypeGuard<number> = createTypeGuard(
  "must be a positive number",
  (value): value is number => {
    return isNumber(value) && value > 0;
  }
);

export const isBoolean: TypeGuard<boolean> = createTypeGuard(
  "must be a boolean",
  (value): value is boolean => {
    return typeof value === "boolean";
  }
);

export const isString: TypeGuard<string> = createTypeGuard(
  "must be a string",
  (value): value is string => {
    return typeof value === "string";
  }
);

export const isUndefined: TypeGuard<undefined> = createTypeGuard(
  "must be undefined",
  (value): value is undefined => {
    return typeof value === "undefined";
  }
);

export const isBuffer: TypeGuard<Buffer> = createTypeGuard(
  "must be a Buffer",
  (value): value is Buffer => {
    return value instanceof Buffer;
  }
);

export const isArray: TypeGuard<Array<unknown>> = createTypeGuard(
  "must be an array",
  (value): value is Array<unknown> => {
    return Array.isArray(value);
  }
);
