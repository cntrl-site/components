import { ArticleItemType } from "../../sdk/types/article/ArticleItemType";
import { InteractionItemTrigger } from "../../sdk/types/article/Interaction";
import { ItemState } from "../../sdk/types/article/ItemState";

export interface ItemInteractionCtrl {
  getState<T>(keys: string[]): StateCSSInfo<T>;
  getHasTrigger(itemId: string, triggerType: InteractionItemTrigger['type']): boolean;
  sendTrigger(type: 'click' | 'hover-in' | 'hover-out'): void;
  handleTransitionEnd?: (styleKey: string) => void;
  handleTransitionStart?: (styleKeys: string[]) => void;
  receiveChange: () => void;
  receiveAction: (type: 'play' | 'pause') => void;
  setActionReceiver: (action: (type: 'play' | 'pause') => void) => void;
}

export interface InteractionsRegistryPort {
  register(itemId: string, ctrl: ItemInteractionCtrl): void;
  getStatePropsForItem(itemId: string): StateProps<unknown>;
  getItemAvailableTriggers(itemId: string): Set<InteractionItemTrigger['type']>;
  notifyItemTrigger(itemId: string, type: TriggerType): void;
  notifyTransitionEnd(itemId: string): void;
}

type StateCSSInfo<T> = {
  styles: Partial<Record<string, T>>;
  transition?: string;
};

type StateProps<T> = Record<keyof ItemState<ArticleItemType>, {
  value?: T;
  transition?: {
    timing: string;
    duration: number;
    delay: number;
  };
}>;

type TriggerType = 'click' | 'hover-in' | 'hover-out';
