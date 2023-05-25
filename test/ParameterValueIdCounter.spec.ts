import { ParameterValuesIdCounter } from "../src/api/pict/ParameterValueIdCounter";

describe("ParameterValueIdCounter", () => {
  let instance: ParameterValuesIdCounter;

  beforeEach(() => {
    instance = new ParameterValuesIdCounter();
  });

  test("Should create an instance", () => {
    expect(instance).toBeInstanceOf(ParameterValuesIdCounter);
  });

  test("Should increment the parameter and return its id", () => {
    const id1 = instance.nextParameter();
    expect(id1).toBe("0");
    const id2 = instance.nextParameter();
    expect(id2).toBe("1");
  });

  test("Should increment the parameter and value ids", () => {
    const id1 = instance.nextParameter();
    expect(id1).toBe("0");
    const id2 = instance.nextValue();
    expect(id2).toBe("0.0");
    const id3 = instance.nextValue();
    expect(id3).toBe("0.1");
  });

  test("Should reset the value id after incrementing the parameter id", () => {
    const id1 = instance.nextParameter();
    expect(id1).toBe("0");
    const id2 = instance.nextValue();
    expect(id2).toBe("0.0");
    const id3 = instance.nextValue();
    expect(id3).toBe("0.1");
    const id4 = instance.nextParameter();
    expect(id4).toBe("1");
    const id5 = instance.nextValue();
    expect(id5).toBe("1.0");
    const id6 = instance.nextParameter();
    expect(id6).toBe("2");
  });
});
