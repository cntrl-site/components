import { WebGLContextManager } from '@cntrl-site/effects';
import { createContext } from 'react';

export const WebglContextManagerContext = createContext(new WebGLContextManager());
