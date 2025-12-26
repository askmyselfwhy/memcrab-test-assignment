import type {
  Cell as TanstackCell,
  ColumnDef,
  Table as TanstackTable,
  Column,
} from "@tanstack/react-table";

export type CellId = number;
export type CellValue = number;

export type Cell = {
  id: CellId;
  value: CellValue;
};

export type SortedCell = {
  cell: Cell;
  row: number;
  col: number;
  sortedIndex: number;
};

export type CellIndex = Map<CellId, number>;

export type TableRow = Cell[];
export type TableColumn = Column<Cell[], unknown>;
export type Table = TanstackTable<Cell[]>;
export type TableCell = TanstackCell<Cell[], unknown>;
export type TableColumnDef = ColumnDef<Cell[], unknown>;
