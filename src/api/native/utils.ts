import type { ModelSource } from "./types";
import { isString } from "tsguarder";
import fsp from "fs/promises";

export async function getModelFromSource(source: ModelSource) {
  if (isString(source)) {
    return source;
  }

  try {
    const fileContent = await fsp.readFile(source.file);
    return fileContent.toString();
  } catch (error) {
    console.error(`Error while reading model file. ${source.file}`);
    throw error;
  }
}
