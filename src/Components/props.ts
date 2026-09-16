export type CommonComponentProps = {
  metadata?: Record<string, any>;
  /**
   * Editor-controlled visual state, matching a `statePanels` id when set.
   * Omitted on the published site unless a wrapper needs to pin a state.
   */
  currentState?: string | null;
  /**
   * State panel ids that must not become the visual state.
   * Derived from schema `availableWhen` and the current host context.
   */
  unavailableStates?: string[];
};