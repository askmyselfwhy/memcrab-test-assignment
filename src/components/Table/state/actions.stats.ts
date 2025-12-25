import { getColumnIndexFromCellId, getRowIndexFromCellId } from "../utils";
import type { ActionOf, TableAction, TableState } from "./types";
import type { Cell } from "../types";
import { getPercentile } from "@/lib/algorithms";

type StatsMutation = (
  oldState: TableState,
  newState: TableState,
  action: TableAction,
) => TableState["stats"];

function getColumnPercentile(data: Cell[][], colIndex: number): number {
  const columnValues = data.map((row) => row[colIndex].value);
  return getPercentile(columnValues, 60);
}

function getColumnsStats(data: Cell[][]): { percentiles: number[] } {
  if (!data.length)
    return {
      percentiles: [],
    };

  const { percentiles } = data[0].reduce(
    (acc, _column, colIndex) => {
      const percentile = getColumnPercentile(data, colIndex);
      acc.percentiles.push(percentile);
      return acc;
    },
    { percentiles: [] } as { percentiles: number[] },
  );
  return {
    percentiles,
  };
}

function getRowsStats(data: Cell[][]): { max: number[]; sum: number[] } {
  if (!data.length)
    return {
      max: [],
      sum: [],
    };
  const { max, sum } = data.reduce(
    (acc, row) => {
      const { max, sum } = row.reduce(
        (acc, cell) => {
          acc.sum += cell.value;
          acc.max = Math.max(acc.max, cell.value);
          return acc;
        },
        { sum: 0, max: -Infinity },
      );
      acc.max.push(max);
      acc.sum.push(sum);
      return acc;
    },
    { max: [], sum: [] } as { max: number[]; sum: number[] },
  );
  return { max, sum };
}

function updateAllStats(data: Cell[][]): {
  sum: number[];
  max: number[];
  percentiles: number[];
} {
  const { sum, max } = getRowsStats(data);
  const { percentiles } = getColumnsStats(data);
  return {
    sum,
    max,
    percentiles,
  };
}

export const setSettings: StatsMutation = (
  _oldState: TableState,
  _newState: TableState,
) => {
  return {
    sum: [],
    max: [],
    percentiles: [],
  };
};

export const generateTable = (
  _oldState: TableState,
  newState: TableState,
  _action: ActionOf<"GENERATE">,
) => {
  return updateAllStats(newState.data);
};

export const addRow: StatsMutation = (
  oldState: TableState,
  newState: TableState,
) => {
  const { max, sum } = getRowsStats([newState.data[newState.data.length - 1]]);
  const columnStats = getColumnsStats(newState.data);
  return {
    sum: [...oldState.stats.sum, sum[0]],
    max: [...oldState.stats.max, max[0]],
    percentiles: columnStats.percentiles,
  };
};
export const deleteRow = (
  oldState: TableState,
  newState: TableState,
  action: ActionOf<"DELETE_ROW">,
) => {
  const { rowIndex } = action.payload;
  const columnStats = getColumnsStats(newState.data);
  return {
    sum: oldState.stats.sum.filter((_, index) => index !== rowIndex),
    max: oldState.stats.max.filter((_, index) => index !== rowIndex),
    percentiles: columnStats.percentiles,
  };
};

export const updateCell = (
  oldState: TableState,
  newState: TableState,
  action: ActionOf<"UPDATE_CELL">,
) => {
  const { columns, data } = oldState;
  const { data: newData } = newState;
  const { cellId } = action.payload;

  const rowIndex = getRowIndexFromCellId(cellId, columns);
  const colIndex = getColumnIndexFromCellId(cellId, columns);

  const oldValue = data[rowIndex][colIndex].value;
  const newValue = newData[rowIndex][colIndex].value;

  return {
    sum: oldState.stats.sum.map((rowSum, rIndex) =>
      rowIndex === rIndex ? rowSum + (newValue - oldValue) : rowSum,
    ),
    max: oldState.stats.max.map((rowMax, rIndex) =>
      rowIndex === rIndex ? Math.max(rowMax, newValue) : rowMax,
    ),
    percentiles: oldState.stats.percentiles.map((colPercentile, cIndex) =>
      colIndex === cIndex ? getColumnPercentile(data, colIndex) : colPercentile,
    ),
  };
};

/**
 * low level optimizations to avoid recalculating all stats on each action
 */
export function applyStatsMutation(
  oldState: TableState,
  newState: TableState,
  action: TableAction,
): TableState["stats"] {
  if (action.type === "GENERATE") {
    return generateTable(oldState, newState, action);
  } else if (action.type === "SET_SETTINGS") {
    return setSettings(oldState, newState, action);
  } else if (action.type === "ADD_ROW") {
    return addRow(oldState, newState, action);
  } else if (action.type === "DELETE_ROW") {
    return deleteRow(oldState, newState, action);
  } else if (action.type === "UPDATE_CELL") {
    return updateCell(oldState, newState, action);
  }
  return updateAllStats(newState.data);
}
