import { useEffect, useReducer } from "react";
import TableComponent from "./components/Table";
import Form from "./components/Form";
import { TableContext } from "./context";
import { reducer } from "./state";
import { MAX_COLUMNS, MAX_ROWS } from "./config";
import useDebounceCallback from "@/hooks/useDebounceCallback";

import "./style.css";

const Table = () => {
  const [tableState, dispatch] = useReducer(reducer, {
    data: [],
    rows: 10,
    columns: 10,
    closest: 5,
  });

  const delayedTableDataGeneration = useDebounceCallback(() => {
    dispatch({ type: "GENERATE" });
  }, 350);

  const onGenerate = ({
    rows: newRows,
    columns: newColumns,
    closest: newClosest,
  }: {
    rows: number;
    columns: number;
    closest: number;
  }) => {
    newRows = Math.min(newRows, MAX_ROWS);
    newColumns = Math.min(newColumns, MAX_COLUMNS);
    const maxClosest = Math.floor((newRows * newColumns) / 2);
    dispatch({
      type: "SET_SETTINGS",
      payload: {
        rows: newRows,
        columns: newColumns,
        closest: maxClosest < newClosest ? maxClosest : newClosest,
      },
    });
    if (newRows === tableState.rows && newColumns === tableState.columns) {
      return;
    }
    delayedTableDataGeneration();
  };

  const handleAdd = () => {
    dispatch({ type: "ADD_ROW" });
  };

  const handleDelete = (rowIndex: number) => {
    dispatch({ type: "DELETE_ROW", payload: { rowIndex } });
  };

  const handleClick = (cellId: number, newValue: number) => {
    dispatch({ type: "UPDATE_CELL", payload: { cellId, newValue } });
  };

  useEffect(() => {
    dispatch({ type: "GENERATE" });
  }, []);
  return (
    <TableContext.Provider
      value={{
        data: tableState.data,
        rows: tableState.rows,
        columns: tableState.columns,
        closest: tableState.closest,
        onGenerate: onGenerate,
        onHandleClick: handleClick,
        onHandleAdd: handleAdd,
        onHandleDelete: handleDelete,
      }}
    >
      <Form />
      <TableComponent />
    </TableContext.Provider>
  );
};

export default Table;
