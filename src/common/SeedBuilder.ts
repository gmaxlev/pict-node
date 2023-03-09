import { isUndefined } from "../types";

/**
 * This is a simple tool for creating the seed string model.
 * All it does is transforming the following JS object:
 *
 * {
 *     parameter1: [A, B, C],
 *     parameter2: [D, E],
 * }
 *
 * Into the following string:
 *
 * parameter1	parameter2
 * A            D
 * B            E
 * C
 *
 * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#seeding}
 */
export class SeedBuilder {
  private max = 0;
  private parameters: Record<string, string[]> = {};

  add(parameter: string | number, value: string | number) {
    const values = this.parameters[parameter] || [];
    values.push(String(value));
    this.max = Math.max(this.max, values.length);
    this.parameters[parameter] = values;
  }

  getString() {
    let string = "";

    const keys = Object.keys(this.parameters);

    string += keys.join("\t");
    string += "\n";

    let counter = 0;

    while (counter <= this.max) {
      for (const key of keys) {
        // @ts-ignore
        const value = this.parameters[key][counter];

        if (isUndefined(value)) {
          continue;
        }

        string += value;

        string += "\t";
      }

      string += "\n";
      counter++;
    }

    return string;
  }
}
