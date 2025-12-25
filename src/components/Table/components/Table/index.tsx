import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { TableContext } from "../../context";
import { getClosestXCells } from "../../utils";
import useThrottleCallback from "@/hooks/useThrottleCallback";
import { createColorSampler } from "@/lib/colorSampler";
import { DataAttributes, MAX_ROWS } from "../../config";
import TableDataRow from "../TableDataRow";

const getHeatmapColor = createColorSampler("--heatmap-colors");

type TableCellMutation = (
  rowIndex: number,
  columnIndex: number,
  target: HTMLElement,
) => {
  cells: HTMLElement[];
  cleanCallback: (cell: HTMLElement) => void;
};

type InteractionMode = "highlight" | "heatmap" | "none";

const getCellRowColumnIndices = (target: HTMLElement) => {
  const rowIndex =
    Number(target?.parentElement?.getAttribute(DataAttributes.ROW)) || 0;
  const columnIndex = Number(target.getAttribute(DataAttributes.CELL)) || -1;
  return { rowIndex, columnIndex };
};

const Table = () => {
  const { data, onHandleClick, closest, rows, onHandleAdd, stats } =
    useContext(TableContext);

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

  const highlightClosestCells: TableCellMutation = useCallback(
    (rowIndex, columnIndex, _target) => {
      const cellData = data[rowIndex][columnIndex];
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

  const colorizeRowHeatmap: TableCellMutation = useCallback(
    (rowIndex, _columnIndex, _target) => {
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
    fn: TableCellMutation,
    target: HTMLElement,
  ) => {
    interactionRef.current.mode = mode;

    const wrapper = () => {
      if (!target || !tableRef.current)
        return { cells: [], cleanCallback: () => {} };
      const { rowIndex, columnIndex: colIndex } =
        getCellRowColumnIndices(target);
      return fn(rowIndex, colIndex, target);
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
    if (target.hasAttribute(DataAttributes.CELL)) {
      applyInteraction("highlight", highlightClosestCells, target);
    } else if (target.hasAttribute(DataAttributes.ROW_SUM_CELL)) {
      applyInteraction("heatmap", colorizeRowHeatmap, target);
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
        const { rowIndex, columnIndex: colIndex } =
          getCellRowColumnIndices(target);
        const cellData = data[rowIndex][colIndex];
        onHandleClick(rowIndex, colIndex, cellData.value + 1);
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
          {data.map((row, index) => (
            <TableDataRow
              row={row}
              key={index}
              index={index}
              rowSum={sum[index]}
              cellMapRef={cellMapRef}
            />
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
