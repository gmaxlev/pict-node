import { isString, isUndefined } from "./utils";

/**
 * A builder for PICT sub models.
 * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#sub-models}
 */
export class SeedBuilder {
  private max = 0;
  private parameters: Record<string, string[]> = {};

  add(parameter: string, value: string) {
    if (!isString(parameter)) {
      throw new Error("Parameter must be a string");
    }

    if (!isString(value)) {
      throw new Error("Value must be a string");
    }

    const values = this.parameters[parameter] || [];
    values.push(String(value));
    this.max = Math.max(this.max, values.length);
    this.parameters[parameter] = values;
  }

  getString() {
    const parameters = Object.keys(this.parameters);

    let string = parameters.join("\t");
    string += " ";

    for (let counter = 0; counter <= this.max; counter++) {
      parameters.forEach((parameter, index) => {
        // @ts-ignore
        const value = this.parameters[parameter][counter];

        if (isUndefined(value)) {
          return;
        }

        if (index === 0) {
          string = string.substring(0, string.length - 1);
          string += "\n";
        }

        string += value;

        string += "\t";
      });
    }

    string = string.substring(0, string.length - 1);

    return string;
  }
}
