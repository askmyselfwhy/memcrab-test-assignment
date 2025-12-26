import { useCallback, useMemo } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  useVirtualizer,
  defaultRangeExtractor,
  Virtualizer,
} from "@tanstack/react-virtual";
import type { Range } from "@tanstack/react-virtual";
import { useTableContext } from "./useTableContext";
import { useTableColumns } from "./useTableColumns";

import type { Cell, Table } from "../types";

type ReturnType = {
  table: Table;
  columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  virtualPaddingLeft: number | undefined;
  virtualPaddingRight: number | undefined;
};

type UseTableVirtualizerOptions = {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  cellMapRef: React.RefObject<Map<string, HTMLTableCellElement>>;
};

export const useTableVirtualizer = ({
  tableContainerRef,
  cellMapRef,
}: UseTableVirtualizerOptions): ReturnType => {
  const { data } = useTableContext();
  const columns = useTableColumns({ cellMapRef });
  const table = useReactTable<Cell[]>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const stickyColumnCountLeft = useMemo(
    () => columns.filter((column) => column.meta?.sticky === "left").length,
    [columns],
  );
  const stickyColumnCountRight = useMemo(
    () => columns.filter((column) => column.meta?.sticky === "right").length,
    [columns],
  );

  const mainColumns = table.getAllLeafColumns();

  const columnVirtualizer = useVirtualizer<
    HTMLDivElement,
    HTMLTableCellElement
  >({
    count: mainColumns.length,
    estimateSize: (index) => mainColumns[index].getSize(),
    getScrollElement: () => tableContainerRef.current,
    horizontal: true,
    overscan: (stickyColumnCountLeft + stickyColumnCountRight) * 2,
    rangeExtractor: useCallback(
      (range: Range) => {
        const next = new Set([
          ...Array.from({ length: stickyColumnCountLeft }, (_, i) => i),
          ...defaultRangeExtractor(range),
          ...Array.from(
            { length: stickyColumnCountRight },
            (_, i) => columns.length - (i + 1),
          ),
        ]);
        return [...next].sort((a, b) => a - b);
      },
      [columns.length, stickyColumnCountLeft, stickyColumnCountRight],
    ),
  });

  const virtualColumns = columnVirtualizer.getVirtualItems();

  let virtualPaddingLeft: number | undefined;
  let virtualPaddingRight: number | undefined;

  if (columnVirtualizer && virtualColumns?.length) {
    virtualPaddingLeft = virtualColumns[0]?.start ?? 0;
    virtualPaddingRight =
      columnVirtualizer.getTotalSize() -
      (virtualColumns[virtualColumns.length - 1]?.end ?? 0);
  }
  return {
    table,
    columnVirtualizer,
    virtualPaddingLeft,
    virtualPaddingRight,
  };
};
