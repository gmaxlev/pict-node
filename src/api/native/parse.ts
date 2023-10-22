import { pictEntries } from "../../common/pict";

export function parseResult(result: string): Array<Record<string, string>> {
  const cases: any[] = [];

  for (const item of pictEntries(result)) {
    let currentCase;

    if (item.valueIndex === 0) {
      currentCase = {};
      cases.push(currentCase);
    } else {
      currentCase = cases[cases.length - 1];
    }

    currentCase[item.rowName as string] = item.value;

    cases[cases.length - 1] = currentCase;
  }

  return cases;
}
