import type { Cell } from "../types";

export type TableState = {
  data: Cell[][];
  rows: number;
  columns: number;
  closest: number;
  stats: {
    sum: number[];
    max: number[];
    percentiles: number[];
  };
};

export type TableAction =
  | { type: "GENERATE" }
  | {
      type: "SET_SETTINGS";
      payload: { rows: number; columns: number; closest: number };
    }
  | { type: "ADD_ROW" }
  | { type: "DELETE_ROW"; payload: { rowIndex: number } }
  | {
      type: "UPDATE_CELL";
      payload: { rowIndex: number; columnIndex: number; newValue: number };
    };

export type ActionOf<T extends TableAction["type"]> = Extract<
  TableAction,
  { type: T }
>;
