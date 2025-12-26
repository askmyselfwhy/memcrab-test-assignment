import { useMemo } from "react";
import { useTableContext } from "./useTableContext";
import { DataAttributes } from "../config";
import type { Cell, TableCell, TableColumnDef } from "../types";
import type { Row } from "@tanstack/react-table";

type DataCellRendererProps = {
  data: Cell;
  sum: number;
  cell: TableCell;
  cellMapRef: React.RefObject<Map<string, HTMLElement>>;
};
const DataCellRenderer = ({
  data,
  sum,
  cell,
  cellMapRef,
}: DataCellRendererProps) => {
  const cellValue = data.value;
  return (
    <span
      style={{ display: "inline-block", width: "100%", height: "100%" }}
      {...{ [DataAttributes.CELL]: Number(cell.column.id) }}
      ref={(el) => {
        if (el) cellMapRef.current.set(cell.id, el);
      }}
    >
      <span className="value" style={{ pointerEvents: "none" }}>
        {cellValue}
      </span>
      <span className="percent" style={{ pointerEvents: "none" }}>
        {((cellValue / sum) * 100).toFixed(0)}%
      </span>
    </span>
  );
};

type SummaryCellRendererProps = {
  sum: number;
};
const SummaryCellRenderer = ({ sum }: SummaryCellRendererProps) => {
  return (
    <span
      {...{ [DataAttributes.ROW_SUM_CELL]: true }}
      style={{
        display: "inline-block",
        width: "100%",
        height: "100%",
        backgroundColor: "#f9f9f9",
      }}
    >
      {sum}
    </span>
  );
};

type ActionsCellRendererProps = {
  row: Row<Cell[]>;
  onHandleDelete: (rowIndex: number) => void;
};
const ActionsCellRenderer = ({
  row,
  onHandleDelete,
}: ActionsCellRendererProps) => {
  return (
    <button
      style={{
        display: "inline-block",
        width: "100%",
        height: "100%",
        padding: 0,
        borderRadius: 0,
      }}
      onClick={() => onHandleDelete(row.index)}
    >
      ❌
    </button>
  );
};

type UseTableColumnsProps = {
  cellMapRef: React.RefObject<Map<string, HTMLTableCellElement>>;
};

export const useTableColumns = ({
  cellMapRef,
}: UseTableColumnsProps): TableColumnDef[] => {
  const { data, stats, onHandleDelete } = useTableContext();
  const { percentiles, sum } = stats;

  return useMemo(() => {
    if (data.length === 0) return [];
    const columns: TableColumnDef[] = data[0].map((_, colIndex) => ({
      id: `${colIndex}`,
      header: `Col ${colIndex + 1}`,
      cell: ({ row, column, cell }) => (
        <DataCellRenderer
          cell={cell}
          cellMapRef={cellMapRef}
          data={data[row.index][Number(column.id)]}
          sum={sum[row.index]}
        />
      ),
      meta: {
        dataCell: true,
      },
      footer: ({ column }) => percentiles[Number(column.id)],
      size: 80,
    }));
    columns.push({
      id: "sum",
      header: "Sum",
      meta: {
        sticky: "right",
      },
      size: 80,
      cell: ({ row }) => <SummaryCellRenderer sum={sum[row.index]} />,
    });
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsCellRenderer row={row} onHandleDelete={onHandleDelete} />
      ),
      meta: {
        sticky: "right",
      },
      size: 80,
    });
    return columns;
  }, [data, percentiles, sum, onHandleDelete]);
};
