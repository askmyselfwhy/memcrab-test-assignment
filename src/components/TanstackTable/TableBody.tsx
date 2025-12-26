import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import type { Table } from "@tanstack/react-table";
import TableDataRow from "./TableBodyRow";

interface TableBodyProps<T = unknown> {
  columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  table: Table<T>;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  virtualPaddingLeft: number | undefined;
  virtualPaddingRight: number | undefined;
}

function TableBody({
  columnVirtualizer,
  table,
  tableContainerRef,
  virtualPaddingLeft,
  virtualPaddingRight,
}: TableBodyProps) {
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 24,
    getScrollElement: () => tableContainerRef?.current || null,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <>
      <tbody
        style={{
          display: "grid",
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualRows.map((virtualRow, index) => {
          const row = rows[virtualRow.index];

          return (
            <TableDataRow
              key={row.id}
              row={row}
              columnVirtualizer={columnVirtualizer}
              virtualPaddingLeft={virtualPaddingLeft}
              virtualPaddingRight={virtualPaddingRight}
              virtualRow={virtualRow}
            />
          );
        })}
      </tbody>
    </>
  );
}

export default TableBody;
