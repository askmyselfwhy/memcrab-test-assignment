import { flexRender } from "@tanstack/react-table";
import type { Header, HeaderGroup, Table } from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";

interface TableHeadProps<T = unknown> {
  columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  table: Table<T>;
  virtualPaddingLeft: number | undefined;
  virtualPaddingRight: number | undefined;
}

function TableHead({
  columnVirtualizer,
  table,
  virtualPaddingLeft,
  virtualPaddingRight,
}: TableHeadProps) {
  return (
    <thead
      style={{
        display: "grid",
        position: "sticky",
        top: 0,
        zIndex: 1,
        visibility: "hidden",
        height: 0,
      }}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <TableHeadRow
          columnVirtualizer={columnVirtualizer}
          headerGroup={headerGroup}
          key={headerGroup.id}
          virtualPaddingLeft={virtualPaddingLeft}
          virtualPaddingRight={virtualPaddingRight}
        />
      ))}
    </thead>
  );
}

interface TableHeadRowProps<T = unknown> {
  columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  headerGroup: HeaderGroup<T>;
  virtualPaddingLeft: number | undefined;
  virtualPaddingRight: number | undefined;
}

function TableHeadRow({
  columnVirtualizer,
  headerGroup,
  virtualPaddingLeft,
  virtualPaddingRight,
}: TableHeadRowProps) {
  const virtualColumns = columnVirtualizer.getVirtualItems();
  return (
    <tr key={headerGroup.id} style={{ display: "flex", width: "100%" }}>
      {virtualPaddingLeft ? (
        <th style={{ display: "flex", width: virtualPaddingLeft }} />
      ) : null}
      {virtualColumns.map((virtualColumn) => {
        const header = headerGroup.headers[virtualColumn.index];
        return <TableHeadCell key={header.id} header={header} />;
      })}
      {virtualPaddingRight ? (
        <th style={{ display: "flex", width: virtualPaddingRight }} />
      ) : null}
    </tr>
  );
}

interface TableHeadCellProps<T = unknown> {
  header: Header<T, unknown>;
}

function TableHeadCell({ header }: TableHeadCellProps) {
  return (
    <th
      key={header.id}
      style={{
        display: "flex",
        width: header.getSize(),
      }}
    >
      <div
        {...{
          className: header.column.getCanSort()
            ? "cursor-pointer select-none"
            : "",
          onClick: header.column.getToggleSortingHandler(),
        }}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {{
          asc: " 🔼",
          desc: " 🔽",
        }[header.column.getIsSorted() as string] ?? null}
      </div>
    </th>
  );
}

export default TableHead;
