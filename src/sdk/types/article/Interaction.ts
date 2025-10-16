export interface Interaction {
  id: string;
  triggers: (InteractionItemTrigger | InteractionScrollTrigger)[];
  states: InteractionState[];
  startStateId: string;
}

export interface InteractionItemTrigger {
  itemId: string;
  type: 'hover-in' | 'hover-out' | 'click';
  from: StateId;
  to: StateId;
}

export interface InteractionScrollTrigger {
  position: number;
  from: StateId;
  to: StateId;
  isReverse: boolean;
}

export type VideoInteractionAction = {
  type: 'play' | 'pause';
  itemId: string;
}

export interface InteractionState {
  id: StateId;
  actions?: VideoInteractionAction[];
}

type StateId = string;
