import type { ActionOf, TableAction, TableState } from "./types";
import {
  generateRow,
  getColumnIndexFromCellId,
  getRowIndexFromCellId,
} from "../utils";
import { MAX_CELL_VALUE } from "../config";

export const setSettings = (
  state: TableState,
  action: ActionOf<"SET_SETTINGS">,
) => {
  const { rows, columns, closest } = action.payload;
  return {
    ...state,
    rows,
    columns,
    closest,
  };
};

export const generateTable = (state: TableState) => {
  const { rows, columns } = state;
  const data = [];
  for (let i = 0; i < rows; i++) {
    const row = generateRow(columns, i * columns);
    data.push(row);
  }
  return {
    ...state,
    data,
  };
};

export const addRow = (state: TableState, _action: ActionOf<"ADD_ROW">) => {
  const { data, rows, columns } = state;
  const newValues = data.map((row) => row.map((cell) => ({ ...cell })));
  const newRow = generateRow(columns, rows * columns);
  newValues.push(newRow);
  return {
    ...state,
    data: newValues,
    rows: rows + 1,
  };
};

export const deleteRow = (
  state: TableState,
  action: ActionOf<"DELETE_ROW">,
) => {
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
  return {
    ...state,
    data: newValues,
    rows: rows - 1,
  };
};

export const updateCell = (
  state: TableState,
  action: ActionOf<"UPDATE_CELL">,
) => {
  const { columns, data } = state;
  const { cellId, newValue } = action.payload;
  const rowIndex = getRowIndexFromCellId(cellId, columns);
  const colIndex = getColumnIndexFromCellId(cellId, columns);

  const newValues = data.map((row) => row.map((cell) => ({ ...cell })));
  newValues[rowIndex][colIndex] = {
    ...newValues[rowIndex][colIndex],
    value: Math.min(newValue, MAX_CELL_VALUE),
  };
  return {
    ...state,
    data: newValues,
  };
};

export function applyTableMutation(
  state: TableState,
  action: TableAction,
): TableState {
  if (action.type === "GENERATE") {
    return generateTable(state);
  } else if (action.type === "SET_SETTINGS") {
    return setSettings(state, action);
  } else if (action.type === "ADD_ROW") {
    return addRow(state, action);
  } else if (action.type === "DELETE_ROW") {
    return deleteRow(state, action);
  } else if (action.type === "UPDATE_CELL") {
    return updateCell(state, action);
  }
  return state;
}
