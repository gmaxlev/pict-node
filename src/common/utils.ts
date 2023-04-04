import fsp from "fs/promises";
import * as temp from "temp";
import { createTypeGuard, TypeGuard, isNumber } from "tsguarder";

/**
 * Creates a temporary file and writes the content to it.
 * @returns The path to the temporary file and a cleanup function.
 */
export async function writeTempFile(content: string) {
  const file = temp.openSync();

  await fsp.writeFile(file.path, content);

  return file;
}

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

export const isPositiveNumber: TypeGuard<number> = createTypeGuard(
  "must be a positive number",
  (value): value is number => {
    return isNumber(value) && value > 0;
  }
);

export const isBuffer: TypeGuard<Buffer> = createTypeGuard(
  "must be a Buffer",
  (value): value is Buffer => {
    return value instanceof Buffer;
  }
);
