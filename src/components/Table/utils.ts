import { MAX_CELL_VALUE } from "./config";
import type { Cell } from "./types";

export function getRowIndexFromCellId(cellId: number, columns: number): number {
  return Math.floor(cellId / columns);
}

export function getColumnIndexFromCellId(
  cellId: number,
  columns: number,
): number {
  return cellId % columns;
}

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
  values: Cell[],
  target: Cell,
  count: number,
): Cell[] {
  if (count <= 0) return [];

  const closest: { cell: Cell; dist: number }[] = [];

  for (let i = 0; i < values.length; i++) {
    const cell = values[i];

    if (cell.id === target.id) continue;

    const dist = Math.abs(cell.value - target.value);

    if (closest.length < count) {
      closest.push({ cell, dist });
      closest.sort((a, b) => a.dist - b.dist);
    } else if (dist < closest[closest.length - 1].dist) {
      closest[closest.length - 1] = { cell, dist };
      closest.sort((a, b) => a.dist - b.dist);
    }
  }

  return closest.map((item) => item.cell);
}
