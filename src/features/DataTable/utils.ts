import { MAX_CELL_VALUE } from "./config";
import type { Cell, CellIndex, SortedCell } from "./types";

export function generateRow(columns: number, startId: number): Cell[] {
  const row: Cell[] = [];
  for (let j = 0; j < columns; j++) {
    row.push({
      id: startId + j,
      value: Math.floor(Math.random() * MAX_CELL_VALUE),
    });
  }
  return row;
}

export function getClosestXCells(
  sorted: SortedCell[],
  cellIndex: CellIndex,
  target: Cell,
  count: number,
): SortedCell[] {
  const centerIndex = cellIndex.get(target.id);
  if (centerIndex == null || count <= 0) return [];

  const centerValue = sorted[centerIndex].cell.value;

  let left = centerIndex - 1;
  let right = centerIndex + 1;

  const result: SortedCell[] = [];

  while (result.length < count && (left >= 0 || right < sorted.length)) {
    if (left < 0) {
      result.push(sorted[right++]);
    } else if (right >= sorted.length) {
      result.push(sorted[left--]);
    } else {
      const leftDiff = Math.abs(sorted[left].cell.value - centerValue);
      const rightDiff = Math.abs(sorted[right].cell.value - centerValue);

      if (leftDiff <= rightDiff) {
        result.push(sorted[left--]);
      } else {
        result.push(sorted[right++]);
      }
    }
  }

  return result;
}
