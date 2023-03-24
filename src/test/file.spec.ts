import path from "path";
import { file } from "../api/file";
import {
  EXCLUDE_TYPES,
  NOT_RECORD_TYPES,
  NOT_STRING_TYPES,
  prepareForSnapshot,
} from "./utils";

describe("file()", () => {
  describe("Common Validation", () => {
    test("Should throw an error if the first argument is not a record", async () => {
      for (const notRecord of NOT_RECORD_TYPES) {
        // @ts-expect-error
        const act = async () => await file(notRecord);

        const result = expect(act);

        await result.rejects.toThrowError(
          "the first argument: must be an object"
        );
      }
    });
    test('Should throw an error if "modelPath" is not a string', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const act = async () =>
          await file({
            // @ts-expect-error
            modelPath: notString,
          });

        const result = expect(act);

        await result.rejects.toThrowError('"modelPath": must be a string');
      }
    });
    test('Should throw an error if "seedPath" is not undefined or a string', async () => {
      for (const notString of EXCLUDE_TYPES(["undefined", "string"])) {
        const act = async () =>
          await file({
            modelPath: "/path/to/model",
            // @ts-expect-error
            seedPath: notString,
          });

        const result = expect(act);

        await result.rejects.toThrowError('"seedPath": must be a string');
      }
    });
    test('Should throw an error if "options" is not undefined or a record', async () => {
      for (const notString of EXCLUDE_TYPES(["undefined", "record"])) {
        const act = async () =>
          await file({
            modelPath: "/path/to/model",
            // @ts-expect-error
            options: notString,
          });

        const result = expect(act);

        await result.rejects.toThrowError('"options": must be an object');
      }
    });
    test('Should throw an error if "options.order" is not a positive number', async () => {
      const invalidTypes = [...EXCLUDE_TYPES(["undefined", "number"]), -1, 0];
      for (const notNumber of invalidTypes) {
        const act = async () =>
          await file({
            modelPath: "/path/to/model",
            options: {
              // @ts-expect-error
              order: notNumber,
            },
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          '"options.order": must be a positive number'
        );
      }
    });
    test('Should throw an error if "random" has an invalid type', async () => {
      for (const invalidType of EXCLUDE_TYPES([
        "undefined",
        "string",
        "number",
        "boolean",
      ])) {
        const act = async () =>
          await file({
            modelPath: "/path/to/model",
            options: {
              // @ts-expect-error
              random: invalidType,
            },
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          '"options.random": must be a number, string or boolean'
        );
      }
    });
    test('Should throw an error if "caseSensitive" is not undefined or a boolean', async () => {
      for (const invalidType of EXCLUDE_TYPES(["undefined", "boolean"])) {
        const act = async () =>
          await file({
            modelPath: "/path/to/model",
            options: {
              // @ts-expect-error
              caseSensitive: invalidType,
            },
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          '"options.caseSensitive": must be a boolean'
        );
      }
    });
  });
  describe("Separators", () => {
    describe("Separators Validation", () => {
      const separators = [
        "aliasSeparator",
        "valueSeparator",
        "negativePrefix",
      ] as const;

      for (const separator of separators) {
        test(`Should throw an error if "${separator}" is not a string containing a single character`, async () => {
          for (const invalidType of EXCLUDE_TYPES(["string", "undefined"])) {
            const format = typeof invalidType === "string" ? ",," : invalidType;

            const act = async () =>
              await file({
                modelPath: "/path/to/model",
                options: {
                  [separator]: format,
                },
              });

            const result = expect(act);

            await result.rejects.toThrowError(
              `"options.${separator}": must be a string containing a single character`
            );
          }
        });
      }
    });
  });
  describe("Model", () => {
    test("Should throw an error if model path does not exist", async () => {
      const act = async () =>
        await file({
          modelPath: path.join(__dirname, "./models/_not_existing"),
        });

      const result = expect(act);

      await result.rejects.toThrow();
    });
    test("Should throw an error if model path does not exist", async () => {
      const act = async () =>
        await file({
          modelPath: path.join(__dirname, "./models/model"),
          seedPath: path.join(__dirname, "./models/_not_existing"),
        });

      const result = expect(act);

      await result.rejects.toThrow();
    });
  });
  describe("Cases", () => {
    test("The simple model", async () => {
      const modelPath = path.join(__dirname, "./models/model");

      const result = await file({
        modelPath,
      });
      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.pict).toEqual({
        modelPath,
        seedPath: undefined,
        result: "A\tB\n1\t4\n1\t3\n2\t4\n2\t3\n",
      });

      expect(result.length).toBe(4);

      expect(result.cases).toEqual([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: "2", B: "4" },
        { A: "2", B: "3" },
      ]);
    });
    test("The simple model with alias operator", async () => {
      const modelPath = path.join(__dirname, "./models/model-aliases");
      const result = await file({
        modelPath,
      });
      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.pict).toEqual({
        modelPath,
        seedPath: undefined,
        result: "A\tB\n1\t4\n1\t3\n2\t4\ntwo\t3\n",
      });

      expect(result.length).toBe(4);

      expect(result.cases).toEqual([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: "2", B: "4" },
        { A: "two", B: "3" },
      ]);
    });
    test("The simple model with negative operator", async () => {
      const modelPath = path.join(__dirname, "./models/model-negative");
      const result = await file({
        modelPath,
      });
      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.pict).toEqual({
        modelPath,
        seedPath: undefined,
        result:
          "A\tB\n0\t2\n0\t1\n1\t2\n2\t1\n1\t0\n2\t0\n1\t1\n2\t2\n0\t0\n0\t~-1\n1\t~-1\n~-1\t0\n~-1\t1\n2\t~-1\n~-1\t2\n",
      });

      expect(result.length).toBe(15);

      expect(result.cases).toEqual([
        { A: "0", B: "2" },
        { A: "0", B: "1" },
        { A: "1", B: "2" },
        { A: "2", B: "1" },
        { A: "1", B: "0" },
        { A: "2", B: "0" },
        { A: "1", B: "1" },
        { A: "2", B: "2" },
        { A: "0", B: "0" },
        { A: "0", B: "-1" },
        { A: "1", B: "-1" },
        { A: "-1", B: "0" },
        { A: "-1", B: "1" },
        { A: "2", B: "-1" },
        { A: "-1", B: "2" },
      ]);
    });
    test("The simple model with weight operator", async () => {
      const modelPath = path.join(__dirname, "./models/model-weight");

      const result = await file({
        modelPath,
      });

      expect(typeof result.time).toBe("number");

      expect(result.pict).toMatchObject({
        modelPath,
        seedPath: undefined,
      });

      expect(prepareForSnapshot(result)).toMatchSnapshot();
    });
    test("The large model with 2 order", async () => {
      const modelPath = path.join(__dirname, "./models/model-large");

      const result = await file({
        modelPath,
      });

      expect(typeof result.time).toBe("number");

      expect(result.pict).toMatchObject({
        modelPath,
        seedPath: undefined,
      });

      expect(prepareForSnapshot(result)).toMatchSnapshot();
    });
    test("The large model with all combinations", async () => {
      const modelPath = path.join(__dirname, "./models/model-large");

      const result = await file({
        modelPath,
        options: {
          order: 6,
        },
      });

      expect(typeof result.time).toBe("number");

      expect(result.pict).toMatchObject({
        modelPath,
        seedPath: undefined,
      });

      expect(prepareForSnapshot(result)).toMatchSnapshot();
    });
    test("The model with sub models", async () => {
      const modelPath = path.join(__dirname, "./models/model-submodels");

      const result = await file({
        modelPath,
      });

      expect(typeof result.time).toBe("number");

      expect(result.pict).toMatchObject({
        modelPath,
        seedPath: undefined,
      });

      expect(prepareForSnapshot(result)).toMatchSnapshot();
    });
    test("The model with seeding", async () => {
      const modelPath = path.join(__dirname, "./models/model-large");
      const seedPath = path.join(__dirname, "./models/model-large-seed");

      const result = await file({
        modelPath,
        seedPath,
      });

      expect(typeof result.time).toBe("number");

      expect(result.pict).toMatchObject({
        modelPath,
        seedPath,
      });

      expect(prepareForSnapshot(result)).toMatchSnapshot();
    });
  });
});
