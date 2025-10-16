import { ItemInteractionCtrl } from '../../interactions/types';

export function useItemTriggers(interactionCtrl: ItemInteractionCtrl | undefined) {
  return {
    onClick: () => {
      interactionCtrl?.sendTrigger('click');
    },
    onMouseEnter: () => {
      interactionCtrl?.sendTrigger('hover-in');
    },
    onMouseLeave: () => {
      interactionCtrl?.sendTrigger('hover-out');
    }
  };
}
