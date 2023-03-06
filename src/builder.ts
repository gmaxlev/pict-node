import tmp from "tmp";
import fsp from "fs/promises";
import { execSync } from "child_process";
import type { PictCliOptions } from "./types";

export async function savePictModelToFile(modelText: string) {
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

export function callPictBinary(
  modelPath: string,
  params?: Partial<PictCliOptions>
) {
  return execSync(`./vendor/repository/pict ${modelPath} /o:6`).toString();
}

type ParserParameters = (
  rowName: string,
  rowIndex: number,
  parameterName: string,
  parameterIndex: number
) => void;

export function iteratePictResult(result: string, parser: ParserParameters) {
  let headers: string[] = [];
  const rows = result.split("\n");

  rows.forEach((rowItem, rowIndex) => {
    if (rowIndex === 0) {
      headers = rowItem.split("\t");
    } else if (rowIndex !== rows.length - 1) {
      const values = rowItem.split("\t");
      values.forEach((valueItem, valueIndex) => {
        parser(
          headers[valueIndex] as string,
          rowIndex - 1,
          valueItem,
          valueIndex
        );
      });
    }
  });
}
