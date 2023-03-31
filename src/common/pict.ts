import { IS_WIN, IS_TEST } from "./../env";
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
import { EOL } from "os";
import url from "url";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

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

function getBinaryPath() {
  const root = IS_TEST
    ? path.resolve(__dirname, "..", "..")
    : path.resolve(__dirname, "..");

  if (IS_WIN) {
    return path.join(root, "bin", "pict.exe");
  } else {
    return path.join(root, "bin", "pict");
  }
}

export async function callPict(options: CallPictOptions) {
  const modelFile = await writeTempFile(options.modelText);

  const cliParams: Partial<PictCliOptions> = { ...options.options };

  if (isString(options.seedText)) {
    const seedFile = await writeTempFile(options.seedText);
    cliParams.seeds = seedFile.path;
  }

  const result = await callPictBinary(modelFile.path, cliParams);

  return result;
}

export async function callPictBinary(
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

  try {
    const result = execSync(`${getBinaryPath()} ${modelPath} ${cliOptions}`);
    return Promise.resolve(result.toString());
  } catch (error) {
    console.error("Error while calling PICT binary.");
    throw error;
  }
}

export function* pictEntries(result: string) {
  let headers: string[] = [];
  const rows = result.split(EOL);

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
