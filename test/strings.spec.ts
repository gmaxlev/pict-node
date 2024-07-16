import type { PictStringModel } from "../src/api/strings/types";
import {
  NOT_RECORD_TYPES,
  NOT_ARRAY_TYPES,
  EXCLUDE_TYPES,
  NOT_STRING_TYPES,
} from "./utils";
import { strings } from "../src/api/strings";
import type { InputSubModel } from "../src/common/types";
import { alias } from "../src/common/operators/alias";
import { negative } from "../src/common/operators/negative";
import { weight } from "../src/common/operators/weight";

describe("strings()", () => {
  describe("Common Validations", () => {
    test("Should throw an error if the first argument is not a record", async () => {
      for (const notRecord of NOT_RECORD_TYPES) {
        // @ts-expect-error
        const act = () => strings(notRecord);
        await expect(act).rejects.toThrowError(
          "the first argument: must be a record"
        );
      }
    });

    test("Should throw an error if the second argument is not a record or undefined", async () => {
      const model = [
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
        const act = async () => await strings({ model }, notRecord);

        const result = expect(act);

        await result.rejects.toThrowError(
          "the second argument: must be a record"
        );
      }
    });

    test('Should throw an error if "order" is not undefined or a positive number', async () => {
      const model = [
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
              model,
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
      const model = [
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
            model,
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
      const model = [
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
        "number",
        "boolean",
      ])) {
        const act = async () =>
          await strings(
            {
              model,
            },
            {
              // @ts-expect-error
              random: invalidType,
            }
          );

        const result = expect(act);

        await result.rejects.toThrowError(
          "options.random: must be a number or boolean"
        );
      }
    });

    test('Should throw an error if "caseSensitive" is not undefined or a boolean', async () => {
      const model = [
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
              model,
            },
            {
              // @ts-expect-error
              caseSensitive: invalidType,
            }
          );

        const result = expect(act);

        await result.rejects.toThrowError('"caseSensitive": must be boolean');
      }
    });
  });

  describe("Operators", () => {
    test('Should throw an error if "alias" does not contain a string value', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const model = [
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
            model,
          });

        expect(act).rejects.toThrow("model[0].values[1]: must be a string");
      }
    });

    test('Should throw an error if "negative" does not contain a string value', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const model = [
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
            model,
          });

        expect(act).rejects.toThrow("model[0].values[0]: must be a string");
      }
    });

    test('Should throw an error if "weight" does not contain a string value', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const model = [
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
            model,
          });

        expect(act).rejects.toThrow("model[1].values[1]: must be a string");
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
          const model = [
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
                  model,
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
    test("Should throw an error if model is not an array", async () => {
      for (const notArray of NOT_ARRAY_TYPES) {
        const act = async () =>
          await strings({
            // @ts-expect-error
            model: notArray,
          });
        const result = expect(act);
        await result.rejects.toThrowError('"model": must be an array');
      }
    });

    test("Should throw an error if model is en empty array", async () => {
      const act = async () =>
        await strings({
          model: [],
        });

      const result = expect(act);
      await result.rejects.toThrowError('"model" must contain at least 1 item');
    });

    test("Should throw an error if model contain an invalid parameter", async () => {
      const models = [
        ...NOT_RECORD_TYPES.map((notRecord) => ({
          index: 0,
          model: [notRecord],
        })),
        ...NOT_STRING_TYPES.map((notString) => ({
          index: 0,
          model: [
            {
              key: notString,
              values: ["1", "2"],
            },
          ],
        })),
        ...NOT_ARRAY_TYPES.map((notArray) => ({
          index: 0,
          model: [
            {
              key: "key",
              values: notArray,
            },
          ],
        })),
        {
          index: 0,
          model: [{}],
        },
      ] as const;

      for (const item of models) {
        // @ts-expect-error
        const act = async () => await strings({ model: item.model });

        const result = expect(act);

        await result.rejects.toThrowError(
          `model[${item.index}]: must be a type { key: string, values: Array<string> }`
        );
      }
    });

    test("Should throw an error if parameter value is not a string", async () => {
      const models = [
        ...NOT_STRING_TYPES.map((notString) => ({
          parameterIndex: 0,
          valueIndex: 1,
          model: [
            {
              key: "key",
              values: ["1", notString],
            },
          ],
        })),
      ] as const;

      for (const item of models) {
        // @ts-expect-error
        const act = async () => await strings({ model: item.model });

        const result = expect(act);

        await result.rejects.toThrowError(
          `model[${item.parameterIndex}].values[${item.valueIndex}]: must be a string`
        );
      }
    });
  });

  describe("Sub Models", () => {
    test('Should throw an error if "sub" models is not undefined and an array', async () => {
      for (const notRecord of EXCLUDE_TYPES(["undefined", "array"])) {
        const model = [
          {
            key: "A",
            values: ["1", "2"],
          },
        ] as const;

        const act = async () =>
          await strings({
            model,
            // @ts-expect-error
            sub: notRecord,
          });
        const result = expect(act);
        await result.rejects.toThrowError('"sub": must be an array');
      }
    });

    test("Should throw an error if sub models contains a non-existent parameter", async () => {
      const model = [
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
          model,
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
        const model = [
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
            model,
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
    test('Should throw an error if "seed" is not an array', async () => {
      const model = [
        {
          key: "A",
          values: ["1", "2"],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      for (const invalidType of EXCLUDE_TYPES(["undefined", "array"])) {
        const act = async () =>
          await strings({
            model,
            // @ts-expect-error
            seed: invalidType,
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          `"seed": must be an array Array<{ [key: PropertyKey]: unknown }>`
        );
      }
    });
    test("Should throw an error if seed contains non-existing parameter", async () => {
      const model = [
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
          model,
          seed: [
            {
              // @ts-expect-error
              C: "1",
            },
          ],
        });

      const result = expect(act);

      await result.rejects.toThrowError(
        `The parameter "C" does not exist in the model`
      );
    });
    test("Should throw an error if seed parameter value is not in the model", async () => {
      const model = [
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
          model,
          seed: [
            {
              // @ts-expect-error
              A: "3",
            },
          ],
        });

      const result = expect(act);

      await result.rejects.toThrowError(
        `The value "3" does not exist in the model for the parameter "A"`
      );
    });
  });

  describe("Constraints", () => {
    test(`Should throw an error if "constraints" in not an array or string`, async () => {
      const model = [
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
            model,
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
      const model = [
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
            model,
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
      const model = [
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
        model,
      });

      expect(result).toHaveLength(4);

      expect(result).toIncludeSameMembers([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: "2", B: "4" },
        { A: "2", B: "3" },
      ]);
    });

    test("The simple model with alias operator and symbol key", async () => {
      const model = [
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
        model,
      });

      expect(result).toHaveLength(4);

      expect(result).toIncludeAnyMembers([
        { A: "1", ["B"]: "3" },
        { A: "1", ["B"]: "4" },
        { A: "2", ["B"]: "4" },
        { A: "two", ["B"]: "3" },
      ]);
    });

    test("The simple model with negative operator and number key", async () => {
      const model = [
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
        model,
      });

      expect(result).toHaveLength(15);

      expect(result).toIncludeAnyMembers([
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
      const model = [
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
        model,
      });

      expect(result).toHaveLength(21);

      expect(result).toIncludeAnyMembers([
        { Type: "Primary", FormatMethod: "quick", FileSystem: "FAT" },
        { Type: "Single", FormatMethod: "slow", FileSystem: "NTFS" },
        { Type: "Logical", FormatMethod: "slow", FileSystem: "FAT" },
        { Type: "Stripe", FormatMethod: "quick", FileSystem: "NTFS" },
        { Type: "Mirror", FormatMethod: "quick", FileSystem: "NTFS" },
        { Type: "Logical", FormatMethod: "quick", FileSystem: "FAT32" },
        { Type: "Span", FormatMethod: "slow", FileSystem: "FAT" },
        { Type: "Span", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "Mirror", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "Primary", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "RAID-5", FormatMethod: "slow", FileSystem: "NTFS" },
        { Type: "Single", FormatMethod: "quick", FileSystem: "FAT32" },
        { Type: "Single", FormatMethod: "quick", FileSystem: "FAT" },
        { Type: "RAID-5", FormatMethod: "quick", FileSystem: "FAT" },
        { Type: "Span", FormatMethod: "quick", FileSystem: "NTFS" },
        { Type: "Mirror", FormatMethod: "quick", FileSystem: "FAT" },
        { Type: "Primary", FormatMethod: "slow", FileSystem: "NTFS" },
        { Type: "Logical", FormatMethod: "slow", FileSystem: "NTFS" },
        { Type: "Stripe", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "RAID-5", FormatMethod: "slow", FileSystem: "FAT32" },
        { Type: "Stripe", FormatMethod: "slow", FileSystem: "FAT" },
      ]);
    });

    test("The large model with all combinations", async () => {
      const model = [
        {
          key: "Type",
          values: ["Single", "Span", "Stripe"],
        },
        {
          key: "Size",
          values: ["10", "100", "500"],
        },
        {
          key: "FormatMethod",
          values: ["Quick", "Slow", "VerySlow"],
        },
      ];

      const result = await strings(
        {
          model,
        },
        {
          order: model.length,
        }
      );

      expect(result).toHaveLength(27);

      expect(result).toIncludeSameMembers([
        { Type: "Single", Size: "500", FormatMethod: "Quick" },
        { Type: "Span", Size: "500", FormatMethod: "Slow" },
        { Type: "Stripe", Size: "500", FormatMethod: "Slow" },
        { Type: "Span", Size: "10", FormatMethod: "VerySlow" },
        { Type: "Single", Size: "10", FormatMethod: "Slow" },
        { Type: "Span", Size: "100", FormatMethod: "VerySlow" },
        { Type: "Span", Size: "100", FormatMethod: "Quick" },
        { Type: "Single", Size: "500", FormatMethod: "VerySlow" },
        { Type: "Single", Size: "100", FormatMethod: "Slow" },
        { Type: "Stripe", Size: "10", FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: "500", FormatMethod: "VerySlow" },
        { Type: "Single", Size: "10", FormatMethod: "VerySlow" },
        { Type: "Single", Size: "500", FormatMethod: "Slow" },
        { Type: "Stripe", Size: "10", FormatMethod: "Quick" },
        { Type: "Stripe", Size: "100", FormatMethod: "Slow" },
        { Type: "Span", Size: "500", FormatMethod: "Quick" },
        { Type: "Span", Size: "10", FormatMethod: "Quick" },
        { Type: "Stripe", Size: "10", FormatMethod: "Slow" },
        { Type: "Single", Size: "100", FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: "100", FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: "100", FormatMethod: "Quick" },
        { Type: "Single", Size: "100", FormatMethod: "Quick" },
        { Type: "Span", Size: "100", FormatMethod: "Slow" },
        { Type: "Span", Size: "10", FormatMethod: "Slow" },
        { Type: "Single", Size: "10", FormatMethod: "Quick" },
        { Type: "Span", Size: "500", FormatMethod: "VerySlow" },
        { Type: "Stripe", Size: "500", FormatMethod: "Quick" },
      ]);
    });

    test("The model with sub models", async () => {
      const model = [
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
          values: ["5", "6", "7"],
        },
      ] as const;

      const result = await strings({
        model,
        sub: [
          {
            keys: ["B", "C"],
            order: 2,
          },
        ],
      });

      expect(result).toHaveLength(12);

      expect(result).toIncludeSameMembers([
        { A: "1", B: "4", C: "7" },
        { A: "2", B: "4", C: "6" },
        { A: "1", B: "4", C: "5" },
        { A: "2", B: "4", C: "5" },
        { A: "2", B: "4", C: "7" },
        { A: "1", B: "4", C: "6" },
        { A: "1", B: "3", C: "5" },
        { A: "2", B: "3", C: "6" },
        { A: "2", B: "3", C: "7" },
        { A: "1", B: "3", C: "7" },
        { A: "1", B: "3", C: "6" },
        { A: "2", B: "3", C: "5" },
      ]);
    });

    test("The model with seeding", async () => {
      const model = [
        {
          key: "Platform",
          values: ["x86", "x64", "arm"],
        },
        {
          key: "CPUS",
          values: ["1", "2", "4"],
        },
      ] as const;

      const result = await strings({
        model,
        seed: [
          {
            Platform: "arm",
            CPUS: "2",
          },
        ],
      });

      expect(result).toHaveLength(9);

      expect(result).toIncludeSameMembers([
        { Platform: "arm", CPUS: "2" },
        { Platform: "arm", CPUS: "1" },
        { Platform: "x86", CPUS: "4" },
        { Platform: "arm", CPUS: "4" },
        { Platform: "x86", CPUS: "2" },
        { Platform: "x64", CPUS: "1" },
        { Platform: "x86", CPUS: "1" },
        { Platform: "x64", CPUS: "2" },
        { Platform: "x64", CPUS: "4" },
      ]);
    });
  });

  describe("Statistisc", () => {
    test("Should return statistics", async () => {
      const model = [
        {
          key: "Type",
          values: ["Single", "Span", "Stripe"],
        },
        {
          key: "Size",
          values: ["10", "100", "500"],
        },
        {
          key: "FormatMethod",
          values: ["Quick", "Slow", "VerySlow"],
        },
      ];

      const result = await strings.stats(
        {
          model,
        },
        {
          order: model.length,
        }
      );

      expect(result).toEqual({
        generationTimeNodeJs: expect.any(Number),
        combinations: 27,
        generatedTests: 27,
        generationTime: expect.any(String),
      });
    });
  });
});
