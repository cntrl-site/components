import { InteractionsRegistryPort, ItemInteractionCtrl } from './types';
import { isItemType } from '../utils/isItemType';
import { ItemAny } from '../../sdk/types/article/Item';
import { Interaction, InteractionItemTrigger } from '../../sdk/types/article/Interaction';
import { Article } from '../../sdk/types/article/Article';
import { ArticleItemType } from '../../sdk/types/article/ArticleItemType';

export class InteractionsRegistry implements InteractionsRegistryPort {
  private ctrls: Map<ItemId, ItemInteractionCtrl> = new Map();
  private items: ItemAny[];
  private interactions: Interaction[];
  private stateItemsIdsMap: StateItemsIdsMap;
  private interactionStateMap: InteractionStateMap;
  private itemsStages: ItemStages;
  private activeStateIdInteractionIdMap: Record<StateId, InteractionId>;

  constructor(article: Article, layoutId: string) {
    this.items = this.unpackItems(article);
    const interactions = article.interactions[layoutId] ?? [];
    const activeStatesIds = interactions.reduce<StateId[]>((map, inter) => {
      const activeStateId = inter.states.find((state) => state.id !== inter.startStateId)?.id;
      if (!activeStateId) {
        throw new Error(`Failed to find active state for interaction w/ id="${inter.id}"`);
      }
      map.push(activeStateId);
      return map;
    }, []);
    const interactionStateMap = interactions.reduce<InteractionStateMap>((map, { id, startStateId }) => {
      map[id] = startStateId;
      return map;
    }, {});
    this.activeStateIdInteractionIdMap = interactions.reduce<Record<StateId, InteractionId>>((map, interaction) => {
      const activeState = interaction.states.find((state) => state.id !== interaction.startStateId);
      if (activeState) {
        map[activeState.id] = interaction.id;
      }
      return map;
    }, {});
    const stateItemsIdsMap = activeStatesIds.reduce<StateItemsIdsMap>((map, stateId) => {
      map[stateId] = this.items
        .filter((item) => {
          const state = item.state[stateId] ?? {};
          const hasKeys = Object.keys(state).length !== 0;
          return hasKeys;
        })
        .map((item) => item.id);
      return map;
    }, {});
    this.interactions = interactions;
    this.stateItemsIdsMap = stateItemsIdsMap;
    this.interactionStateMap = interactionStateMap;
    const itemStages = this.getDefaultItemStages();
    this.itemsStages = itemStages;
  }

  register(itemId: ItemId, ctrl: ItemInteractionCtrl) {
    this.ctrls.set(itemId, ctrl);
  }

  getStatePropsForItem(itemId: string) {
    const { items } = this;
    const item = items.find((item) => item.id === itemId)!;
    const itemStages = this.itemsStages.filter((stage) => stage.itemId === itemId);
    itemStages.sort((a, b) => a.updated - b.updated);
    const itemStyles: StateProps = {};
    for (const stage of itemStages) {
      if (stage.type === 'active') {
        if (stage.isStartState) continue;
        const params = item.state[stage.stateId!] ?? {};
        for (const [key, stateDetails] of Object.entries(params)) {
          itemStyles[key] = {
            value: stateDetails.value
          };
        }
      }
      if (stage.type === 'transitioning') {
        const activeStateId = stage.direction === 'in' ? stage.to : stage.from;
        const params = item.state[activeStateId] ?? {};
        for (const [key, stateDetails] of Object.entries(params)) {
          const transitionDetails = stateDetails[stage.direction];
          if (!transitionDetails) continue;
          itemStyles[key] = {
            value: stage.direction === 'in' ? stateDetails.value : itemStyles[key]?.value,
            transition: {
              timing: transitionDetails.timing,
              duration: transitionDetails.duration,
              delay: transitionDetails.delay
            }
          };
        }
      }
    }
    return itemStyles;
  }

  getItemAvailableTriggers(itemId: string): Set<InteractionItemTrigger['type']> {
    const available = new Set<InteractionItemTrigger['type']>();
    const activeStates = Object.values(this.interactionStateMap);
    for (const interaction of this.interactions) {
      const { triggers } = interaction;
      for (const trigger of triggers) {
        if (!('itemId' in trigger)) continue;
        if (trigger.itemId !== itemId) continue;
        if (activeStates.includes(trigger.from)) {
          available.add(trigger.type);
        }
      }
    }
    return available;
  }

