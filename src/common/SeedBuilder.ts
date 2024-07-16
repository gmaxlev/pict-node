import { isRecord, isString } from "tsguarder";
import { EOL } from "os";

/**
 * A builder for PICT seeds
 * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#sub-models}
 */
export class SeedBuilder {
  private keys = new Set<string>();
  private parameters: Array<Record<string, string>> = [];

  add(values: Record<string, string>) {
    if (!isRecord(values)) {
      throw new Error("Values must be a record");
    }

    if (Object.keys(values).length === 0) {
      throw new Error("Values must not be an empty object");
    }

    for (const parameter in values) {
      const value = values[parameter];

      if (!isString(value)) {
        throw new Error("Value must be a string");
      }

      this.keys.add(parameter);
    }

    this.parameters.push(values);
  }

  getString() {
    const keys = [...this.keys.values()];

    let string = keys.join("\t");

    this.parameters.forEach((parameter) => {
      string += EOL;

      keys.forEach((key, index, array) => {
        const value = parameter[key];

        if (typeof value === "string") {
          string += value;
        } else {
          string += "";
        }

        if (index !== array.length - 1) {
          string += "\t";
        }
      });
    });

    return string;
  }
}
