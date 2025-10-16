import { useCallback, useState } from 'react';

export function useItemPointerEvents(
  pointerEvents: 'never' | 'when_visible' | 'always',
  isParentVisible: boolean
) {
  const getAllowPointerEvents = () => {
    switch (pointerEvents) {
      case 'never':
        return false;
      case 'when_visible':
        return isParentVisible;
      case 'always':
        return true;
    }
  };
  const [allowPointerEvents, setAllowPointerEvents] = useState<boolean>(getAllowPointerEvents());
  const handleVisibilityChange = useCallback((isVisible: boolean) => {
    if (!isParentVisible || pointerEvents !== 'when_visible') return;
    setAllowPointerEvents(isVisible);
  }, [isParentVisible, pointerEvents]);
  return { allowPointerEvents, handleVisibilityChange };
}
