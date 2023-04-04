import { isArray, isString } from "tsguarder";
import type { PictModel } from "./../../common/types";
import { SeedBuilder } from "../../common/SeedBuilder";
import type { InputSeed } from "../../common/types";
import type { PictStringModel } from "./types";

export function createSeed<
  S extends InputSeed<ReadonlyArray<PictModel>>,
  M extends ReadonlyArray<PictStringModel>
>(seeds: S, models: M) {
  const seedBuilder = new SeedBuilder();

  for (const parameter in seeds) {
    const modelValues = models.find((model) => model.key === parameter);

    if (!modelValues) {
      throw new Error(
        `The parameter "${parameter}" does not exist in the model`
      );
    }

    const values = seeds[parameter];

    isArray.assert(values, `seeds[${parameter}]`);

    values.forEach((value, index) => {
      isString.assert(value, `seeds[${parameter}][${index}]`);

      if (!modelValues.values.some((valueItem) => valueItem === value)) {
        throw new Error(
          `The value "${value}" does not exist in the model for the parameter "${parameter}"`
        );
      }

      seedBuilder.add(parameter, value);
    });
  }

  return seedBuilder.getString();
}
