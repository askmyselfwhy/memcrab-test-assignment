import type { ActionOf, TableAction, TableState } from "../types";
import type { CellIndex, SortedCell } from "../../types";
import { merge } from "@/lib/utils";

function findInsertIndex(arr: SortedCell[], value: number): number {
  let lo = 0;
  let hi = arr.length;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid].cell.value < value) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

const generateTable = (
  _oldState: TableState,
  newState: TableState,
  _action: ActionOf<"GENERATE">,
) => {
  const sortedData: SortedCell[] = [];
  const cellIndex: CellIndex = new Map();

  newState.data.forEach((row, r) =>
    row.forEach((cell, c) => {
      sortedData.push({ cell, row: r, col: c, sortedIndex: -1 });
    }),
  );

  sortedData.sort((a, b) => a.cell.value - b.cell.value);

  sortedData.forEach((e, i) => {
    e.sortedIndex = i;
    cellIndex.set(e.cell.id, i);
  });

  return merge(newState, {
    sortedData,
    cellIndex,
  });
};

const addRow = (
  oldState: TableState,
  newState: TableState,
  _action: ActionOf<"ADD_ROW">,
) => {
  const rowIndex = newState.data.length - 1;
  const { sortedData } = oldState;
  const cells = newState.data[rowIndex];

  const shifted = sortedData.map((e) =>
    e.row >= rowIndex ? { ...e, row: e.row + 1 } : e,
  );

  const newSorted = [...shifted];
  const newIndex: CellIndex = new Map();

  cells.forEach((cell, col) => {
    const entry: SortedCell = { cell, row: rowIndex, col, sortedIndex: -1 };
    const idx = findInsertIndex(newSorted, cell.value);
    newSorted.splice(idx, 0, entry);
  });

  newSorted.forEach((e, i) => {
    e.sortedIndex = i;
    newIndex.set(e.cell.id, i);
  });

  return merge(newState, {
    sortedData: newSorted,
    cellIndex: newIndex,
  });
};

const deleteRow = (
  oldState: TableState,
  newState: TableState,
  action: ActionOf<"DELETE_ROW">,
) => {
  const { rowIndex } = action.payload;
  const filtered = oldState.sortedData
    .filter((e) => e.row !== rowIndex)
    .map((e) => (e.row > rowIndex ? { ...e, row: e.row - 1 } : e));

  const newIndex: CellIndex = new Map();

  filtered.forEach((e, i) => {
    e.sortedIndex = i;
    newIndex.set(e.cell.id, i);
  });

  return merge(newState, {
    sortedData: filtered,
    cellIndex: newIndex,
  });
};

const updateCell = (
  oldState: TableState,
  newState: TableState,
  action: ActionOf<"UPDATE_CELL">,
) => {
  const { rowIndex, columnIndex, newValue } = action.payload;
  const { data } = newState;
  const { cellIndex, sortedData } = oldState;
  const dataCell = data[rowIndex][columnIndex];
  const oldIndex = cellIndex.get(dataCell.id);
  if (oldIndex == null) return newState;

  const entry = sortedData[oldIndex];

  const updatedEntry: SortedCell = {
    ...entry,
    cell: { ...entry.cell, value: newValue },
  };

  const newSorted = sortedData.filter((_, i) => i !== oldIndex);

  const insertIndex = findInsertIndex(newSorted, newValue);

  newSorted.splice(insertIndex, 0, updatedEntry);

  const newIndex: CellIndex = new Map();

  newSorted.forEach((e, i) => {
    e.sortedIndex = i;
    newIndex.set(e.cell.id, i);
  });

  return merge(newState, {
    sortedData: newSorted,
    cellIndex: newIndex,
  });
};

/**
 * low level optimizations to avoid recalculating all stats on each action
 */
export function applySortMutation(
  oldState: TableState,
  newState: TableState,
  action: TableAction,
): TableState {
  if (action.type === "GENERATE") {
    return generateTable(oldState, newState, action);
  } else if (action.type === "ADD_ROW") {
    return addRow(oldState, newState, action);
  } else if (action.type === "DELETE_ROW") {
    return deleteRow(oldState, newState, action);
  } else if (action.type === "UPDATE_CELL") {
    return updateCell(oldState, newState, action);
  }
  return newState;
}
