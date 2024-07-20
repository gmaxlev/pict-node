import type { PictModel } from "./../../common/types";
import { SeedBuilder } from "../../common/SeedBuilder";
import type { InputSeed } from "../../common/types";
import type { PictStringModel } from "./types";

export function createSeed<
  S extends InputSeed<ReadonlyArray<PictModel>>,
  M extends ReadonlyArray<PictStringModel>
>(seeds: S, models: M) {
  const seedBuilder = new SeedBuilder();

  for (const model of seeds) {
    const seedModel: Record<string, string> = {};

    for (const key in model) {
      const itemValue = (model as any)[key] as string;

      const modelValues = models.find((model) => model.key === key);

      if (!modelValues) {
        throw new Error(`The parameter "${key}" does not exist in the model`);
      }

      const value = modelValues.values.find((value) => value === itemValue);

      if (!value) {
        throw new Error(
          `The value "${itemValue}" does not exist in the model for the parameter "${key}"`
        );
      }

      seedModel[key] = itemValue;
    }

    seedBuilder.add(seedModel);
  }

  return seedBuilder.getString();
}
