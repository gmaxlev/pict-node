import { ValuesIdMap } from "../src/api/pict/ValuesIdMap";

describe("ValuesIdMap", () => {
  let instance: ValuesIdMap;

  beforeEach(() => {
    instance = new ValuesIdMap();
  });

  describe("add()", () => {
    test("Should throw an error if parameters value has already been added", () => {
      instance.add("param", "0", "value", "0.0");

      const act = () => instance.add("param", "0", "value", "0.0");

      const result = expect(act);

      result.toThrowError('Value "value" has already existed');
    });

    test("Should throw an error if parameters value id has already been added", () => {
      instance.add("param_1", "0", "value1", "0.0");

      const act = () => instance.add("param_2", "1", "value2", "0.0");

      const result = expect(act);

      result.toThrowError(`Id "0.0" has already existed`);
    });
  });

  describe("getParameterIdByParameterName()", () => {
    test("Should throw an error id parameter not found", () => {
      instance.add("key", "2", { a: "b" }, "1.0");

      const act = () => instance.getParameterIdByParameterName("_key");

      const result = expect(act);

      result.toThrowError(`Parameter "_key" has been not found`);
    });

    test("Should return parameters id", () => {
      const parameter = "param";
      const id = "0";

      instance.add(parameter, id, [1, 2, 3, 4, 5], "0.0");
      instance.add("other-parameter", "1", "value", "1.0");

      const result = instance.getParameterIdByParameterName(parameter);

      expect(result).toBe(id);
    });
  });

  describe("getValueByValueId()", () => {
    test("Should throw an error if value not found", () => {
      instance.add("parameter", "0", "value", "0.0");
      const act = () => instance.getValueByValueId("6.6");

      const result = expect(act);

      result.toThrowError('Value with id "6.6" not found');
    });

    test("Should return value", () => {
      const parameter = "param";
      const value = {
        SOME_PROPERTY: "SOME_VALUE",
      };
      const parameterId = "0";
      const id = "0.0";

      instance.add(parameter, parameterId, value, id);

      const result = instance.getValueByValueId(id);

      expect(result).toEqual({
        parameter: {
          id: parameterId,
          name: parameter,
        },
        value,
      });
    });
  });

  describe("getParameterAndValueIdFromValues()", () => {
    test("Should throw an error if parameter not found", () => {
      instance.add("parameter", "0", "value", "0.0");
      const act = () =>
        instance.getParameterAndValueIdFromValues("invalid-parameter", "value");

      const result = expect(act);

      result.toThrowError(`Parameter "invalid-parameter" has been not found`);
    });

    test("Should throw an error if value not found", () => {
      instance.add("parameter", "0", "value", "0.0");
      const act = () =>
        instance.getParameterAndValueIdFromValues("parameter", "invalid-value");

      const result = expect(act);

      result.toThrowError(`Value "invalid-value" has been not found`);
    });

    test("Should return parameter and value id", () => {
      const parameter = "param";
      const value = {
        SOME_PROPERTY: "SOME_VALUE",
      };
      const parameterId = "0";
      const id = "0.0";

      instance.add(parameter, parameterId, value, id);

      const result = instance.getParameterAndValueIdFromValues(
        parameter,
        value
      );

      expect(result).toEqual({
        parameterId,
        valueId: id,
      });
    });
  });
});
