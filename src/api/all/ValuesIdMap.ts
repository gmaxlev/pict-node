import type { PictModelId } from "../../common/types";
import { isString } from "../../common/utils";

type ParameterValueToIdMap = Map<unknown, PictModelId>;

interface ParametersMapValue {
  id: PictModelId;
  values: ParameterValueToIdMap;
}

type ParametersMap = Map<PropertyKey, ParametersMapValue>;

type IdToValuesMap = Map<
  PictModelId,
  {
    parameter: {
      id: PictModelId;
      name: PropertyKey;
    };
    value: unknown;
  }
>;

export class ValuesIdMap {
  valuesToIdMap: ParametersMap = new Map();
  idToValuesMap: IdToValuesMap = new Map();

  getParameterIdByParameterName(parameter: PropertyKey) {
    const parameterMap = this.valuesToIdMap.get(parameter);

    if (!parameterMap) {
      throw new Error(`Parameter "${String(parameter)}" has been not found`);
    }

    return parameterMap.id;
  }

  getValueByValueId(id: PictModelId) {
    const value = this.idToValuesMap.get(id);

    if (!value) {
      throw new Error(`Value with id "${id}" not found`);
    }

    return {
      value: value.value,
      parameter: value.parameter,
    };
  }

  getParameterAndValueIdFromValues(parameter: PropertyKey, value: unknown) {
    const parameterMap = this.valuesToIdMap.get(parameter);

    if (!parameterMap) {
      throw new Error(`Parameter "${String(parameter)}" has been not found`);
    }

    const valueId = parameterMap.values.get(value);

    if (!isString(valueId)) {
      throw new Error(`Value "${String(value)}" has been not found`);
    }

    return {
      parameterId: parameterMap.id,
      valueId,
    };
  }

  add(
    parameter: PropertyKey,
    parameterId: PictModelId,
    value: unknown,
    valueId: PictModelId
  ) {
    const parameterMap = this.valuesToIdMap.get(parameter);

    if (!parameterMap) {
      const newParameterMap: ParametersMapValue = {
        id: parameterId,
        values: new Map(),
      };

      newParameterMap.values.set(value, valueId);

      this.valuesToIdMap.set(parameter, newParameterMap);
    } else {
      if (parameterMap.values.has(value)) {
        throw new Error(`Value "${String(value)}" has already existed`);
      }

      parameterMap.values.set(value, valueId);
    }

    if (this.idToValuesMap.has(valueId)) {
      throw new Error(`Id "${valueId}" has already existed`);
    }

    this.idToValuesMap.set(valueId, {
      parameter: {
        id: parameterId,
        name: parameter,
      },
      value,
    });
  }
}