  notifyLoad() {
    const timestamp = Date.now();
    for (const interaction of this.interactions) {
      const currentStateId = this.getCurrentStateByInteractionId(interaction.id);
      const matchingTrigger = interaction.triggers.find(trigger =>
        'position' in trigger && trigger.position === 0 && trigger.from === currentStateId
      );
      if (!matchingTrigger) continue;
      const activeStateId = this.getActiveInteractionState(interaction.id);
      const isNewStateActive = matchingTrigger.to === activeStateId;
      this.setCurrentStateForInteraction(interaction.id, matchingTrigger.to);
      const transitioningItems = this.stateItemsIdsMap[activeStateId] ?? [];
      const state = interaction.states.find((state) => state.id === matchingTrigger.to);
      const actions = state?.actions ?? [];
      for (const action of actions) {
        const ctrl = this.ctrls.get(action.itemId);
        if (!ctrl) continue;
        ctrl.receiveAction(action.type);
      }

      this.itemsStages = this.itemsStages.map((stage) => {
        if (stage.interactionId !== interaction.id) return stage;
        return {
          itemId: stage.itemId,
          interactionId: stage.interactionId,
          type: 'transitioning',
          from: stage.type === 'transitioning' ? stage.to : stage.stateId!,
          to: matchingTrigger.to,
          direction: isNewStateActive ? 'in' : 'out',
          updated: timestamp
        };
      });

      const itemsToNotify = new Set<ItemId>(transitioningItems);
      for (const trigger of interaction.triggers) {
        if (!('itemId' in trigger)) continue;
        itemsToNotify.add(trigger.itemId);
      }
      this.notifyItemCtrlsChange(Array.from(itemsToNotify));
      this.notifyTransitionStartForItems(transitioningItems, activeStateId);
    }
  }

  notifyScroll(position: number) {
    const timestamp = Date.now();
    for (const interaction of this.interactions) {
      const currentStateId = this.getCurrentStateByInteractionId(interaction.id);
      const activeStateId = interaction.states.find((state) => state.id !== interaction.startStateId)?.id;
      const matchingTrigger = interaction.triggers.find((trigger) => {
        if (!('position' in trigger) || trigger.position === 0) return false;
        const triggerPosition = trigger.position * window.innerWidth;
        const isScrolledPastTrigger = triggerPosition < position;
        if (!isScrolledPastTrigger && !trigger.isReverse) return false;
        const stateId = isScrolledPastTrigger ? trigger.from : trigger.to;
        return stateId === currentStateId;
      });
      if (!matchingTrigger || !('position' in matchingTrigger) || !activeStateId) continue;
      const triggerPosition = matchingTrigger.position * window.innerWidth;
      const isScrolledPastTrigger = triggerPosition < position;
      const targetStateId = isScrolledPastTrigger ? matchingTrigger.to : matchingTrigger.from;
      this.setCurrentStateForInteraction(interaction.id, targetStateId);
      const transitioningItems = this.stateItemsIdsMap[activeStateId] ?? [];
      const state = interaction.states.find((state) => state.id === targetStateId);
      const actions = state?.actions ?? [];
      for (const action of actions) {
        const ctrl = this.ctrls.get(action.itemId);
        if (!ctrl) continue;
        ctrl.receiveAction(action.type);
      }
      const itemsStages = this.itemsStages.map((stage) => {
        if (stage.interactionId !== interaction.id) return stage;
        const newStage = {
          itemId: stage.itemId,
          interactionId: stage.interactionId,
          type: 'transitioning' as const,
          from: stage.type === 'transitioning' ? stage.to : stage.stateId!,
          to: targetStateId,
          direction: targetStateId === activeStateId ? 'in' as const : 'out' as const,
          updated: timestamp
        };
        return newStage;
      });
      this.itemsStages = itemsStages;
      const itemsToNotify = new Set<ItemId>(transitioningItems);
      for (const trigger of interaction.triggers) {
        if (!('itemId' in trigger)) continue;
        itemsToNotify.add(trigger.itemId);
      }
      this.notifyItemCtrlsChange(Array.from(itemsToNotify));
      this.notifyTransitionStartForItems(transitioningItems, activeStateId);
    }
  }

  notifyItemTrigger(itemId: string, triggerType: TriggerType): void {
    const timestamp = Date.now();
    for (const interaction of this.interactions) {
      const currentStateId = this.getCurrentStateByInteractionId(interaction.id);
      const matchingTrigger = interaction.triggers.find((trigger) =>
        'itemId' in trigger
        && trigger.itemId === itemId
        && trigger.from === currentStateId
        && trigger.type === triggerType
      );
      if (!matchingTrigger) continue;
      const activeStateId = this.getActiveInteractionState(interaction.id);
      const isNewStateActive = matchingTrigger.to === activeStateId;
      this.setCurrentStateForInteraction(interaction.id, matchingTrigger.to);
      const transitioningItems = this.stateItemsIdsMap[activeStateId] ?? [];
      const state = interaction.states.find((state) => state.id === matchingTrigger.to);
      const actions = state?.actions ?? [];
      for (const action of actions) {
        const ctrl = this.ctrls.get(action.itemId);
        if (!ctrl) continue;
        ctrl.receiveAction(action.type);
      }
      this.itemsStages = this.itemsStages.map((stage) => {
        if (stage.interactionId !== interaction.id) return stage;
        return {
          itemId: stage.itemId,
          interactionId: stage.interactionId,
          type: 'transitioning',
          from: stage.type === 'transitioning' ? stage.to : stage.stateId!,
          to: matchingTrigger.to,
          direction: isNewStateActive ? 'in' : 'out',
          updated: timestamp
        };
      });
      const itemsToNotify = new Set<ItemId>(transitioningItems);
      for (const trigger of interaction.triggers) {
        if (!('itemId' in trigger)) continue;
        itemsToNotify.add(trigger.itemId);
      }
      this.notifyItemCtrlsChange(Array.from(itemsToNotify));
      this.notifyTransitionStartForItems(transitioningItems, activeStateId);
    }
  }

