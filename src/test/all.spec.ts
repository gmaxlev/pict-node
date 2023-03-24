import {
  EXCLUDE_TYPES,
  NOT_ARRAY_TYPES,
  NOT_PROPERTY_KEY_TYPES,
  NOT_RECORD_TYPES,
  prepareForSnapshot,
} from "./utils";
import { all } from "../api/all";
import type { PictTypedModel } from "../api/all/types";
import type { InputSubModel, PictModel } from "../common/types";
import { alias } from "../common/operators/alias";
import { negative } from "../common/operators/negative";
import { weight } from "../common/operators/weight";

describe("all()", () => {
  describe("Common Validation", () => {
    test("Should throw an error is the first argument is not a record", async () => {
      for (const notRecord of NOT_RECORD_TYPES) {
        // @ts-expect-error
        const act = async () => await all(notRecord);
        const result = expect(act);
        await result.rejects.toThrowError(
          "the first argument: must be an object"
        );
      }
    });
    test("Should throw an error is the first argument is not a record or undefined", async () => {
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
        const act = async () => await all({ models }, notRecord);

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
      ];

      for (const invalidOrder of [-2, -1, -0.5, 0]) {
        const act = async () =>
          await all(
            {
              models,
            },
            {
              order: invalidOrder,
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
        await all(
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
          await all(
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
  });

  describe("Models", () => {
    test("Should throw an error if models is not an array", async () => {
      for (const notArray of NOT_ARRAY_TYPES) {
        const act = async () =>
          await all({
            // @ts-expect-error
            models: notArray,
          });
        const result = expect(act);
        await result.rejects.toThrowError('"models": must be an array');
      }
    });
    test("Should throw an error if model is en empty array", async () => {
      const act = async () =>
        await all({
          models: [],
        });

      const result = expect(act);
      await result.rejects.toThrowError(
        '"models" must contain at least 1 item'
      );
    });
    test("Should throw an error if models contain an invalid parameter", async () => {
      const invalidModels: Array<{ index: number; models: PictTypedModel[] }> =
        [
          // @ts-expect-error
          ...NOT_RECORD_TYPES.map((notRecord) => ({
            index: 1,
            models: [
              {
                key: "A",
                values: ["1", "2"],
              },
              notRecord,
            ],
          })),
          // @ts-expect-error
          ...NOT_ARRAY_TYPES.map((notArray) => ({
            index: 1,
            models: [
              {
                key: "A",
                values: ["1", "2"],
              },

              {
                key: "A",
                values: notArray,
              },
            ],
          })),
          // @ts-expect-error
          ...NOT_PROPERTY_KEY_TYPES.map((notPropertyKey) => ({
            index: 1,
            models: [
              {
                key: "A",
                values: ["1", "2"],
              },

              {
                key: notPropertyKey,
                values: ["A"],
              },
            ],
          })),
          {
            index: 1,
            models: [
              {
                key: "A",
                values: ["1", "2"],
              },
              // @ts-expect-error
              {},
            ],
          },
          {
            index: 0,
            models: [
              // @ts-expect-error
              {
                key: "B",
              },
              {
                key: "A",
                values: ["1", "2"],
              },
            ],
          },
          {
            index: 1,
            models: [
              {
                key: "A",
                values: ["1", "2"],
              },
              // @ts-expect-error
              {
                values: ["1", "2"],
              },
            ],
          },
        ];

      for (const invalidModel of invalidModels) {
        const act = async () =>
          await all({
            models: invalidModel.models,
          });

        const result = await expect(act);

        await result.rejects.toThrowError(
          `models[${invalidModel.index}]: must be a type { key: PropertyKey, values: unknown[] }`
        );
      }
    });
  });

  describe("Sub Models", () => {
    test('Should throw an error if "sub" is not undefined and an array', async () => {
      for (const notRecord of EXCLUDE_TYPES(["undefined", "array"])) {
        const models = [
          {
            key: "A",
            values: ["1", "2"],
          },
        ] as const;

        const act = async () =>
          await all({
            models,
            // @ts-expect-error
            sub: notRecord,
          });
        const result = expect(act);
        await result.rejects.toThrowError('"sub": must be an array');
      }
    });
    test("Should throw an error if sub modules contains non-existent parameter", async () => {
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
        await all({
          models,
          sub: [
            {
              // @ts-expect-error
              keys: ["A", "_NOT_EXISTENT_"],
              order: 2,
            },
          ],
        });

      const result = expect(act);

      await result.rejects.toThrowError(
        `Parameter "_NOT_EXISTENT_" has been not found`
      );
    });
    test("Should throw an error if sub models contains an invalid type", async () => {
      const invalidSubModels: Array<{
        subModels: Array<InputSubModel<ReadonlyArray<PictModel>>>;
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
          await all({
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
          await all({
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
    test("Should throw an error if seed contains an invalid type", async () => {
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

      for (const invalidType of NOT_ARRAY_TYPES) {
        const act = async () =>
          await all({
            models,
            seed: {
              // @ts-expect-errors
              A: invalidType,
            },
          });

        const result = expect(act);

        await result.rejects.toThrowError(`seeds[A]: must be an array`);
      }
    });
    test('Should throw an error if "seed" contains a non-existent parameter', async () => {
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
        await all({
          models,
          seed: {
            // @ts-expect-error
            _NOT_EXISTENT_: ["1", "2"],
          },
        });

      const result = expect(act);

      await result.rejects.toThrowError(
        `Parameter "_NOT_EXISTENT_" has been not found`
      );
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
        await all({
          models,
          seed: {
            // @ts-expect-error
            A: ["_NOT_EXISTENT_"],
          },
        });

      const result = expect(act);

      await result.rejects.toThrowError(
        `Value "_NOT_EXISTENT_" has been not found`
      );
    });
  });

  describe("Cases", () => {
    test("The simple model", async () => {
      const object = { number: 4 };
      const symbol = Symbol("symbol");

      const models = [
        {
          key: "A",
          values: [null, false],
        },
        {
          key: "B",
          values: [symbol, object],
        },
      ] as const;

      const result = await all({
        models,
      });

      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.length).toBe(4);

      expect(result.pict).toEqual({
        model: "0:0.0,0.1\n1:1.0,1.1",
        result: "0\t1\n0.0\t1.1\n0.0\t1.0\n0.1\t1.1\n0.1\t1.0\n",
      });

      expect(result.cases).toEqual([
        { A: null, B: { number: 4 } },
        { A: null, B: symbol },
        { A: false, B: { number: 4 } },
        { A: false, B: symbol },
      ]);
    });
    test("The simple model with alias operator", async () => {
      const models = [
        {
          key: "A",
          values: ["1", alias([2, "two"] as const)],
        },
        {
          key: "B",
          values: ["3", "4"],
        },
      ] as const;

      const result = await all({
        models,
      });

      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.length).toBe(4);

      expect(result.pict).toEqual({
        model: "0:0.0,0.1|0.2\n1:1.0,1.1",
        result: "0\t1\n0.0\t1.1\n0.0\t1.0\n0.1\t1.1\n0.2\t1.0\n",
      });

      expect(result.cases).toEqual([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: 2, B: "4" },
        { A: "two", B: "3" },
      ]);
    });
    test("The simple model with negative operator", async () => {
      const models = [
        {
          key: "A",
          values: [negative(-1 as const), 0, 1, 2],
        },
        {
          key: "B",
          values: [negative(-1 as const), 0, 1, 2],
        },
      ] as const;

      const result = await all({
        models,
      });

      expect(Object.keys(result).length).toBe(4);

      expect(typeof result.time).toBe("number");

      expect(result.length).toBe(15);

      expect(result.pict).toEqual({
        model: "0:~0.0,0.1,0.2,0.3\n1:~1.0,1.1,1.2,1.3",
        result:
          "0\t1\n0.1\t1.3\n0.1\t1.2\n0.2\t1.3\n0.3\t1.2\n0.2\t1.1\n0.3\t1.1\n0.2\t1.2\n0.3\t1.3\n0.1\t1.1\n0.1\t~1.0\n0.2\t~1.0\n~0.0\t1.1\n~0.0\t1.2\n0.3\t~1.0\n~0.0\t1.3\n",
      });

      expect(result.cases).toEqual([
        { A: 0, B: 2 },
        { A: 0, B: 1 },
        { A: 1, B: 2 },
        { A: 2, B: 1 },
        { A: 1, B: 0 },
        { A: 2, B: 0 },
        { A: 1, B: 1 },
        { A: 2, B: 2 },
        { A: 0, B: 0 },
        { A: 0, B: -1 },
        { A: 1, B: -1 },
        { A: -1, B: 0 },
        { A: -1, B: 1 },
        { A: 2, B: -1 },
        { A: -1, B: 2 },
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

      const result = await all({
        models,
      });

      expect(typeof result.time).toBe("number");
      expect(prepareForSnapshot(result)).toMatchSnapshot();
    });
    test("The large model with 2 order", async () => {
      const models = [
        {
          key: "Type",
          values: ["Single", "Span", "Stripe", "Mirror", "RAID-5"],
        },
        {
          key: "Size",
          values: [10, 100, 500, 1000, 5000, 10000, 40000],
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
          values: [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536],
        },
        {
          key: "Compression",
          values: ["On", "Off"],
        },
      ];

      const result = await all({
        models,
      });

      expect(typeof result.time).toBe("number");
      expect(prepareForSnapshot(result)).toMatchSnapshot();
    });
    test("The large model with all combinations", async () => {
      const models = [
        {
          key: "Type",
          values: ["Single", "Span", "Stripe", "Mirror", "RAID-5"],
        },
        {
          key: "Size",
          values: [10, 100, 500, 1000, 5000, 10000, 40000],
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
          values: [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536],
        },
        {
          key: "Compression",
          values: ["On", "Off"],
        },
      ];

      const result = await all(
        {
          models,
        },
        {
          order: models.length,
        }
      );

      expect(typeof result.time).toBe("number");
      expect(prepareForSnapshot(result)).toMatchSnapshot();
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

      const result = await all({
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
      expect(prepareForSnapshot(result)).toMatchSnapshot();
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

      const result = await all({
        models,
        seed: {
          Platform: ["arm"],
          OS: ["Win10"],
        },
      });

      expect(typeof result.time).toBe("number");
      expect(prepareForSnapshot(result)).toMatchSnapshot();
    });
  });
});
