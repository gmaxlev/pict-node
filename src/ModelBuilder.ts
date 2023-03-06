import { isNumber } from "./types";

/**
 * This is a simple and universal model builder for PICT.
 */

interface SubModelObject {
  parameters: PropertyKey[];
  order?: number;
}

type ConstraintObject = string;

interface ModelObject {
  parameters: Map<PropertyKey, unknown[]>;
  sub: Array<SubModelObject>;
  constraints: ConstraintObject[];
}

export class ModelBuilder {
  private model: ModelObject = {
    parameters: new Map(),
    sub: [],
    constraints: [],
  };

  addParameter(key: PropertyKey, value: unknown) {
    const array = this.getParameterValues(key);
    array.push(value);
  }

  addAliasParameter(key: PropertyKey, values: unknown[]) {
    const array = this.getParameterValues(key);
    array.push(values.join("|"));
  }

  addNegativeParameter(key: PropertyKey, value: unknown) {
    const array = this.getParameterValues(key);
    array.push(`~${value}`);
  }

  addParameterWithWeight(key: PropertyKey, value: unknown, weight: number) {
    const array = this.getParameterValues(key);
    array.push(`${value}(${weight})`);
  }

  private getParameterValues(key: PropertyKey) {
    let array = this.model.parameters.get(key);
    if (!array) {
      array = [];
      this.model.parameters.set(key, array);
    }
    return array;
  }

  addSubModel(parameters: PropertyKey[], order?: number) {
    for (const parameter of parameters) {
      if (!this.model.parameters.has(parameter)) {
        throw new Error(`Parameter "${String(parameter)}" is not defined`);
      }
    }

    const subModel: SubModelObject = {
      parameters,
    };

    if (isNumber(order)) {
      subModel.order = order;
    }

    this.model.sub.push(subModel);
  }

  addConstraint(constraint: string) {
    this.model.constraints.push(constraint);
  }

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

  getConstraintText() {
    return this.model.constraints.join("\n");
  }
}
