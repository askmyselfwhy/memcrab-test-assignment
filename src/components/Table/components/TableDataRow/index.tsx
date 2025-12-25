import { memo, useContext } from "react";
import { DataAttributes } from "../../config";
import { TableContext } from "../../context";
import type { Cell } from "../../types";

type Props = {
  row: Cell[];
  index: number;
  rowSum: number;
  cellMapRef: React.RefObject<Map<number, HTMLTableCellElement>>;
};

const TableDataRow = (props: Props) => {
  const { row, index, rowSum, cellMapRef } = props;
  const { onHandleDelete } = useContext(TableContext);

  return (
    <tr {...{ [DataAttributes.ROW]: index }}>
      {row.map((cell, columnIndex) => (
        <td
          key={cell.id}
          {...{ [DataAttributes.CELL]: columnIndex }}
          ref={(el) => {
            if (el) cellMapRef.current.set(cell.id, el);
          }}
          className="table-cell"
        >
          <span className="value" style={{ pointerEvents: "none" }}>
            {cell.value}
          </span>
          <span className="percent">
            {((cell.value / rowSum) * 100).toFixed(0)}%
          </span>
        </td>
      ))}
      {row.length > 0 && (
        <td
          className="table-cell sum"
          {...{ [DataAttributes.ROW_SUM_CELL]: true }}
        >
          {rowSum}
        </td>
      )}
      <td className="controls" onClick={() => onHandleDelete(index)}>
        ❌
      </td>
    </tr>
  );
};

export default memo(TableDataRow);
