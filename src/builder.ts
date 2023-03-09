import tmp from "tmp";
import fsp from "fs/promises";
import { execSync } from "child_process";
import type { PictCliOptions } from "./types";

export async function saveTempFile(modelText: string) {
  const file = await new Promise<{ cleanup: Function; path: string }>(
    (resolve, reject) => {
      tmp.file((err, path, fd, cleanupCallback) => {
        if (err) {
          reject(err);
        }

        resolve({
          cleanup: cleanupCallback,
          path,
        });
      });
    }
  );

  await fsp.writeFile(file.path, modelText);

  return file;
}

export interface CallPictOptions {
  modelText: string;
  seedText?: string;
}

export async function callPict(options: CallPictOptions) {
  const modelFile = await saveTempFile(options.modelText);

  const cliParams: Partial<PictCliOptions> = {};

  if (options.seedText) {
    const seedFile = await saveTempFile(options.seedText);
    cliParams.fileWithSeedingRows = seedFile.path;
  }

  return callPictBinary(modelFile.path, cliParams);
}

function callPictBinary(
  modelPath: string,
  params: Partial<PictCliOptions> = {}
) {
  // let cliParams = "/o:6";
  let cliParams = " ";

  if (params.fileWithSeedingRows) {
    cliParams += ` /e:${params.fileWithSeedingRows}`;
  }

  return execSync(
    `./vendor/repository/pict ${modelPath} ${cliParams}`
  ).toString();
}

type ParserParameters = (
  rowName: string,
  rowIndex: number,
  parameterName: string,
  parameterIndex: number
) => void;

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
