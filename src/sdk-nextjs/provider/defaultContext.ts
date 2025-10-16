import { CntrlSdkContext } from './CntrlSdkContext';
import { CustomItemRegistry } from './CustomItemRegistry';
import { CustomSectionRegistry } from './CustomSectionRegistry';

const customItems = new CustomItemRegistry();
const customSections = new CustomSectionRegistry();

export const cntrlSdkContext = new CntrlSdkContext(customItems, customSections);
