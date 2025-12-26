import { useRef } from "react";
import TableBody from "@/components/TanstackTable/TableBody";
import TableHead from "@/components/TanstackTable/TableHead";
import TableFoot from "@/components/TanstackTable/TableFoot";
import { useInteractiveTable } from "../hooks/useInteractiveTable";
import { useTableVirtualizer } from "../hooks/useTableVirtualizer";

const Table = () => {
  const cellMapRef = useRef<Map<string, HTMLTableCellElement>>(new Map());
  const tableRef = useRef<HTMLTableElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { table, columnVirtualizer, virtualPaddingLeft, virtualPaddingRight } =
    useTableVirtualizer({
      tableContainerRef,
      cellMapRef,
    });

  const { onMouseLeave, onClick, onMouseMove } = useInteractiveTable({
    renderRows: table.getRowModel().rows,
    tableRef,
    cellMapRef,
  });

  return (
    <div
      style={{
        position: "relative",
        outline: "1px solid #ebebeb",
      }}
    >
      <div
        className="container"
        ref={tableContainerRef}
        style={{
          overflow: "auto",
          position: "relative",
          resize: "both",
          maxWidth: "960px",
          maxHeight: "600px",
          zIndex: 1,
        }}
      >
        <table
          style={{ display: "grid", tableLayout: "fixed" }}
          ref={tableRef}
          onPointerOver={onMouseMove}
          onPointerLeave={onMouseLeave}
          onClick={onClick}
        >
          <TableHead
            table={table}
            columnVirtualizer={columnVirtualizer}
            virtualPaddingLeft={virtualPaddingLeft}
            virtualPaddingRight={virtualPaddingRight}
          />
          <TableBody
            columnVirtualizer={columnVirtualizer}
            table={table}
            tableContainerRef={tableContainerRef}
            virtualPaddingLeft={virtualPaddingLeft}
            virtualPaddingRight={virtualPaddingRight}
          />
          <TableFoot
            table={table}
            columnVirtualizer={columnVirtualizer}
            virtualPaddingLeft={virtualPaddingLeft}
            virtualPaddingRight={virtualPaddingRight}
          />
        </table>
      </div>
    </div>
  );
};

export default Table;
