import { applyTableMutation } from "./actions";
import { applyStatsMutation } from "./actions.stats";
import type { TableState, TableAction } from "./types";

export function reducer(state: TableState, action: TableAction): TableState {
  const newState = applyTableMutation(state, action);
  newState.stats = applyStatsMutation(state, newState, action);
  return newState;
}
