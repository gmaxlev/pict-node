import { SeedBuilder } from "../common/SeedBuilder";
import { NOT_STRING_TYPES } from "./utils";

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
    test('Should throw an error if "parameter" is not a string', () => {
      for (const notString of NOT_STRING_TYPES) {
        // @ts-expect-error
        const act = () => instance.add(notString, "value");

        expect(act).toThrowError("Parameter must be a string");
      }
    });

    test('Should throw an error if "value" is not a string', () => {
      for (const notString of NOT_STRING_TYPES) {
        // @ts-expect-error
        const act = () => instance.add("parameter", notString);

        expect(act).toThrowError("Value must be a string");
      }
    });
  });

  describe("getString()", () => {
    test("Should return PICT sub model text", () => {
      instance.add("A", "1");
      instance.add("A", "2");
      instance.add("B", "3");
      instance.add("C", "7");
      const result = instance.getString();
      expect(result).toBe("A\tB\tC\n1\t3\t7\n2");
    });
    test("Should return PICT sub model text", () => {
      instance.add("A", "1");
      instance.add("B", "2");
      instance.add("B", "3");
      instance.add("C", "4");
      instance.add("C", "5");
      instance.add("C", "6");
      const result = instance.getString();
      expect(result).toBe("A\tB\tC\n1\t2\t4\t3\t5\t6");
    });
  });
});
