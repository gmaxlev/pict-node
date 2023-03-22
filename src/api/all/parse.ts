import { pictEntries } from "../../common/pict";
import type { ValuesIdMap } from "./ValuesIdMap";

export function parseResult(
  result: string,
  valuesIdMap: ValuesIdMap
): Array<Record<PropertyKey, unknown>> {
  const cases: any[] = [];

  for (const item of pictEntries(result)) {
    let currentCase;

    if (item.valueIndex === 0) {
      currentCase = {};
      cases.push(currentCase);
    } else {
      currentCase = cases[cases.length - 1];
    }

    const from = valuesIdMap.idToValuesMap.get(item.value);

    if (!from) {
      throw new Error(`Can't find value by id ${item.value}`);
    }

    currentCase[from.parameter.name] = from.value;

    cases[cases.length - 1] = currentCase;
  }

  return cases;
}
