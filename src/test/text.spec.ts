import path from "path";
import { text } from "../api/text";
import {
  EXCLUDE_TYPES,
  NOT_RECORD_TYPES,
  NOT_STRING_TYPES,
  getTestModelContent,
} from "./utils";
import url from "url";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("text()", () => {
  describe("Common Validation", () => {
    test("Should throw an error if the first argument is not a record", async () => {
      for (const notRecord of NOT_RECORD_TYPES) {
        // @ts-expect-error
        const act = async () => await text(notRecord);

        const result = expect(act);

        await result.rejects.toThrowError(
          "the first argument: must be an object"
        );
      }
    });
    test('Should throw an error if "options" is not undefined or a record', async () => {
      for (const notString of EXCLUDE_TYPES(["undefined", "record"])) {
        const act = async () =>
          await text({
            model: "_model_text_",
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
          await text({
            model: "_model_text_",
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
          await text({
            model: "_model_text_",
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
          await text({
            model: "_model_text_",
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

  describe("Model Validation", () => {
    test('Should throw an error if "model" is not a string or record', async () => {
      for (const notString of EXCLUDE_TYPES(["string", "record"])) {
        const act = async () =>
          await text({
            // @ts-expect-error
            model: notString,
          });

        const result = expect(act);

        await result.rejects.toThrowError('"model": must be a string');
      }
    });
    test('Should throw an error if "model.file" is not a string', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const act = async () =>
          await text({
            model: {
              // @ts-expect-error
              file: notString,
            },
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          '"model": must be a string or a type { file: string }'
        );
      }
    });
  });

  describe("Seed Validation", () => {
    test('Should throw an error if "seed" is not a string or record or undefined', async () => {
      for (const notString of EXCLUDE_TYPES([
        "string",
        "record",
        "undefined",
      ])) {
        const act = async () =>
          await text({
            model: "_model_text_",
            // @ts-expect-error
            seed: notString,
          });

        const result = expect(act);

        await result.rejects.toThrowError('"seed": must be a string');
      }
    });
    test('Should throw an error if "seed.file" is not a string', async () => {
      for (const notString of NOT_STRING_TYPES) {
        const act = async () =>
          await text({
            model: "_model_text_",
            seed: {
              // @ts-expect-error
              file: notString,
            },
          });

        const result = expect(act);

        await result.rejects.toThrowError(
          '"seed": must be a string or a type { file: string }'
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
              await text({
                model: "_model_text_",
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

  describe("Cases", () => {
    test("The simple model (in the file)", async () => {
      const modelPath = path.resolve(__dirname, "./models/model");

      const result = await text({
        model: {
          file: modelPath,
        },
      });

      expect(result).toMatchObject({
        time: expect.any(Number),
        length: 4,
      });

      expect(result.cases).toIncludeSameMembers([
        { A: "1", B: "4" },
        { A: "1", B: "3" },
        { A: "2", B: "4" },
        { A: "2", B: "3" },
      ]);
    });
    test("The simple model with alias operator and symbol key", async () => {
      const model = await getTestModelContent("model-alias");

      const result = await text({
        model,
      });

      expect(result).toMatchObject({
        time: expect.any(Number),
        length: 4,
      });

      expect(result.cases).toIncludeAnyMembers([
        { A: "1", ["B"]: "3" },
        { A: "1", ["B"]: "4" },
        { A: "2", ["B"]: "4" },
        { A: "two", ["B"]: "3" },
      ]);
    });
    test("The simple model with negative operator and number key (in the file)", async () => {
      const modelPath = path.resolve(__dirname, "./models/model-negative");

      const result = await text({
        model: {
          file: modelPath,
        },
      });

      expect(result).toMatchObject({
        time: expect.any(Number),
        length: 15,
      });

      expect(result.cases).toIncludeAnyMembers([
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
      const model = await getTestModelContent("model-weight");

      const result = await text({
        model,
      });

      expect(result).toMatchObject({
        time: expect.any(Number),
        length: 21,
      });

      expect(result.cases).toIncludeAnyMembers([
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
    test("The large model with all combinations (in the file)", async () => {
      const modelPath = path.resolve(
        __dirname,
        "./models/model-all-combinations"
      );

      const result = await text({
        model: {
          file: modelPath,
        },
        options: {
          order: 3,
        },
      });

      expect(result).toMatchObject({
        time: expect.any(Number),
        length: 27,
      });

      expect(result.cases).toIncludeSameMembers([
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
          values: ["5", "6", "7"],
        },
      ] as const;

      const model = await getTestModelContent("model-sub-models");

      const result = await text({
        model,
      });

      expect(result).toMatchObject({
        time: expect.any(Number),
        length: 12,
      });

      expect(result.cases).toIncludeSameMembers([
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
    test("The model with seeding (in the file)", async () => {
      const modelPath = path.resolve(__dirname, "./models/model-for-seed");
      const seedPath = path.resolve(__dirname, "./models/seed-for-model");

      const result = await text({
        model: {
          file: modelPath,
        },
        seed: {
          file: seedPath,
        },
      });

      expect(result).toMatchObject({
        time: expect.any(Number),
        length: 9,
      });

      expect(result.cases).toIncludeSameMembers([
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
    test("The model with seeding", async () => {
      const model = await getTestModelContent("model-for-seed");
      const seed = await getTestModelContent("seed-for-model");

      const result = await text({
        model,
        seed,
      });

      expect(result).toMatchObject({
        time: expect.any(Number),
        length: 9,
      });

      expect(result.cases).toIncludeSameMembers([
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
});
