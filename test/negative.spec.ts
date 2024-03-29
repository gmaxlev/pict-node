import { negative, NEGATIVE_OPERATOR } from "../src/common/operators/negative";

describe('"negative" operator', () => {
  test('Should return an object with property "getValues" and "NEGATIVE_OPERATOR" symbol', () => {
    const value = "value";

    const result = negative(value);
    expect(result.getValue()).toBe(value);
    expect(result[NEGATIVE_OPERATOR]).toBe(value);
  });
});
