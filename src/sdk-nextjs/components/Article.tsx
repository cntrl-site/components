import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { Article as TArticle } from '../../sdk/types/article/Article';
import { Section } from './Section/Section';
import { Item } from './items/Item';
import { useArticleRectObserver } from '../utils/ArticleRectManager/useArticleRectObserver';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { ArticleWrapper } from './ArticleWrapper';
import { InteractionsProvider } from '../provider/InteractionsContext';
import { WebglContextManagerContext } from '../provider/WebGLContextManagerContext';
import { WebGLContextManager } from '@cntrl-site/effects';

interface Props {
  article: TArticle;
  sectionData: Record<SectionName, any>;
}

export const Article: FC<Props> = ({ article, sectionData }) => {
  const articleRef = useRef<HTMLDivElement | null>(null);
  const articleRectObserver = useArticleRectObserver(articleRef.current);
  const id = useId();
  const [articleHeight, setArticleHeight] = useState(1);

  useEffect(() => {
    if (!articleRectObserver) return;
    return articleRectObserver.on('resize', (rect) => {
      setArticleHeight(rect.height / rect.width);
    });
  }, [articleRectObserver]);

  const webglContextManager = useMemo(() => new WebGLContextManager(), []);

  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <InteractionsProvider article={article}>
        <ArticleWrapper>
          <div className="article" ref={articleRef}>
            <WebglContextManagerContext.Provider value={webglContextManager}>
              {article.sections.map((section, i) => {
                const data = section.name ? sectionData[section.name] : {};
                return (
                  <Section
                    section={section}
                    key={section.id}
                    data={data}
                  >
                    {article.sections[i].items.map(item => (
                      <Item
                        item={item}
                        key={item.id}
                        sectionId={section.id}
                        articleHeight={articleHeight}
                      />
                    ))}
                  </Section>
                );
              })}
            </WebglContextManagerContext.Provider>

          </div>
        </ArticleWrapper>
        <JSXStyle id={id}>{`
       .article {
         position: relative;
         overflow: clip;
       }
      `}</JSXStyle>
      </InteractionsProvider>
    </ArticleRectContext.Provider>
  );
};

type SectionName = string;
