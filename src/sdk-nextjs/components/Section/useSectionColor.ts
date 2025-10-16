import { useMemo } from 'react';
import { CntrlColor } from '@cntrl-site/color';
import { useLayoutContext } from '../useLayoutContext';

type LayoutIdentifier = string;
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0)';

export const useSectionColor = (colorData: Record<LayoutIdentifier, string | null>): CntrlColor => {
  const layoutId = useLayoutContext();
   return useMemo(() => {
     if (!layoutId) return CntrlColor.parse(DEFAULT_COLOR);
     const layoutColor = colorData[layoutId];
     return CntrlColor.parse(
       !layoutColor
         ? DEFAULT_COLOR
         : layoutColor
     );
   }, [layoutId]);
};
