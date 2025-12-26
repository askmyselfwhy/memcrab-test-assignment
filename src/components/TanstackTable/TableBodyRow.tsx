import { memo } from "react";
import { flexRender } from "@tanstack/react-table";
import type { Row } from "@tanstack/react-table";
import type { Virtualizer, VirtualItem } from "@tanstack/react-virtual";

type Props<T = unknown> = {
  row: Row<T>;
  columnVirtualizer: Virtualizer<HTMLDivElement, HTMLTableCellElement>;
  virtualPaddingLeft: number | undefined;
  virtualPaddingRight: number | undefined;
  virtualRow: VirtualItem;
};

const TableDataRow = (props: Props) => {
  const {
    row,
    columnVirtualizer,
    virtualRow,
    virtualPaddingLeft,
    virtualPaddingRight,
  } = props;

  const cells = row.getVisibleCells();
  const virtualColumns = columnVirtualizer.getVirtualItems();

  const stickyColumns = virtualColumns.filter(
    (vc: VirtualItem) => cells[vc.index].column.columnDef.meta?.sticky,
  );
  const nonStickyColumns = virtualColumns.filter(
    (vc: VirtualItem) => !cells[vc.index].column.columnDef.meta?.sticky,
  );

  return (
    <tr
      data-index={virtualRow.index}
      style={{
        display: "flex",
        position: "absolute",
        transform: `translateY(${virtualRow.start}px)`,
        width: "100%",
      }}
    >
      {virtualPaddingLeft ? (
        <td style={{ display: "flex", width: virtualPaddingLeft }} />
      ) : null}
      {nonStickyColumns.map((vc: VirtualItem) => {
        const columnIndex = vc.index;
        const cell = cells[columnIndex];
        return (
          <td key={cell.id} className="table-cell">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
      {stickyColumns.map((vc: VirtualItem, index: number) => {
        const columnIndex = vc.index;
        const cell = cells[columnIndex];
        return (
          <td
            key={cell.id}
            style={{
              position: "sticky",
              right: (stickyColumns.length - index - 1) * cell.column.getSize(),
            }}
            className="table-cell"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
      {virtualPaddingRight ? (
        <td style={{ display: "flex", width: virtualPaddingRight }} />
      ) : null}
    </tr>
  );
};

export default memo(TableDataRow);
