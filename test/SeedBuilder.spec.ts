import { SeedBuilder } from "../src/common/SeedBuilder";
import { NOT_STRING_TYPES } from "./utils";
import { EOL } from "os";

describe("SeedBuilder", () => {
  let instance: SeedBuilder;

  beforeEach(() => {
    instance = new SeedBuilder();
  });

  test("Should create an instance", () => {
    const instance = new SeedBuilder();
    expect(instance).toBeInstanceOf(SeedBuilder);
  });

  describe("add()", () => {
    test("Should throw an error on an empty object", () => {
      const act = () => instance.add({});

      expect(act).toThrowError("Values must not be an empty object");
    });

    test("Should throw an error if value is not a string", () => {
      for (const notString of NOT_STRING_TYPES) {
        const act = () =>
          instance.add({
            // @ts-expect-error
            ["key"]: notString,
          });

        expect(act).toThrowError("Value must be a string");
      }
    });
  });

  describe("getString()", () => {
    test("Should return PICT sub model text", () => {
      instance.add({
        A: "1",
        B: "3",
        C: "7",
      });

      instance.add({
        A: "4",
        C: "6",
      });

      instance.add({
        A: "100",
        X: "50",
      });

      const result = instance.getString();
      expect(result).toBe(
        `A\tB\tC\tX${EOL}1\t3\t7\t${EOL}4\t\t6\t${EOL}100\t\t\t50`
      );
    });
  });
});
