import type { PictStringModel } from "../api/strings/types";
import {
  NOT_RECORD_TYPES,
  NOT_ARRAY_TYPES,
  EXCLUDE_TYPES,
  NOT_STRING_TYPES,
  deleteTimeFromPictResult,
} from "./utils";
import { strings } from "../api/strings";
import type { InputSubModel } from "../common/types";
import { alias } from "../common/operators/alias";
import { negative } from "../common/operators/negative";
import { weight } from "../common/operators/weight";

describe("strings()", () => {
  describe("Common Validations", () => {
    test("Should throw an error if the first argument is not a record", async () => {
      for (const notRecord of NOT_RECORD_TYPES) {
        // @ts-expect-error
        const act = () => strings(notRecord);
        await expect(act).rejects.toThrowError(
          "the first argument: must be an object"
        );
      }
    });
    test("Should throw an error if the second argument is not a record or undefined", async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const notRecord of EXCLUDE_TYPES(["undefined", "record"])) {
        // @ts-expect-error
        const act = async () => await strings({ models }, notRecord);

        const result = expect(act);

        await result.rejects.toThrowError(
          "the second argument: must be an object"
        );
      }
    });
    test('Should throw an error if "order" is not undefined or a positive number', async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const invalidType of EXCLUDE_TYPES(["undefined", "number"])) {
        const act = async () =>
          await strings(
            {
              models,
            },
            {
              // @ts-expect-error
              order: invalidType,
            }
          );

        const result = expect(act);

        await result.rejects.toThrowError('"order": must be a positive number');
      }
    });
    test('Should throw an error if "order" is larger than number of parameters', async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
        {
          key: "C",
          values: ["5", "6"],
        },
      ] as const;

      const act = async () =>
        await strings(
          {
            models,
          },
          {
            order: 4,
          }
        );

      const result = expect(act);

      await result.rejects.toThrowError(
        '"order" cannot be larger than number of parameters'
      );
    });
    test('Should throw an error if "random" has an invalid type', async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const invalidType of EXCLUDE_TYPES([
        "undefined",
        "string",
        "number",
        "boolean",
      ])) {
        const act = async () =>
          await strings(
            {
              models,
            },
            {
              // @ts-expect-error
              random: invalidType,
            }
          );

        const result = expect(act);

        await result.rejects.toThrowError(
          "options.random: must be a number, string or boolean"
        );
      }
    });
    test('Should throw an error if "caseSensitive" is not undefined or a boolean', async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const invalidType of EXCLUDE_TYPES(["undefined", "boolean"])) {
        const act = async () =>
          await strings(
            {
              models,
            },
            {
              // @ts-expect-error
              caseSensitive: invalidType,
            }
          );

        const result = expect(act);

        await result.rejects.toThrowError('"caseSensitive": must be a boolean');
      }
    });
  });

  describe("Operators", () => {
    test('Should throw an error if "alias" does not contain a string value', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const models = [
          {
            key: "A",
            values: ["1", alias([notString, "two"] as const)],
          },
          {
            key: "B",
            values: ["3", "4"],
          },
        ] as const;

        const act = () =>
          strings({
            // @ts-expect-error
            models,
          });

        expect(act).rejects.toThrow("models[0].values[1]: must be a string");
      }
    });
    test('Should throw an error if "negative" does not contain a string value', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const models = [
          {
            key: "A",
            // @ts-expect-error
            values: [negative(notString as const), "1"],
          },
          {
            key: "B",
            values: ["3", "4"],
          },
        ] as const;

        const act = () =>
          strings({
            // @ts-expect-error
            models,
          });

        expect(act).rejects.toThrow("models[0].values[0]: must be a string");
      }
    });
    test('Should throw an error if "weight" does not contain a string value', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const models = [
          {
            key: "A",
            values: ["1", "2"],
          },
          {
            key: "B",
            // @ts-expect-error
            values: ["3", weight(notString as const, 10)],
          },
        ] as const;

        const act = () =>
          strings({
            // @ts-expect-error
            models,
          });

        expect(act).rejects.toThrow("models[1].values[1]: must be a string");
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
          const models = [
            {
              key: "A",
              values: ["1", "2"],
            },
            {
              key: "B",
              values: ["3", "4"],
            },
          ] as const;

          for (const invalidType of EXCLUDE_TYPES(["string", "undefined"])) {
            const format = typeof invalidType === "string" ? ",," : invalidType;

            const act = async () =>
              await strings(
                {
                  models,
                },
                {
                  [separator]: format,
                }
              );

            const result = expect(act);

            await result.rejects.toThrowError(
              `"${separator}": must be a string containing a single character`
            );
          }
        });
      }
    });
  });

  describe("Models", () => {
    test("Should throw an error if models is not an array", async () => {
      for (const notArray of NOT_ARRAY_TYPES) {
        const act = async () =>
          await strings({
            // @ts-expect-error
            models: notArray,
          });
        const result = expect(act);
        await result.rejects.toThrowError('"models": must be an array');
      }
    });
    test("Should throw an error if models is en empty array", async () => {
      const act = async () =>
        await strings({
          models: [],
        });

      const result = expect(act);
      await result.rejects.toThrowError(
        '"models" must contain at least 1 item'
      );
    });
    test("Should throw an error if models contain an invalid parameter", async () => {
      const models = [
        ...NOT_RECORD_TYPES.map((notRecord) => ({
          index: 0,
          models: [notRecord],
        })),
        ...NOT_STRING_TYPES.map((notString) => ({
          index: 0,
          models: [
            {
              key: notString,
              values: ["1", "2"],
            },
          ],
        })),
        ...NOT_ARRAY_TYPES.map((notArray) => ({
          index: 0,
          models: [
            {
              key: "key",
              values: notArray,
            },
          ],
        })),
        {
          index: 0,
          models: [{}],
        },
      ] as const;

      for (const item of models) {
        // @ts-expect-error
        const act = async () => await strings({ models: item.models });

        const result = expect(act);

        await result.rejects.toThrowError(
          `models[${item.index}]: must be a type { key: string, values: Array<string> }`
        );
      }
    });
    test("Should throw an error if parameter value is not a string", async () => {
      const models = [
        ...NOT_STRING_TYPES.map((notString) => ({
          parameterIndex: 0,
          valueIndex: 1,
          models: [
            {
              key: "key",
              values: ["1", notString],
            },
          ],
        })),
      ] as const;

      for (const item of models) {
        // @ts-expect-error
        const act = async () => await strings({ models: item.models });

        const result = expect(act);

        await result.rejects.toThrowError(
          `models[${item.parameterIndex}].values[${item.valueIndex}]: must be a string`
        );
      }
    });
  });

  describe("Sub Models", () => {
    test('Should throw an error if "sub" models is not undefined and an array', async () => {
      for (const notRecord of EXCLUDE_TYPES(["undefined", "array"])) {
        const models = [
          {
            key: "A",
            values: ["1", "2"],
          },
        ] as const;

        const act = async () =>
          await strings({
            models,
            // @ts-expect-error
            sub: notRecord,
          });
        const result = expect(act);
        await result.rejects.toThrowError('"sub": must be an array');
      }
    });
    test("Should throw an error if sub models contains a non-existent parameter", async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const act = async () =>
        await strings({
          models,
          sub: [
            {
              // @ts-expect-error
              keys: ["C"],
            },
          ],
        });

      const result = expect(act);

      await result.rejects.toThrowError(`Parameter "C" is not defined`);
    });
    test("Should throw an error if sub models contains an invalid type", async () => {
      const invalidSubModels: Array<{
        subModels: Array<InputSubModel<ReadonlyArray<PictStringModel>>>;
        index: number;
      }> = [
        // @ts-expect-error
        ...NOT_RECORD_TYPES.map((notRecord) => ({
          subModels: [notRecord],
          index: 0,
        })),
        // @ts-expect-error
        ...NOT_ARRAY_TYPES.map((notArray) => ({
          subModels: [
            {
              keys: notArray,
            },
          ],
          index: 0,
        })),
        // @ts-expect-error
        ...EXCLUDE_TYPES(["undefined", "number"]).map((notNumber) => ({
          subModels: [
            {
              keys: ["A", "B"],
              order: 2,
            },
            {
              keys: ["C", "D"],
              order: notNumber,
            },
          ],
          index: 1,
        })),
        {
          // @ts-expect-error
          subModels: [{}],
          index: 0,
        },
      ];

      for (const item of invalidSubModels) {
        const models = [
          {
            key: "A",
            values: ["1", "2"],
          },
          {
            key: "B",
            values: ["3", "4"],
          },
          {
            key: "C",
            values: ["5", "6"],
          },
          {
            key: "D",
            values: ["7", "8"],
          },
        ] as const;

        const act = async () =>
          await strings({
            models,
            sub: item.subModels,
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          `sub[${item.index}]: must be an type { keys: Array<PropertyKey>; order?: number }`
        );
      }
    });
  });

  describe("Seeding", () => {
    test('Should throw an error if "seed" is not a record', async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const invalidType of EXCLUDE_TYPES(["undefined", "record"])) {
        const act = async () =>
          await strings({
            models,
            // @ts-expect-error
            seed: invalidType,
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          `"seed": must be a type { [key: PropertyKey]: Array<PropertyKey> }`
        );
      }
    });
    test("Should throw an error if seed contains non-existing parameter", async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const act = async () =>
        await strings({
          models,
          seed: {
            // @ts-expect-error
            ["C"]: ["1"],
          },
        });

      const result = expect(act);

      await result.rejects.toThrowError(
        `The parameter "C" does not exist in the model`
      );
    });
    test("Should throw an error if seed parameter values is not an array", async () => {
      for (const notArray of NOT_ARRAY_TYPES) {
        const models = [
          {
            key: "A",
            values: ["1", "2"],
          },
          {
            key: "B",
            values: ["3", "4"],
          },
        ] as const;

        const act = async () =>
          await strings({
            models,
            seed: {
              // @ts-expect-error
              ["A"]: notArray,
            },
          });

        const result = expect(act);

        await result.rejects.toThrowError(`seeds[A]: must be an array`);
      }
    });
    test("Should throw an error if seed parameter value is not a string", async () => {
      for (const notString of NOT_STRING_TYPES) {
        const models = [
          {
            key: "A",
            values: ["1", "2"],
          },
          {
            key: "B",
            values: ["3", "4"],
          },
        ] as const;

        const act = async () =>
          await strings({
            models,
            seed: {
              // @ts-expect-error
              ["A"]: ["1", notString],
            },
          });

        const result = expect(act);

        await result.rejects.toThrowError(`seeds[A][1]: must be a string`);
      }
    });
    test("Should throw an error if seed parameter value is not in the model", async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const act = async () =>
        await strings({
          models,
          seed: {
            // @ts-expect-error
            ["A"]: ["1", "3"],
          },
        });

      const result = expect(act);

      await result.rejects.toThrowError(
        `The value "3" does not exist in the model for the parameter "A"`
      );
    });
  });

  describe("Constraints", () => {
    test(`Should throw an error if "constraints" in not an array or string`, async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const invalidType of EXCLUDE_TYPES([
        "array",
        "string",
        "undefined",
      ])) {
        const act = async () =>
          await strings({
            models,
            // @ts-expect-error
            constraints: invalidType,
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          `"constraints": must be a string or an array of strings`
        );
      }
    });
    test(`Should throw an error if "constraints" is an array containing non strings`, async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const notString of NOT_STRING_TYPES) {
        const act = async () =>
          await strings({
            models,
            constraints: [
              'IF [A] = "2" THEN [B] <= 3;',
              // @ts-expect-error
              notString,
            ],
          });

        const result = expect(act);

        await result.rejects.toThrowError(`constraints[1]: must be a string`);
      }
    });
  });

  describe("Cases", () => {
    test("The simple model", async () => {
      const models = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const result = await strings({
        models,
      });

      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.length).toBe(4);

      expect(result.pict).toEqual({ model: "A:1,2\nB:3,4" });

      expect(result.cases).toEqual([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: "2", B: "4" },
        { A: "2", B: "3" },
      ]);
    });
    test("The simple model with alias operator", async () => {
      const models = [
        {
          key: "A",
          values: ["1", alias(["2", "two"] as const)],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const result = await strings({
        models,
      });

      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.length).toBe(4);

      expect(result.pict).toEqual({ model: "A:1,2|two\nB:3,4" });

      expect(result.cases).toEqual([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: "2", B: "4" },
        { A: "two", B: "3" },
      ]);
    });
    test("The simple model with negative operator", async () => {
      const models = [
        {
          key: "A",
          values: [negative("-1" as const), "0", "1", "2"],
        },
        {
          key: "B",
          values: [negative("-1" as const), "0", "1", "2"],
        },
      ] as const;

      const result = await strings({
        models,
      });

      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.length).toBe(15);

      expect(result.pict).toEqual({
        model: "A:~-1,0,1,2\nB:~-1,0,1,2",
      });

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
      const models = [
        {
          key: "Type",
          values: [
            weight("Primary" as const, 10),
            "Logical",
            "Single",
            "Span",
            "Stripe",
            "Mirror",
            "RAID-5",
          ],
        },
        {
          key: "FormatMethod",
          values: ["quick", "slow"],
        },
        {
          key: "FileSystem",
          values: ["FAT", "FAT32", weight("NTFS" as const, 10)],
        },
      ] as const;

      const result = await strings({
        models,
      });

      expect(typeof result.time).toBe("number");
      expect(deleteTimeFromPictResult(result)).toMatchSnapshot();
    });
    test("The large model with 2 order", async () => {
      const models = [
        {
          key: "Type",
          values: ["Single", "Span", "Stripe", "Mirror", "RAID-5"],
        },
        {
          key: "Size",
          values: ["10", "100", "500", "1000", "5000", "10000", "40000"],
        },
        {
          key: "FormatMethod",
          values: ["Quick", "Slow"],
        },
        {
          key: "File system",
          values: ["FAT", "FAT32", "NTFS"],
        },
        {
          key: "ClusterSize",
          values: [
            "512",
            "1024",
            "2048",
            "4096",
            "8192",
            "16384",
            "32768",
            "65536",
          ],
        },
        {
          key: "Compression",
          values: ["On", "Off"],
        },
      ];

      const result = await strings({
        models,
      });

      expect(typeof result.time).toBe("number");
      expect(deleteTimeFromPictResult(result)).toMatchSnapshot();
    });
    test("The large model with all combinations", async () => {
      const models = [
        {
          key: "Type",
          values: ["Single", "Span", "Stripe", "Mirror", "RAID-5"],
        },
        {
          key: "Size",
          values: ["10", "100", "500", "1000", "5000", "10000", "40000"],
        },
        {
          key: "FormatMethod",
          values: ["Quick", "Slow"],
        },
        {
          key: "File system",
          values: ["FAT", "FAT32", "NTFS"],
        },
        {
          key: "ClusterSize",
          values: [
            "512",
            "1024",
            "2048",
            "4096",
            "8192",
            "16384",
            "32768",
            "65536",
          ],
        },
        {
          key: "Compression",
          values: ["On", "Off"],
        },
      ];

      const result = await strings(
        {
          models,
        },
        {
          order: models.length,
        }
      );

      expect(typeof result.time).toBe("number");
      expect(deleteTimeFromPictResult(result)).toMatchSnapshot();
    });
    test("The model with sub models", async () => {
      const models = [
        {
          key: "Platform",
          values: ["x86", "x64", "arm"],
        },
        {
          key: "CPUS",
          values: ["1", "2", "4"],
        },
        {
          key: "RAM",
          values: ["1GB", "4GB", "64GB"],
        },
        {
          key: "HDD",
          values: ["SCSI", "IDE"],
        },
        {
          key: "OS",
          values: ["Win7", "Win8", "Win10"],
        },
        {
          key: "Browser",
          values: ["Edge", "Opera", "Chrome", "Firefox"],
        },
        {
          key: "APP",
          values: ["Word", "Excel", "Powerpoint"],
        },
      ] as const;

      const result = await strings({
        models,
        sub: [
          {
            keys: ["Platform", "CPUS", "RAM", "HDD"],
            order: 3,
          },
          {
            keys: ["OS", "Browser"],
            order: 2,
          },
        ],
      });

      expect(typeof result.time).toBe("number");
      expect(deleteTimeFromPictResult(result)).toMatchSnapshot();
    });
    test("The model with seeding", async () => {
      const models = [
        {
          key: "Platform",
          values: ["x86", "x64", "arm"],
        },
        {
          key: "CPUS",
          values: ["1", "2", "4"],
        },
        {
          key: "RAM",
          values: ["1GB", "4GB", "64GB"],
        },
        {
          key: "HDD",
          values: ["SCSI", "IDE"],
        },
        {
          key: "OS",
          values: ["Win7", "Win8", "Win10"],
        },
        {
          key: "Browser",
          values: ["Edge", "Opera", "Chrome", "Firefox"],
        },
        {
          key: "APP",
          values: ["Word", "Excel", "Powerpoint"],
        },
      ] as const;

      const result = await strings({
        models,
        seed: {
          Platform: ["arm"],
          OS: ["Win10"],
        },
      });

      expect(typeof result.time).toBe("number");
      expect(deleteTimeFromPictResult(result)).toMatchSnapshot();
    });
  });
});
