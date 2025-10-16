import { useContext } from 'react';
import { CntrlContext } from '../../provider/CntrlContext';
import { getSectionHeight } from './Section';
import { SectionHeight } from '../../../sdk/types/article/Section';
import { Layout } from '../../../sdk/types/project/Layout';

export const useSectionHeightData = (sectionId: string): Record<string, string> => {
  const sectionHeightContext = useContext(CntrlContext);
  const layouts = sectionHeightContext.layouts;
  const sectionHeightData = sectionHeightContext.getSectionHeightData(sectionId);
  return sectionHeightData ? getSectionHeightMap(sectionHeightData) : getDefaultHeightData(layouts);
};

export function getSectionHeightMap(sectionHeight: Record<string, SectionHeight>): Record<string, string> {
  return Object.fromEntries(Object.entries(sectionHeight).map(([sectionId, heightData]) => [sectionId, getSectionHeight(heightData)]));
}

function getDefaultHeightData(layouts: Layout[]) {
  return layouts.reduce((acc, layout) => ({...acc, [layout.id]: '0'}), {});
}
