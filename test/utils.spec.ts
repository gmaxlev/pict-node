import { isPositiveNumber } from "../src/common/utils";
import { NOT_NUMBER_TYPES } from "./utils";

describe("utils.ts", () => {
  describe("isPositiveNumber()", () => {
    test("Should return true if the value is a positive number", () => {
      expect(isPositiveNumber(1)).toBe(true);
    });

    test("Should return false if the value is not a number", () => {
      for (const notNumber of NOT_NUMBER_TYPES) {
        expect(isPositiveNumber(notNumber)).toBe(false);
      }
    });

    test("Should return false if the value is a negative number", () => {
      expect(isPositiveNumber(-1)).toBe(false);
    });
  });
});
