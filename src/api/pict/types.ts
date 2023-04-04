import { createTypeGuard, isRecord, TypeGuard } from "tsguarder";
import { isPropertyKey } from "../../common/utils";
import type { PictModel } from "../../common/types";

export type PictTypedModel = PictModel<PropertyKey, unknown>;

export const isPictTypedModel: TypeGuard<PictTypedModel> = createTypeGuard(
  "must be a type { key: PropertyKey, values: unknown[] }",
  (value: unknown): value is PictTypedModel => {
    if (!isRecord(value)) {
      return false;
    }

    if (!isPropertyKey(value["key"])) {
      return false;
    }

    if (!Array.isArray(value["values"])) {
      return false;
    }

    return true;
  }
);
