import type { ActionOf, TableAction, TableState } from "../types";
import { generateRow } from "../../utils";
import { MAX_CELL_VALUE } from "../../config";
import { merge } from "@/lib/utils";

const setSettings = (state: TableState, action: ActionOf<"SET_SETTINGS">) => {
  const { rows, columns, closest } = action.payload;
  return merge(state, {
    rows,
    columns,
    closest,
  });
};

const generateTable = (state: TableState, _action: ActionOf<"GENERATE">) => {
  const { rows, columns } = state;
  const data = [];
  for (let i = 0; i < rows; i++) {
    const row = generateRow(columns, i * columns);
    data.push(row);
  }
  return merge(state, {
    data,
  });
};

const addRow = (state: TableState, _action: ActionOf<"ADD_ROW">) => {
  const { data, rows, columns } = state;
  const newValues = data.map((row) => row.map((cell) => ({ ...cell })));
  const newRow = generateRow(columns, rows * columns);
  newValues.push(newRow);
  return merge(state, {
    data: newValues,
    rows: rows + 1,
  });
};

const deleteRow = (state: TableState, action: ActionOf<"DELETE_ROW">) => {
  const { columns, rows, data } = state;
  const { rowIndex } = action.payload;
  const newValues = data
    .filter((_, index) => index !== rowIndex)
    .map((row, index) => {
      if (index >= rowIndex) {
        return row.map((cell) => ({ ...cell, id: cell.id - columns }));
      }
      return row;
    });
  return merge(state, {
    data: newValues,
    rows: rows - 1,
  });
};

const updateCell = (state: TableState, action: ActionOf<"UPDATE_CELL">) => {
  const { data } = state;
  const { rowIndex, columnIndex, newValue } = action.payload;

  const newValues = data.map((row) => row.map((cell) => ({ ...cell })));
  newValues[rowIndex][columnIndex] = {
    ...newValues[rowIndex][columnIndex],
    value: Math.min(newValue, MAX_CELL_VALUE),
  };
  return merge(state, {
    data: newValues,
  });
};

export function applyTableMutation(
  _oldState: TableState,
  newState: TableState,
  action: TableAction,
): TableState {
  if (action.type === "GENERATE") {
    return generateTable(newState, action);
  } else if (action.type === "SET_SETTINGS") {
    return setSettings(newState, action);
  } else if (action.type === "ADD_ROW") {
    return addRow(newState, action);
  } else if (action.type === "DELETE_ROW") {
    return deleteRow(newState, action);
  } else if (action.type === "UPDATE_CELL") {
    return updateCell(newState, action);
  }
  return newState;
}
