import { isNumber } from "../utils";

type ModelBuilderConstraint = string;

interface ModelBuilderSubModel {
  parameters: PropertyKey[];
  order?: number;
}

interface ModelBuilderModel {
  parameters: Map<PropertyKey, unknown[]>;
  sub: Array<ModelBuilderSubModel>;
  constraints: ModelBuilderConstraint[];
}

/**
 * This class is responsible for building the native PICT model.
 */
export class ModelBuilder {
  private model: ModelBuilderModel = {
    parameters: new Map(),
    sub: [],
    constraints: [],
  };

  /**
   * Adds a simple parameter to the model.
   */
  addParameter(key: PropertyKey, value: string) {
    const array = this.getParameterValues(key);
    array.push(value);
  }

  /**
   * Adds an alias parameter to the model.
   * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#aliasing}
   */
  addAliasParameter(key: PropertyKey, values: string[]) {
    const array = this.getParameterValues(key);
    array.push(values.join("|"));
  }

  /**
   * Adds a negative parameter to the model.
   * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#negative-testing}
   */
  addNegativeParameter(key: PropertyKey, value: string) {
    const array = this.getParameterValues(key);
    array.push(`~${value}`);
  }

  /**
   * Adds a parameter with a weight to the model.
   * @see {@link https://github.com/Microsoft/pict/blob/main/doc/pict.md#weighting}
   */
  addParameterWithWeight(key: PropertyKey, value: string, weight: number) {
    const array = this.getParameterValues(key);
    array.push(`${value}(${weight})`);
  }

  /**
   * Adds a sub model to the model.
   * Throws an error if any of the parameters do not exist.
   */
  addSubModel(parameters: PropertyKey[], order?: number) {
    for (const parameter of parameters) {
      if (!this.model.parameters.has(parameter)) {
        throw new Error(`Parameter "${String(parameter)}" is not defined`);
      }
    }

    const subModel: ModelBuilderSubModel = {
      parameters,
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
      text += "\n";
      text += this.getSubModelText();
    }

    if (this.model.constraints.length) {
      text += "\n";
      text += this.getConstraintText();
    }

    return text;
  }

  private getConstraintText() {
    return this.model.constraints.join("\n");
  }

  private getParameterValues(key: PropertyKey) {
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
      string += values.join(",");
      if (index !== array.length - 1) {
        string += "\n";
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
        string += "\n";
      }
    });
    return string;
  }
}
