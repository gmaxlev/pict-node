import { isArray } from "tsguarder";
import { SeedBuilder } from "../../common/SeedBuilder";
import type { ValuesIdMap } from "./ValuesIdMap";
import type { PictTypedModel } from "./types";
import type { InputSeed } from "../../common/types";

export function createSeed<S extends InputSeed<ReadonlyArray<PictTypedModel>>>(
  seeds: S,
  valuesIdMap: ValuesIdMap
) {
  const seedBuilder = new SeedBuilder();

  for (const model of seeds) {
    const seedModel: Record<string, string> = {};

    for (const key in model) {
      const result = valuesIdMap.getParameterAndValueIdFromValues(
        key,
        // @ts-ignore
        model[key]
      );
      seedModel[result.parameterId] = result.valueId;
    }

    seedBuilder.add(seedModel);
  }

  return seedBuilder.getString();
}
