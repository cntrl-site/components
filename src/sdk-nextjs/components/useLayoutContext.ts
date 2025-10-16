import { useContext } from 'react';
import { LayoutContext } from '../provider/LayoutContext';

export function useLayoutContext() {
  const layoutId = useContext(LayoutContext);
  return layoutId;
}
