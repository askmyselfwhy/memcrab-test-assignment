import type { ActionOf, TableAction, TableState } from "../types";
import type { Cell } from "../../types";
import { getPercentile } from "@/lib/algorithms";
import { merge } from "@/lib/utils";

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

function revalidateStats(data: Cell[][]): {
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

const setSettings = (
  _oldState: TableState,
  newState: TableState,
  _action: ActionOf<"SET_SETTINGS">,
) => {
  return newState;
};

const generateTable = (
  _oldState: TableState,
  newState: TableState,
  _action: ActionOf<"GENERATE">,
) => {
  return merge(newState, {
    stats: revalidateStats(newState.data),
  });
};

const addRow = (
  oldState: TableState,
  newState: TableState,
  _action: ActionOf<"ADD_ROW">,
) => {
  const { max, sum } = getRowsStats([newState.data[newState.data.length - 1]]);
  const columnStats = getColumnsStats(newState.data);
  return merge(newState, {
    stats: {
      sum: [...oldState.stats.sum, sum[0]],
      max: [...oldState.stats.max, max[0]],
      percentiles: columnStats.percentiles,
    },
  });
};

const deleteRow = (
  oldState: TableState,
  newState: TableState,
  action: ActionOf<"DELETE_ROW">,
) => {
  const { rowIndex } = action.payload;
  const columnStats = getColumnsStats(newState.data);
  return merge(newState, {
    stats: {
      sum: oldState.stats.sum.filter((_, index) => index !== rowIndex),
      max: oldState.stats.max.filter((_, index) => index !== rowIndex),
      percentiles: columnStats.percentiles,
    },
  });
};

const updateCell = (
  oldState: TableState,
  newState: TableState,
  action: ActionOf<"UPDATE_CELL">,
) => {
  const { data } = oldState;
  const { rowIndex, columnIndex, newValue } = action.payload;

  const oldValue = data[rowIndex][columnIndex].value;

  return merge(newState, {
    stats: {
      sum: oldState.stats.sum.map((rowSum, rIndex) =>
        rowIndex === rIndex ? rowSum + (newValue - oldValue) : rowSum,
      ),
      max: oldState.stats.max.map((rowMax, rIndex) =>
        rowIndex === rIndex ? Math.max(rowMax, newValue) : rowMax,
      ),
      percentiles: oldState.stats.percentiles.map((colPercentile, cIndex) =>
        columnIndex === cIndex
          ? getColumnPercentile(data, columnIndex)
          : colPercentile,
      ),
    },
  });
};

/**
 * low level optimizations to avoid recalculating all stats on each action
 */
export function applyStatsMutation(
  oldState: TableState,
  newState: TableState,
  action: TableAction,
): TableState {
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
  return merge(newState, {
    stats: revalidateStats(newState.data),
  });
}
