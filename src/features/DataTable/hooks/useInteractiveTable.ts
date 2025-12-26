import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTableContext } from "./useTableContext";
import { DataAttributes } from "../config";
import { getClosestXCells } from "../utils";
import { createColorSampler } from "@/lib/colorSampler";
import useThrottleCallback from "@/hooks/useThrottleCallback";
import type { Row } from "@tanstack/react-table";
import type { Cell } from "../types";

const getHeatmapColor = createColorSampler("--heatmap-colors");

type InteractionMode = "highlight" | "heatmap" | "none";

type CellMutationResult = {
  cells: HTMLElement[];
  cleanup: (cell: HTMLElement) => void;
};

const getCellRowColumnIndices = (target: HTMLElement) => ({
  rowIndex: Number(target.closest("tr")?.getAttribute("data-index") ?? -1),
  columnIndex: Number(target.getAttribute(DataAttributes.CELL) ?? -1),
});

const createCellId = (row: number, col: number) => `${row}_${col}`;

type UseInteractiveTableProps = {
  renderRows: Row<Cell[]>[];
  tableRef: React.RefObject<HTMLTableElement | null>;
  cellMapRef: React.RefObject<Map<string, HTMLTableCellElement>>;
};

export const useInteractiveTable = ({
  renderRows,
  tableRef,
  cellMapRef,
}: UseInteractiveTableProps) => {
  const { data, stats, onHandleClick, closest, sortedData, cellIndex } =
    useTableContext();

  const { max } = stats;

  const columnsCount = useMemo(() => data[0]?.length ?? 0, [data]);

  const prevTargetRef = useRef<HTMLElement | null>(null);

  const interactionRef = useRef<{
    mode: InteractionMode;
    result: CellMutationResult | null;
  }>({
    mode: "none",
    result: null,
  });

  const resetInteraction = useCallback(() => {
    const current = interactionRef.current.result;
    if (!current) return;

    current.cells.forEach((cell) => current.cleanup(cell));
    interactionRef.current.result = null;
    interactionRef.current.mode = "none";
  }, []);

  const highlightClosestCells = useCallback(
    (rowIndex: number, columnIndex: number): CellMutationResult => {
      const cellData = data[rowIndex]?.[columnIndex];
      if (!cellData) return { cells: [], cleanup: () => {} };

      const closestCells = getClosestXCells(
        sortedData,
        cellIndex,
        cellData,
        closest,
      );

      const cells: HTMLElement[] = [];

      closestCells.forEach(({ row, col }) => {
        const el = cellMapRef.current?.get(createCellId(row, col));
        if (el) {
          el.classList.add("highlighted");
          cells.push(el);
        }
      });

      return {
        cells,
        cleanup: (cell) => cell.classList.remove("highlighted"),
      };
    },
    [closest, columnsCount, data, sortedData, cellIndex, cellMapRef],
  );

  const colorizeRowHeatmap = useCallback(
    (rowIndex: number): CellMutationResult => {
      const row = renderRows[rowIndex];
      const rowMax = max[rowIndex];

      if (!row || !rowMax) return { cells: [], cleanup: () => {} };

      const cells: HTMLElement[] = [];

      row
        .getVisibleCells()
        .filter((cell) => cell.column.columnDef.meta?.dataCell)
        .forEach((cell) => {
          const [r, c] = cell.id.split("_").map(Number);
          const value = data[r]?.[c]?.value;
          const el = cellMapRef.current?.get(cell.id);

          if (!el || value == null) return;

          el.style.backgroundColor = getHeatmapColor(value / rowMax);
          el.classList.add("heatmap-cell");
          cells.push(el);
        });

      return {
        cells,
        cleanup: (cell) => {
          cell.classList.remove("heatmap-cell");
          cell.style.backgroundColor = "";
        },
      };
    },
    [data, max, renderRows, cellMapRef],
  );

  const applyInteraction = useCallback(
    (mode: InteractionMode, target: HTMLElement) => {
      resetInteraction();

      if (!tableRef.current) return;
      if (mode === "none") return;

      const { rowIndex, columnIndex } = getCellRowColumnIndices(target);

      const result =
        mode === "highlight"
          ? highlightClosestCells(rowIndex, columnIndex)
          : colorizeRowHeatmap(rowIndex);

      interactionRef.current = { mode, result };
    },
    [highlightClosestCells, colorizeRowHeatmap, resetInteraction, tableRef],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLTableElement>) => {
      const target = e.target as HTMLElement;
      if (target === prevTargetRef.current) return;

      prevTargetRef.current = target;

      if (target.hasAttribute(DataAttributes.CELL)) {
        applyInteraction("highlight", target);
      } else if (target.hasAttribute(DataAttributes.ROW_SUM_CELL)) {
        applyInteraction("heatmap", target);
      } else {
        resetInteraction();
      }
    },
    [applyInteraction, resetInteraction],
  );

  const onMouseLeave = useCallback(() => {
    resetInteraction();
    prevTargetRef.current = null;
  }, [resetInteraction]);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLTableElement>) => {
      const target = e.target as HTMLElement;
      if (!target.hasAttribute(DataAttributes.CELL)) return;

      const { rowIndex, columnIndex } = getCellRowColumnIndices(target);
      const value = data[rowIndex]?.[columnIndex]?.value;
      if (value == null) return;

      onHandleClick(rowIndex, columnIndex, value + 1);
    },
    [data, onHandleClick],
  );

  useEffect(() => {
    const target = prevTargetRef.current;
    if (target?.hasAttribute(DataAttributes.CELL)) {
      applyInteraction("highlight", target);
    }
  }, [data, applyInteraction]);

  return {
    cellMapRef,
    onMouseLeave,
    onClick,
    onMouseMove: useThrottleCallback(onMouseMove, 10),
  };
};
