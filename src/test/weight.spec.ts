import { NOT_ARRAY_TYPES, NOT_NUMBER_TYPES } from "./utils";
import { weight, WEIGHT_OPERATOR } from "../common/operators/weight";

describe('"weight" operator', () => {
  test('Should throw an error if "weight" is not provided', () => {
    for (const notNumber of NOT_NUMBER_TYPES) {
      // @ts-expect-error
      const act = () => weight("value");
      expect(act).toThrowError("Weight must be a positive number");
    }
  });

  test('Should throw an error if "weight" is not a number', () => {
    for (const notNumber of NOT_NUMBER_TYPES) {
      // @ts-expect-error
      const act = () => weight("value", notNumber);
      expect(act).toThrowError("Weight must be a positive number");
    }
  });

  test('Should throw an error if "weight" is not a positive number', () => {
    const notPositiveNumbers = [-1, -0.1, 0];
    for (const notPositiveNumber of notPositiveNumbers) {
      const act = () => weight("value", notPositiveNumber);
      expect(act).toThrowError("Weight must be a positive number");
    }
  });

  test('Should return an object with property "getValues" and "WEIGHT_OPERATOR" symbol', () => {
    const value = "value";
    const result = weight(value, 1);
    expect(result.getValue()).toBe(value);
    expect(result[WEIGHT_OPERATOR]).toBe(value);
  });
});
