import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { TableContext } from "../../context";
import {
  getClosestXCells,
  getRowIndexFromCellId,
  getColumnIndexFromCellId,
} from "../../utils";
import useThrottleCallback from "@/hooks/useThrottleCallback";
import { createColorSampler } from "@/lib/colorSampler";
import { MAX_ROWS } from "../../config";

const DataAttributes = {
  CELL: "data-cell-index",
  ROW_SUM: "data-sum",
  ROW_INDEX: "data-row-index",
};

const getHeatmapColor = createColorSampler("--heatmap-colors");

type TableCellModifier = (target: HTMLElement) => {
  cells: HTMLElement[];
  cleanCallback: (cell: HTMLElement) => void;
};

type InteractionMode = "highlight" | "heatmap" | "none";

const Table = () => {
  const {
    data,
    onHandleClick,
    onHandleDelete,
    closest,
    rows,
    onHandleAdd,
    stats,
  } = useContext(TableContext);

  const { sum, max, percentiles } = stats;

  const columns = data[0]?.length || 0;

  const flattenedData = useMemo(() => data.flat(), [data]);

  const cellMapRef = useRef<Map<number, HTMLTableCellElement>>(new Map());
  const tableRef = useRef<HTMLTableElement>(null);
  const prevTargetElementRef = useRef<HTMLElement | null>(null);
  const interactionRef = useRef<{
    mode: InteractionMode;
    cells: HTMLElement[];
    cleanup: (cell: HTMLElement) => void;
  }>({
    mode: "none",
    cells: [],
    cleanup: () => {},
  });
  const isDataExist = data.length > 0 && data[0].length > 0;

  const resetCellStyles = () => {
    if (interactionRef.current.cells.length > 0) {
      interactionRef.current.cells.forEach(interactionRef.current.cleanup);
      interactionRef.current.cells = [];
    }
  };

  const highlightClosestCells: TableCellModifier = useCallback(
    (target) => {
      const id = Number(target.getAttribute(DataAttributes.CELL));
      const rowIndex = getRowIndexFromCellId(id, data[0].length);
      const colIndex = getColumnIndexFromCellId(id, data[0].length);
      const cellData = data[rowIndex][colIndex];
      const closestCells = getClosestXCells(flattenedData, cellData, closest);
      const newHighlightedCells: HTMLElement[] = [];
      closestCells.forEach((cell) => {
        const cellElement = cellMapRef.current.get(cell.id);
        if (cellElement) {
          cellElement.classList.add("highlighted");
          newHighlightedCells.push(cellElement);
        }
      });
      return {
        cells: newHighlightedCells,
        cleanCallback: (cell: HTMLElement) => {
          cell.classList.remove("highlighted");
        },
      };
    },
    [closest, data, flattenedData],
  );

  const colorizeRowHeatmap: TableCellModifier = useCallback(
    (target) => {
      const rowIndex = Number(target.getAttribute(DataAttributes.ROW_SUM));
      const rowData = data[rowIndex];
      const newColorizedCells: HTMLElement[] = [];
      rowData.forEach((cell) => {
        const cellElement = cellMapRef.current.get(cell.id);
        if (cellElement) {
          const maxValue = max[rowIndex];
          const ratio = cell.value / maxValue;
          cellElement.style.backgroundColor = getHeatmapColor(ratio);
          cellElement.classList.add("heatmap-cell");
          newColorizedCells.push(cellElement);
        }
      });
      return {
        cells: newColorizedCells,
        cleanCallback: (cell: HTMLElement) => {
          cell.classList.remove("heatmap-cell");
          cell.style.backgroundColor = "";
        },
      };
    },
    [data, max],
  );

  const applyInteraction = (
    mode: InteractionMode,
    fn: TableCellModifier,
    target: HTMLElement,
  ) => {
    interactionRef.current.mode = mode;

    const wrapper = () => {
      if (!target || !tableRef.current)
        return { cells: [], cleanCallback: () => {} };
      return fn(target);
    };

    const { cells, cleanCallback } = wrapper();

    interactionRef.current.cells = cells;
    interactionRef.current.cleanup = cleanCallback;
  };

  const onMouseMove = (
    event: React.MouseEvent<HTMLTableElement, MouseEvent>,
  ) => {
    const target = event.target as HTMLElement;
    if (target === prevTargetElementRef.current) return;
    prevTargetElementRef.current = target;
    resetCellStyles();
    if (target.hasAttribute(DataAttributes.ROW_SUM)) {
      applyInteraction("heatmap", colorizeRowHeatmap, target);
    } else if (target.hasAttribute(DataAttributes.CELL)) {
      applyInteraction("highlight", highlightClosestCells, target);
    }
  };

  const onMouseLeave = () => {
    resetCellStyles();
    prevTargetElementRef.current = null;
  };

  const onClick = (event: React.MouseEvent<HTMLTableElement, MouseEvent>) => {
    if (tableRef.current) {
      const target = event.target as HTMLElement;
      if (target.hasAttribute(DataAttributes.CELL)) {
        const cellId = Number(target.getAttribute(DataAttributes.CELL));
        const rowIndex = getRowIndexFromCellId(cellId, data[0].length);
        const colIndex = getColumnIndexFromCellId(cellId, data[0].length);
        const cellData = data[rowIndex][colIndex];
        onHandleClick(cellId, cellData.value + 1);
      }
    }
  };

  useEffect(() => {
    if (
      prevTargetElementRef.current &&
      prevTargetElementRef.current.hasAttribute(DataAttributes.CELL)
    ) {
      resetCellStyles();
      applyInteraction(
        "highlight",
        highlightClosestCells,
        prevTargetElementRef.current,
      );
    }
  }, [data, highlightClosestCells]);

  const throttledOnMouseMove = useThrottleCallback(onMouseMove, 10);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        ref={tableRef}
        onPointerOver={throttledOnMouseMove}
        onPointerLeave={onMouseLeave}
        onClick={onClick}
      >
        <thead>
          <tr>
            <td colSpan={columns + 2} style={{ padding: 0 }}>
              <button
                style={{ width: "100%", borderRadius: 0 }}
                disabled={data.length === 0 || rows === MAX_ROWS}
                onClick={onHandleAdd}
                type="button"
              >
                ➕ Add Row
              </button>
            </td>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} {...{ [DataAttributes.ROW_INDEX]: rowIndex }}>
              {row.map((cell) => (
                <td
                  key={cell.id}
                  {...{ [DataAttributes.CELL]: cell.id }}
                  ref={(el) => {
                    if (el) cellMapRef.current.set(cell.id, el);
                  }}
                  className="table-cell"
                >
                  <span className="value" style={{ pointerEvents: "none" }}>
                    {cell.value}
                  </span>
                  <span className="percent">
                    {((cell.value / sum[rowIndex]) * 100).toFixed(0)}%
                  </span>
                </td>
              ))}
              {row.length > 0 && (
                <td
                  className="table-cell"
                  {...{ [DataAttributes.ROW_SUM]: rowIndex }}
                >
                  {sum[rowIndex]}
                </td>
              )}
              <td className="controls" onClick={() => onHandleDelete(rowIndex)}>
                ❌
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {isDataExist &&
              data[0].map((_, colIndex) => {
                return <td key={colIndex}>{percentiles[colIndex]}</td>;
              })}
            {isDataExist && <td colSpan={2}></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Table;
