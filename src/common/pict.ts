import type { PictCliOptions, PickPictCliOptions } from "./types";
import { execSync } from "child_process";
import {
  isBoolean,
  isNumber,
  isString,
  isUndefined,
  writeTempFile,
} from "./utils";
import path from "path";

export interface CallPictOptions {
  modelText: string;
  seedText?: string;
  options: Partial<
    PickPictCliOptions<
      | "order"
      | "random"
      | "aliasSeparator"
      | "valueSeparator"
      | "negativePrefix"
      | "caseSensitive"
    >
  >;
}

function getRootPath() {
  if (process.env["NODE_ENV"] === "development") {
    return path.resolve(__dirname, "..", "..");
  } else {
    return path.resolve("./");
  }
}

function getBinaryPath() {
  if (process.platform === "win32") {
    return path.resolve(getRootPath(), "bin", "pict.exe");
  } else {
    return path.resolve(getRootPath(), "bin", "pict");
  }
}

export async function callPict(options: CallPictOptions) {
  const cleanups: Function[] = [];

  const modelFile = await writeTempFile(options.modelText);

  cleanups.push(() => modelFile.cleanup());

  const cliParams: Partial<PictCliOptions> = { ...options.options };

  if (isString(options.seedText)) {
    const seedFile = await writeTempFile(options.seedText);
    cleanups.push(() => seedFile.cleanup());
    cliParams.seeds = seedFile.path;
  }

  const result = callPictBinary(modelFile.path, cliParams);

  cleanups.forEach((cleanup) => cleanup());

  return result;
}

export function callPictBinary(
  modelPath: string,
  params: Partial<PictCliOptions> = {}
) {
  let cliOptions = "";

  if (isNumber(params.order)) {
    cliOptions += ` /o:${params.order}`;
  }

  if (isString(params.seeds)) {
    cliOptions += ` /e:${params.seeds}`;
  }

  if (isString(params.aliasSeparator)) {
    cliOptions += ` /a:"${params.aliasSeparator}"`;
  }

  if (isString(params.valueSeparator)) {
    cliOptions += ` /d:"${params.valueSeparator}"`;
  }

  if (isString(params.negativePrefix)) {
    cliOptions += ` /n:"${params.negativePrefix}"`;
  }

  if (!isUndefined(params.random)) {
    if (isBoolean(params.random) && params.random) {
      cliOptions += ` /r`;
    } else if (isNumber(params.random)) {
      cliOptions += ` /r:${params.random}`;
    }
  }

  return execSync(`${getBinaryPath()} ${modelPath} ${cliOptions}`).toString();
}

export function* pictEntries(result: string) {
  let headers: string[] = [];
  const rows = result.split("\n");

  for (const [rowIndex, rowItem] of rows.entries()) {
    if (rowIndex === rows.length - 1) {
      continue;
    }

    if (rowIndex === 0) {
      headers = rowItem.split("\t");
      continue;
    }

    const values = rowItem.split("\t");

    for (const [valueIndex, valueItem] of values.entries()) {
      const formattedValue = valueItem.replace("~", "");

      yield {
        rowName: headers[valueIndex],
        rowIndex: rowIndex - 1,
        value: formattedValue,
        valueIndex,
      };
    }
  }
}
