import { ModelBuilder } from "../src/common/ModelBuilder";
import { EXCLUDE_TYPES, NOT_NUMBER_TYPES, NOT_STRING_TYPES } from "./utils";
import { EOL } from "os";

describe("ModelBuilder", () => {
  let instance: ModelBuilder;

  beforeEach(() => {
    instance = new ModelBuilder();
  });

  test("Should create an instance", () => {
    expect(instance).toBeInstanceOf(ModelBuilder);
  });

  test("Should return a separator with no provided them to the constructor", () => {
    const separators = instance.getSeparators();
    expect(separators.aliasSeparator).toBe("|");
    expect(separators.valueSeparator).toBe(",");
    expect(separators.negativePrefix).toBe("~");
  });

  test("Should return a separator with provided them to the constructor", () => {
    const builder = new ModelBuilder({
      aliasSeparator: "?",
    });
    const separators = builder.getSeparators();
    expect(separators.aliasSeparator).toBe("?");
    expect(separators.valueSeparator).toBe(",");
    expect(separators.negativePrefix).toBe("~");
  });

  test("Should return a separator with provided them to the constructor", () => {
    const builder = new ModelBuilder({
      aliasSeparator: "?",
    });
    const separators = builder.getSeparators();
    expect(separators.aliasSeparator).toBe("?");
    expect(separators.valueSeparator).toBe(",");
    expect(separators.negativePrefix).toBe("~");
  });

  test("Should throw an error if the provided separator is not a string", () => {
    for (const notString of EXCLUDE_TYPES(["string", "undefined"])) {
      const invalidOptions = {
        aliasSeparator: notString,
      };

      // @ts-expect-error
      const act = () => new ModelBuilder(invalidOptions);

      const result = expect(act);

      result.toThrowError("Separator must be a string");
    }
  });

  test("Should throw an error if the provided separator is not a one character string", () => {
    const notOneCharacterStrings = ["", "  ", "??", "???"];

    for (const wrongItem of notOneCharacterStrings) {
      const invalidOptions = {
        aliasSeparator: wrongItem,
      };

      const act = () => new ModelBuilder(invalidOptions);

      const result = expect(act);

      result.toThrowError("Separator must be a single character");
    }
  });

  test("Should throw an error if the provided values is not a string using addParameter()", () => {
    for (const notString of NOT_STRING_TYPES) {
      // @ts-expect-error
      const act = () => instance.addParameter("key", notString);

      const result = expect(act);

      result.toThrowError("Value must be a string");
    }

    for (const notString of NOT_STRING_TYPES) {
      // @ts-expect-error
      const act = () => instance.addParameter(notString, "value");

      const result = expect(act);

      result.toThrowError("Value must be a string");
    }
  });

  test("Should throw an error if the provided values is not a string using addAliasParameter()", () => {
    for (const notString of NOT_STRING_TYPES) {
      const act = () =>
        // @ts-expect-error
        instance.addAliasParameter("key", ["string", notString]);

      const result = expect(act);

      result.toThrowError("Value must be a string");
    }

    for (const notString of NOT_STRING_TYPES) {
      const act = () =>
        // @ts-expect-error
        instance.addAliasParameter(notString, ["value", "_value_"]);

      const result = expect(act);

      result.toThrowError("Value must be a string");
    }
  });

  test("Should throw an error if the provided values is not a string using addNegativeParameter()", () => {
    for (const notString of NOT_STRING_TYPES) {
      // @ts-expect-error
      const act = () => instance.addNegativeParameter("key", notString);

      const result = expect(act);

      result.toThrowError("Value must be a string");
    }

    for (const notString of NOT_STRING_TYPES) {
      // @ts-expect-error
      const act = () => instance.addNegativeParameter(notString, "value");

      const result = expect(act);

      result.toThrowError("Value must be a string");
    }
  });

  test("Should throw an error if the provided values is not a string using addParameterWithWeight()", () => {
    for (const notString of NOT_STRING_TYPES) {
      // @ts-expect-error
      const act = () => instance.addParameterWithWeight("key", notString, 1);

      const result = expect(act);

      result.toThrowError("Value must be a string");
    }

    for (const notString of NOT_STRING_TYPES) {
      // @ts-expect-error
      const act = () => instance.addParameterWithWeight(notString, "value", 1);

      const result = expect(act);

      result.toThrowError("Value must be a string");
    }
  });

  test("Should throw an error is the provided weight is not a number using addParameterWithWeight()", () => {
    for (const notNumber of NOT_NUMBER_TYPES) {
      const act = () =>
        // @ts-expect-error
        instance.addParameterWithWeight("key", "value", notNumber);

      const result = expect(act);

      result.toThrowError("Weight must be a number");
    }
  });

  test("Should throw an error is the provided parameter to addSubModel() does not exist", () => {
    const key1 = "key1";
    const key2 = "key2";
    const key3 = "key3";
    const key4 = "key4";
    const invalidKey = "invalidKey";

    {
      const localKey = key1;

      instance.addParameter(localKey, "value");

      const act = () => instance.addSubModel([invalidKey], 2);

      const result = expect(act);

      result.toThrowError(`Parameter "${invalidKey}" is not defined`);
    }

    {
      const localKey = key2;

      instance.addNegativeParameter(localKey, "value");

      const act = () => instance.addSubModel([invalidKey], 2);

      const result = expect(act);

      result.toThrowError(`Parameter "${invalidKey}" is not defined`);
    }

    {
      const localKey = key3;

      instance.addAliasParameter(localKey, ["value", "v_a_l_u_e"]);

      const act = () => instance.addSubModel([invalidKey], 2);

      const result = expect(act);

      result.toThrowError(`Parameter "${invalidKey}" is not defined`);
    }

    {
      const localKey = key4;

      instance.addParameterWithWeight(localKey, "value", 1);

      const act = () => instance.addSubModel([invalidKey], 2);

      const result = expect(act);

      result.toThrowError(`Parameter "${invalidKey}" is not defined`);
    }
  });

  test("Should throw an error if provided values includes separators using addParameter()", () => {
    const aliasSeparator = "?";

    const instance = new ModelBuilder({
      aliasSeparator,
    });

    {
      const act = () =>
        instance.addParameter("key", `value${aliasSeparator}value`);

      const result = expect(act);

      result.toThrowError(`Value cannot contain the alias separator`);
    }

    {
      const act = () =>
        instance.addParameter(`key${aliasSeparator}key`, `value`);

      const result = expect(act);

      result.toThrowError(`Value cannot contain the alias separator`);
    }
  });

  test("Should throw an error if provided values includes separators using addAliasParameter()", () => {
    const aliasSeparator = "?";

    const instance = new ModelBuilder({
      aliasSeparator,
    });

    {
      const act = () =>
        instance.addAliasParameter("key", [
          `value${aliasSeparator}value`,
          "validValue",
        ]);

      const result = expect(act);

      result.toThrowError(`Value cannot contain the alias separator`);
    }

    {
      const act = () =>
        instance.addAliasParameter(`key${aliasSeparator}key`, [
          "value1",
          "value2",
        ]);

      const result = expect(act);

      result.toThrowError(`Value cannot contain the alias separator`);
    }
  });

  test("Should throw an error if provided values includes separators using addNegativeParameter()", () => {
    const aliasSeparator = "?";

    const instance = new ModelBuilder({
      aliasSeparator,
    });

    {
      const act = () =>
        instance.addNegativeParameter("key", `value${aliasSeparator}value`);

      const result = expect(act);

      result.toThrowError(`Value cannot contain the alias separator`);
    }

    {
      const act = () =>
        instance.addNegativeParameter(`key${aliasSeparator}key`, "value");

      const result = expect(act);

      result.toThrowError(`Value cannot contain the alias separator`);
    }
  });

  test("Should throw an error if provided values includes separators using addParameterWithWeight()", () => {
    const aliasSeparator = "?";

    const instance = new ModelBuilder({
      aliasSeparator,
    });

    {
      const act = () =>
        instance.addParameterWithWeight(
          "key",
          `value${aliasSeparator}value`,
          2
        );

      const result = expect(act);

      result.toThrowError(`Value cannot contain the alias separator`);
    }

    {
      const act = () =>
        instance.addParameterWithWeight(`key${aliasSeparator}key`, "value", 2);

      const result = expect(act);

      result.toThrowError(`Value cannot contain the alias separator`);
    }
  });

  test('Should return valid model"', () => {
    instance.addParameter("A", "1");
    instance.addParameter("A", "2");
    instance.addParameter("B", "3");
    instance.addParameter("B", "4");

    const result = instance.getModelText();

    expect(result).toBe(`A:1,2${EOL}B:3,4`);
  });

  test('Should delete \\n and \\t from values return valid model"', () => {
    instance.addParameter(
      "A",
      ` 
    
    1 one 
    
            `
    );
    instance.addParameter("A", "2");
    instance.addParameter(
      ` 
    
    B
    
            `,
      "3"
    );
    instance.addParameter("B", "4");

    const result = instance.getModelText();

    expect(result).toBe(`A:1 one,2${EOL}B:3,4`);
  });

  test('Should return valid model using sub models"', () => {
    instance.addParameter("A", "1");
    instance.addParameter("A", "2");
    instance.addParameter("B", "3");
    instance.addParameter("B", "4");
    instance.addParameter("C", "5");
    instance.addParameter("C", "6");
    instance.addParameter("D", "7");
    instance.addParameter("D", "8");

    instance.addSubModel(["A", "B"], 2);
    instance.addSubModel(["C", "D"]);

    const result = instance.getModelText();

    expect(result).toBe(
      `A:1,2${EOL}B:3,4${EOL}C:5,6${EOL}D:7,8${EOL}{A,B}@2${EOL}{C,D}`
    );
  });

  test('Should return valid model using constraints"', () => {
    instance.addParameter("A", "1");
    instance.addParameter("A", "2");
    instance.addParameter("B", "3");
    instance.addParameter("B", "4");
    instance.addParameter("C", "5");
    instance.addParameter("C", "6");
    instance.addParameter("D", "7");
    instance.addParameter("D", "8");

    instance.addSubModel(["A", "B"], 2);
    instance.addSubModel(["C", "D"]);
    instance.addConstraint('IF [A] = "1"   THEN [B] <= 4;');

    const result = instance.getModelText();

    expect(result).toBe(
      `A:1,2${EOL}B:3,4${EOL}C:5,6${EOL}D:7,8${EOL}{A,B}@2${EOL}{C,D}${EOL}IF [A] = "1"   THEN [B] <= 4;`
    );
  });

  test('Should return valid model using constraints and tests with negative, weight, alias features"', () => {
    instance.addParameterWithWeight("A", "1", 2);
    instance.addParameter("A", "2");
    instance.addParameter("B", "3");
    instance.addParameter("B", "4");
    instance.addAliasParameter("C", ["5", "five"]);
    instance.addParameter("C", "6");
    instance.addNegativeParameter("C", "9");
    instance.addParameter("D", "7");
    instance.addParameter("D", "8");

    instance.addSubModel(["A", "B"], 2);
    instance.addSubModel(["C", "D"]);
    instance.addConstraint('IF [A] = "1"   THEN [B] <= 4;');

    const result = instance.getModelText();

    expect(result).toBe(
      `A:1(2),2${EOL}B:3,4${EOL}C:5|five,6,~9${EOL}D:7,8${EOL}{A,B}@2${EOL}{C,D}${EOL}IF [A] = "1"   THEN [B] <= 4;`
    );
  });
});
