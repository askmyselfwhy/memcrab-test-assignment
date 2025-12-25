import React from "react";
import type { TableState } from "./state/types";
import initialState from "./state/initialState";

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
    onHandleClick: (
      rowIndex: number,
      columnIndex: number,
      newValue: number,
    ) => void;
    onHandleAdd: () => void;
    onHandleDelete: (rowIndex: number) => void;
  }
>({
  ...initialState,
  onGenerate: () => {},
  onHandleClick: () => {},
  onHandleAdd: () => {},
  onHandleDelete: () => {},
});