  notifyTransitionStartForItems(itemsIds: string[], activeStateId: string) {
    for (const itemId of itemsIds) {
      const ctrl = this.ctrls.get(itemId);
      const item = this.items.find((item) => item.id === itemId)!;
      const keys = Object.keys(item.state[activeStateId] ?? {});
      ctrl?.handleTransitionStart?.(keys);
    }
  }

  notifyTransitionEnd(itemId: string): void {
    const timestamp = Date.now();
    this.itemsStages = this.itemsStages.map((stage) => {
      if (stage.itemId !== itemId || stage.type !== 'transitioning') return stage;
      return {
        itemId,
        interactionId: stage.interactionId,
        type: 'active',
        stateId: stage.to,
        isStartState: stage.direction === 'out',
        updated: timestamp
      };
    });
    this.ctrls.get(itemId)?.receiveChange();
  }

  private getCurrentStateByInteractionId(id: InteractionId): string {
    let state;
    for (const interactionId of Object.keys(this.interactionStateMap)) {
      if (id !== interactionId) continue;
      state = this.interactionStateMap[interactionId];
    }
    if (!state) throw new Error(`Failed to find current state for interaction w/ id="${id}"`);
    return state;
  }

  private setCurrentStateForInteraction(interactionId: InteractionId, stateId: StateId) {
    this.interactionStateMap = {
      ...this.interactionStateMap,
      [interactionId]: stateId
    };
  }

  private getActiveInteractionState(interactionId: InteractionId): string {
    const { interactions } = this;
    const interaction = interactions.find((interaction) => interaction.id === interactionId)!;
    const activeStateId = interaction.states.find(state => state.id !== interaction.startStateId)?.id;
    if (!activeStateId) {
      throw new Error(`Failed to find active state for interaction w/ id="${interactionId}"`);
    }
    return activeStateId;
  }

  private notifyItemCtrlsChange(itemsIds: string[]) {
    for (const itemId of itemsIds) {
      this.ctrls.get(itemId)?.receiveChange();
    }
  }

  private unpackItems(article: Article): ItemAny[] {
    const itemsArr = [];
    for (const section of article.sections) {
      const items = this.getNestedItems(section.items);
      itemsArr.push(...items);
    }
    return itemsArr;
  }

  private getNestedItems(items: ItemAny[]): ItemAny[] {
    const allItems: ItemAny[] = [];
    for (const item of items) {
      if (isItemType(item, ArticleItemType.Group) || isItemType(item, ArticleItemType.Compound)) {
        const groupChildren = item?.items ?? [];
        const nestedItems = this.getNestedItems(groupChildren);
        allItems.push(...nestedItems);
      }
      allItems.push(item);
    }
    return allItems;
  }

  private getDefaultItemStages(): ItemStages {
    const timestamp = Date.now();
    const { items } = this;
    const stages: ItemStages = [];
    for (const item of items) {
      const itemStatesMap = item.state;
      if (!itemStatesMap) continue;
      for (const stateId of Object.keys(itemStatesMap)) {
        const interactionId = this.activeStateIdInteractionIdMap[stateId];
        if (!interactionId) continue;
        stages.push({
          itemId: item.id,
          interactionId,
          type: 'active',
          isStartState: true,
          updated: timestamp,
          stateId: this.interactions.find((interaction) => interaction.id === interactionId)?.startStateId
        });
      }
    }
    return stages;
  }
}

type ItemStages = (TransitioningStage | ActiveStage)[];
type TransitioningStage = {
  itemId: string;
  interactionId: string;
  type: 'transitioning';
  from: StateId;
  to: StateId;
  direction: 'in' | 'out';
  updated: number;
};
type ActiveStage = { type: 'active'; itemId: string; interactionId: string; stateId?: string; isStartState: boolean; updated: number; };
type InteractionStateMap = Record<InteractionId, StateId>;
type StateItemsIdsMap = Record<StateId, ItemId[]>;
type TriggerType = InteractionItemTrigger['type'];
type InteractionId = string;
type StateId = string;
type ItemId = string;
type StateProps = Record<string, {
  value?: string | number;
  transition?: {
    timing: string;
    duration: number;
    delay: number;
  };
}>;
