import { isArray } from "../../common/utils";
import { SeedBuilder } from "../../common/SeedBuilder";
import type { ValuesIdMap } from "./ValuesIdMap";
import type { PictTypedModel } from "./types";
import type { InputSeed } from "../../common/types";

export function createSeed<S extends InputSeed<ReadonlyArray<PictTypedModel>>>(
  seeds: S,
  valuesIdMap: ValuesIdMap
) {
  const seedBuilder = new SeedBuilder();

  for (const key in seeds) {
    const parameters = seeds[key];

    isArray.assert(parameters, `seeds[${key}]`);

    parameters.forEach((value) => {
      const result = valuesIdMap.getParameterAndValueIdFromValues(key, value);
      seedBuilder.add(result.parameterId, result.valueId);
    });
  }

  return seedBuilder.getString();
}
