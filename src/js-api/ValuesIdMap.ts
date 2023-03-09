import type { PictModelId } from "./types";
import { isString } from "../utils";

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

/**
 * This class is used to store JavaScript representation of PICT model
 * and related unique ids that have been passed to PICT CLI instead of JS values (because it is impossible).
 * Since PICT CLI can return too many combinations, it would be very slow to use Object or Array methods
 * to find JS values by id. Instead of this, we create only one time a map of values to ids and vice versa.
 *
 * Generally, it can be used for the following purposes:
 * 1. Find initial values of PICT model by returned ids from PICT CLI.
 * 2. Using parameters names or its values after forming its ids (for example, during parsing seeds)
 */
export class ValuesIdMap {
  valuesToIdMap: ParametersMap = new Map();
  idToValuesMap: IdToValuesMap = new Map();

  /**
   * Receives the name of parameter and returns its id.
   */
  getParameterIdByParameterName(parameter: PropertyKey) {
    const parameterMap = this.valuesToIdMap.get(parameter);

    if (!parameterMap) {
      throw new Error(`Parameter "${String(parameter)}" not found`);
    }

    return parameterMap.id;
  }

  /**
   * Receives the id of parameter value and returns its value and its parameter info.
   */
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
      throw new Error(`Parameter "${String(parameter)}" not found`);
    }

    const valueId = parameterMap.values.get(value);

    if (!isString(valueId)) {
      throw new Error(`Value "${String(value)}" not found`);
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
        throw new Error(`Value "${String(value)}" already exists`);
      }

      parameterMap.values.set(value, valueId);
    }

    if (this.idToValuesMap.has(valueId)) {
      throw new Error(`Id "${valueId}" already exists`);
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
