import { useContext } from 'react';
import { CntrlContext } from './CntrlContext';
import { CntrlSdkContext } from './CntrlSdkContext';

export function useCntrlContext(): CntrlSdkContext {
  const context = useContext(CntrlContext);
  return context;
}
