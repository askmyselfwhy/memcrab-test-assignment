import React from "react";
import { TableContext } from "../context";

export const useTableContext = () => {
  const context = React.useContext(TableContext);
  if (!context) {
    throw new Error(
      "useTableContext must be used within a TableContext.Provider",
    );
  }
  return context;
};
