import { createReducer } from "@/lib/reducer";
import type { TableState, TableAction } from "./types";
import Mutations from "./mutations";

export const reducer = createReducer<TableState, TableAction>(Mutations);
