import type { PictModelId } from "./types";

export class ParameterValuesIdCounter {
  private parameter = -1;
  private value = -1;

  constructor() {}

  public nextParameter(): PictModelId {
    const parameter = ++this.parameter;
    this.value = -1;

    return String(parameter);
  }

  public nextValue(): PictModelId {
    const value = ++this.value;

    return `${this.parameter}.${value}`;
  }
}
