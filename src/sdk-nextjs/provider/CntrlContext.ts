import { createContext } from 'react';
import { CntrlSdkContext } from './CntrlSdkContext';
import { cntrlSdkContext } from './defaultContext';

export const CntrlContext = createContext<CntrlSdkContext>(cntrlSdkContext);
