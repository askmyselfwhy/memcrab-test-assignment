type StateMutationFn<State, Action> = (
  oldState: State,
  newState: State,
  action: Action,
) => State;
/**
 * Used to split reducer logic into multiple mutation functions (to reduce complexity in a single reducer).
 * Each mutation function receives the old state, the new state (result of previous mutations),
 * and the action being dispatched.
 * The final new state is the result of applying all mutation functions in sequence.
 */
export function createReducer<State, Action>(
  mutations: Array<StateMutationFn<State, Action>>,
) {
  return function reducer(oldState: State, action: Action): State {
    const newState = mutations.reduce((prevState, stateMutationFn) => {
      return stateMutationFn(oldState, prevState, action);
    }, oldState);
    return newState;
  };
}
