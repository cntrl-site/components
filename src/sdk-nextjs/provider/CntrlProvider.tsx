import { FC, PropsWithChildren } from 'react';
import { CntrlContext } from './CntrlContext';
import { cntrlSdkContext } from './defaultContext';

export const CntrlProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <CntrlContext.Provider value={cntrlSdkContext}>
      {children}
    </CntrlContext.Provider>
  );
};
