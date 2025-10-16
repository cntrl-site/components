import { createContext } from 'react';
import { ArticleRectObserver } from '../utils/ArticleRectManager/ArticleRectObserver';

export const ArticleRectContext = createContext<ArticleRectObserver | null>(null);
