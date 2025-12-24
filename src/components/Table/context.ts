import React from "react";
import type { TableState } from "./state";

export const TableContext = React.createContext<
  TableState & {
    onGenerate: ({
      rows,
      columns,
      closest,
    }: {
      rows: number;
      columns: number;
      closest: number;
    }) => void;
    onHandleClick: (cellId: number, newValue: number) => void;
    onHandleAdd: () => void;
    onHandleDelete: (rowIndex: number) => void;
  }
>({
  rows: 0,
  columns: 0,
  closest: 0,
  data: [],
  onGenerate: () => {},
  onHandleClick: () => {},
  onHandleAdd: () => {},
  onHandleDelete: () => {},
});
