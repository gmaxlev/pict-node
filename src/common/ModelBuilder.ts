import { isNumber, isRecord, isString, isUndefined } from "tsguarder";
import { EOL } from "os";

type ModelBuilderConstraint = string;

interface ModelBuilderSubModel {
  parameters: Array<string> | ReadonlyArray<string>;
  order?: number;
}

interface ModelBuilderModel {
  parameters: Map<string, unknown[]>;
  sub: Array<ModelBuilderSubModel>;
  constraints: ModelBuilderConstraint[];
}

export interface ModelBuilderOptions {
  aliasSeparator?: string;
  valueSeparator?: string;
  negativePrefix?: string;
}

/**
 * A builder for PICT models.
 */
export class ModelBuilder {
  private readonly aliasSeparator: string = "|";
  private readonly valueSeparator: string = ",";
  private readonly negativePrefix: string = "~";

  private readonly model: ModelBuilderModel = {
    parameters: new Map(),
    sub: [],
    constraints: [],
  };

  constructor(options?: ModelBuilderOptions) {
    if (!isRecord(options)) {
      return;
    }
    if (!isUndefined(options["aliasSeparator"])) {
      this.aliasSeparator = ModelBuilder.validateSeparator(
        options["aliasSeparator"]
      );
    }
    if (!isUndefined(options["valueSeparator"])) {
      this.valueSeparator = ModelBuilder.validateSeparator(
        options["valueSeparator"]
      );
    }
    if (!isUndefined(options["negativePrefix"])) {
      this.negativePrefix = ModelBuilder.validateSeparator(
        options["negativePrefix"]
      );
    }
  }

  /**
   * Adds a simple parameter value to the model.
   */
  addParameter(key: string, value: string) {
    const formattedKey = this.validateValue(key);
    const formattedValue = this.validateValue(value);

    const array = this.getParameterValues(formattedKey);
    array.push(formattedValue);
  }

  /**
   * Adds an alias parameter value to the model.
   * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#aliasing}
   */
  addAliasParameter(
    key: string,
    values: Array<string> | ReadonlyArray<string>
  ) {
    const array = this.getParameterValues(this.validateValue(key));
    array.push(
      values.map((value) => this.validateValue(value)).join(this.aliasSeparator)
    );
  }

  /**
   * Adds a negative parameter value to the model.
   * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#negative-testing}
   */
  addNegativeParameter(key: string, value: string) {
    const array = this.getParameterValues(this.validateValue(key));
    array.push(`${this.negativePrefix}${this.validateValue(value)}`);
  }

  /**
   * Adds a parameter value with a weight to the model.
   * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#weighting}
   */
  addParameterWithWeight(key: string, value: string, weight: number) {
    if (!isNumber(weight)) {
      throw new Error("Weight must be a number");
    }

    const array = this.getParameterValues(this.validateValue(key));
    array.push(
      `${this.validateValue(value)}(${this.validateValue(String(weight))})`
    );
  }

  /**
   * Adds a sub model to the model.
   */
  addSubModel(
    parameters: Array<string> | ReadonlyArray<string>,
    order?: number
  ) {
    const format = parameters.map((parameter) => this.validateValue(parameter));

    for (const parameter of format) {
      if (!this.model.parameters.has(parameter)) {
        throw new Error(`Parameter "${String(parameter)}" is not defined`);
      }
    }

    const subModel: ModelBuilderSubModel = {
      parameters: format,
    };

    if (isNumber(order)) {
      subModel.order = order;
    }

    this.model.sub.push(subModel);
  }

  /**
   * Adds a constraint to the model.
   */
  addConstraint(constraint: string) {
    this.model.constraints.push(constraint);
  }

  /**
   * Returns the model as a PICT model string.
   * Can be used to generate a PICT model file.
   */
  getModelText() {
    let text = "";
    text += this.getMainModelText();

    if (this.model.sub.length) {
      text += EOL;
      text += this.getSubModelText();
    }

    if (this.model.constraints.length) {
      text += EOL;
      text += this.getConstraintText();
    }

    return text;
  }

  /**
   * Returns the separators used by the model.
   */
  getSeparators() {
    return {
      aliasSeparator: this.aliasSeparator,
      valueSeparator: this.valueSeparator,
      negativePrefix: this.negativePrefix,
    };
  }

  private getConstraintText() {
    return this.model.constraints.join(EOL);
  }

  private getParameterValues(key: string) {
    let array = this.model.parameters.get(key);
    if (!array) {
      array = [];
      this.model.parameters.set(key, array);
    }
    return array;
  }

  private getMainModelText() {
    const parameters = [...this.model.parameters.entries()];

    let string = "";
    parameters.forEach(([key, values], index, array) => {
      string += `${String(key)}:`;
      string += values.join(this.valueSeparator);
      if (index !== array.length - 1) {
        string += EOL;
      }
    });
    return string;
  }

  private getSubModelText() {
    let string = "";
    this.model.sub.forEach((subModel, index, array) => {
      string += "{";
      string += subModel.parameters.join(",");
      string += "}";
      if (isNumber(subModel.order)) {
        string += `@${subModel.order}`;
      }
      if (index !== array.length - 1) {
        string += EOL;
      }
    });
    return string;
  }

  private validateValue(value: unknown) {
    if (!isString(value)) {
      throw new Error("Value must be a string");
    }
    if (value.includes(this.aliasSeparator)) {
      throw new Error("Value cannot contain the alias separator");
    }
    if (value.includes(this.valueSeparator)) {
      throw new Error("Value cannot contain the value separator");
    }
    if (value.includes(this.negativePrefix)) {
      throw new Error("Value cannot contain the negative prefix");
    }

    return value.trim().replace(/[\n|\t]/gm, "");
  }

  static validateSeparator(separator: unknown) {
    if (!isString(separator)) {
      throw new Error("Separator must be a string");
    }
    if (separator.length !== 1) {
      throw new Error("Separator must be a single character");
    }

    return separator;
  }
}
