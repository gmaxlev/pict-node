import { isPositiveNumber, isRecord } from "../common/utils";
import { NOT_NUMBER_TYPES, NOT_RECORD_TYPES } from "./utils";

describe("utils.ts", () => {
  describe("isPositiveNumber()", () => {
    it("Should return true if the value is a positive number", () => {
      expect(isPositiveNumber(1)).toBe(true);
    });

    it("Should return false if the value is not a number", () => {
      for (const notNumber of NOT_NUMBER_TYPES) {
        expect(isPositiveNumber(notNumber)).toBe(false);
      }
    });

    it("Should return false if the value is a negative number", () => {
      expect(isPositiveNumber(-1)).toBe(false);
    });
  });

  describe("isRecord()", () => {
    it("Should return true if the value is a record", () => {
      expect(isRecord({})).toBe(true);
    });

    it("Should return false if the value is not a record", () => {
      for (const notRecord of NOT_RECORD_TYPES) {
        expect(isRecord(notRecord)).toBe(false);
      }
    });
  });
});
