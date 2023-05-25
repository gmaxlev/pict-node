import { NOT_ARRAY_TYPES } from "./utils";
import { alias, ALIAS_OPERATOR } from "../src/common/operators/alias";

describe('"alias" operator', () => {
  test('Should throw an error if "values" is not an array', () => {
    for (const notArray of NOT_ARRAY_TYPES) {
      // @ts-expect-error
      const act = () => alias(notArray);
      expect(act).toThrowError("Alias values must be an array");
    }
  });

  test('Should return an object with property "getValues" and "ALIAS_OPERATOR" symbol', () => {
    const value = [1, "one"];

    const result = alias(value);
    expect(result.getValues()).toBe(value);
    expect(result[ALIAS_OPERATOR]).toBe(value);
  });
});
