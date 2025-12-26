import { applyTableMutation } from "./table";
import { applyStatsMutation } from "./stats";
import { applySortMutation } from "./sort";

const Mutations = [applyTableMutation, applySortMutation, applyStatsMutation];

export default Mutations;
