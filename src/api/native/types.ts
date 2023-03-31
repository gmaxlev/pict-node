import { isRecord, isString } from "./../../common/utils";
import { createTypeGuard, TypeGuard } from "../../common/utils";

export interface ModelFileSource {
  file: string;
}

export const isModelFileSource: TypeGuard<ModelFileSource> = createTypeGuard(
  "must be typpe { file: string }",
  (value): value is ModelFileSource => {
    return isRecord(value) && isString(value["file"]);
  }
);

export type ModelSource = string | ModelFileSource;

export const isModelSource: TypeGuard<ModelSource> = createTypeGuard(
  "must be a string or a type { file: string }",
  (value): value is ModelSource => {
    return typeof value === "string" || isModelFileSource(value);
  }
);
