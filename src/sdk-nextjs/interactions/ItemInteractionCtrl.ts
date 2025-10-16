import { InteractionsRegistryPort, ItemInteractionCtrl } from './types';
import { getTransition } from './getTransition';
import { getStyleKeysFromCSSProperty } from './CSSPropertyNameMap';
import { InteractionItemTrigger } from '../../sdk/types/article/Interaction';

export class ItemInteractionController implements ItemInteractionCtrl {
  private transitionsInProgress: Set<string> = new Set();
  private actionReceiver: ((type: 'play' | 'pause') => void) | undefined;

  constructor(
    private itemId: string,
    private registry: InteractionsRegistryPort,
    private onChange: () => void,
  ) {
    this.registry.register(itemId, this);
  }

  getState<T>(keys: string[]) {
    const stateProps = this.registry.getStatePropsForItem(this.itemId);
    const styles = keys.reduce<Record<string, T>>((map, styleKey) => {
      const prop = stateProps[styleKey];
      if (prop?.value === undefined) return map;
      map[styleKey] = prop.value as T;
      return map;
    }, {});
    const transition = getTransition(stateProps, keys);
    return {
      styles,
      transition
    };
  }

  getHasTrigger(itemId: string, triggerType: InteractionItemTrigger['type']): boolean {
    const triggers = this.registry.getItemAvailableTriggers(itemId);
    return triggers.has(triggerType);
  }

  sendTrigger(type: 'click' | 'hover-in' | 'hover-out') {
    this.registry.notifyItemTrigger(this.itemId, type);
  }

  receiveAction(type: 'play' | 'pause') {
    this.actionReceiver?.(type);
  }

  setActionReceiver(action: (type: 'play' | 'pause') => void) {
    this.actionReceiver = action;
  }

  handleTransitionStart = (types: string[]) => {
    this.transitionsInProgress.clear();
    for (const type of types) {
      this.transitionsInProgress.add(type);
    }
  };

  handleTransitionEnd = (cssPropKey: string) => {
    if (cssPropKey.startsWith('border-') && cssPropKey.endsWith('-radius')) {
      cssPropKey = 'border-radius';
    }
    if (cssPropKey.startsWith('border-') && cssPropKey.endsWith('-width')) {
      cssPropKey = 'border-width';
    }
    const styleKeys = getStyleKeysFromCSSProperty(cssPropKey);
    for (const key of styleKeys) {
      const found = this.transitionsInProgress.has(key);
      if (!found) continue;
      this.transitionsInProgress.delete(key);
      break;
    }
    if (this.transitionsInProgress.size !== 0) return;
    this.registry.notifyTransitionEnd(this.itemId);
  };

  receiveChange() {
    this.onChange();
  }
}
