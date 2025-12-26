import { flexRender } from "@tanstack/react-table";
import type { Header, HeaderGroup, Table } from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";

interface TableFootProps<T = unknown> {
  columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  table: Table<T>;
  virtualPaddingLeft: number | undefined;
  virtualPaddingRight: number | undefined;
}

function TableFoot({
  columnVirtualizer,
  table,
  virtualPaddingLeft,
  virtualPaddingRight,
}: TableFootProps) {
  return (
    <tfoot
      style={{
        display: "grid",
        position: "sticky",
        bottom: 0,
        zIndex: 1,
      }}
    >
      {table.getFooterGroups().map((headerGroup) => (
        <TableFootRow
          columnVirtualizer={columnVirtualizer}
          headerGroup={headerGroup}
          key={headerGroup.id}
          virtualPaddingLeft={virtualPaddingLeft}
          virtualPaddingRight={virtualPaddingRight}
        />
      ))}
    </tfoot>
  );
}

interface TableFootRowProps<T = unknown> {
  columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  headerGroup: HeaderGroup<T>;
  virtualPaddingLeft: number | undefined;
  virtualPaddingRight: number | undefined;
}

function TableFootRow({
  columnVirtualizer,
  headerGroup,
  virtualPaddingLeft,
  virtualPaddingRight,
}: TableFootRowProps) {
  const virtualColumns = columnVirtualizer.getVirtualItems();
  return (
    <tr key={headerGroup.id} style={{ display: "flex", width: "100%" }}>
      {virtualPaddingLeft ? (
        <th style={{ display: "flex", width: virtualPaddingLeft }} />
      ) : null}
      {virtualColumns.map((virtualColumn) => {
        const header = headerGroup.headers[virtualColumn.index];
        return <TableFootCell key={header.id} header={header} />;
      })}
      {virtualPaddingRight ? (
        <th style={{ display: "flex", width: virtualPaddingRight }} />
      ) : null}
    </tr>
  );
}

interface TableFootCellProps<T = unknown> {
  header: Header<T, unknown>;
}

function TableFootCell({ header }: TableFootCellProps) {
  return (
    <th
      key={header.id}
      style={{
        width: header.getSize(),
        fontWeight: "normal",
        backgroundColor: "#f9f9f9",
      }}
    >
      {flexRender(header.column.columnDef.footer, header.getContext())}
    </th>
  );
}

export default TableFoot;
