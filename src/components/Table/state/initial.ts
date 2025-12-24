import type { TableState } from "./types";

const initialState: TableState = {
  data: [],
  rows: 10,
  columns: 10,
  closest: 5,
  stats: {
    sum: [],
    max: [],
    percentiles: [],
  },
};

export default initialState;
