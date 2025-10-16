import { useMemo, useState } from 'react';
import { ItemInteractionController } from './ItemInteractionCtrl';
import { ItemInteractionCtrl } from './types';
import { useInteractionsRegistry } from '../provider/InteractionsContext';

export function useItemInteractionCtrl(itemId: string): ItemInteractionCtrl | undefined {
  const [_, triggerRender] = useState(0);
  const registry = useInteractionsRegistry();
  const ctrl = useMemo(() => {
    if (!registry) return;
    return new ItemInteractionController(
      itemId,
      registry,
      () => triggerRender(prev => prev + 1)
    );
  }, [itemId, registry]);
  return ctrl;
}
