import { MAX_CELL_VALUE } from "./config";
import type { Cell } from "./types";
import {
  generateRow,
  getColumnIndexFromCellId,
  getRowIndexFromCellId,
} from "./utils";

export type TableState = {
  data: Cell[][];
  rows: number;
  columns: number;
  closest: number;
};

export type TableAction =
  | { type: "GENERATE" }
  | {
      type: "SET_SETTINGS";
      payload: { rows: number; columns: number; closest: number };
    }
  | { type: "ADD_ROW" }
  | { type: "DELETE_ROW"; payload: { rowIndex: number } }
  | { type: "UPDATE_CELL"; payload: { cellId: number; newValue: number } };

export function reducer(state: TableState, action: TableAction): TableState {
  if (action.type === "GENERATE") {
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
  } else if (action.type === "SET_SETTINGS") {
    const { rows, columns, closest } = action.payload;
    return {
      ...state,
      rows,
      columns,
      closest,
    };
  } else if (action.type === "ADD_ROW") {
    const { data, rows, columns } = state;
    const newValues = data.map((row) => row.map((cell) => ({ ...cell })));
    const newRow = generateRow(columns, rows * columns);
    newValues.push(newRow);
    return {
      ...state,
      data: newValues,
      rows: rows + 1,
    };
  } else if (action.type === "DELETE_ROW") {
    const { columns, data } = state;
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
      rows: state.rows - 1,
    };
  } else if (action.type === "UPDATE_CELL") {
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
  }
  return state;
}
