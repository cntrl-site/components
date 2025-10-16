import fetch from 'isomorphic-fetch';
import { URL } from 'url';
import { Meta } from '../types/project/Meta';
import { Page, PageMeta } from '../types/project/Page';
import { Project } from '../types/project/Project';
import { Layout } from '../types/project/Layout';
import { Article } from '../types/article/Article';
import { KeyframeAny } from '../types/keyframe/Keyframe';
import { ArticleSchema } from '../schemas/article/Article.schema';
import { ProjectSchema } from '../schemas/project/Project.schema';
import { KeyframesSchema } from '../schemas/keyframe/Keyframes.schema';

export class Client {
  private url: URL;
  constructor(
    APIUrl: string,
    private fetchImpl: FetchImpl = fetch
  ) {
    this.url = new URL(APIUrl);
    if (!this.url.username) {
      throw new Error('Project ID is missing in the URL.');
    }
    if (!this.url.password) {
      throw new Error('API key is missing in the URL.');
    }
  }

  private static getPageMeta(projectMeta: Meta, pageMeta: PageMeta): Meta {
    return pageMeta.enabled ? {
      title: pageMeta.title ? pageMeta.title : projectMeta.title ?? '',
      description: pageMeta.description ? pageMeta.description : projectMeta.description ?? '',
      keywords: pageMeta.keywords ? pageMeta.keywords : projectMeta.keywords ?? '',
      opengraphThumbnail: pageMeta.opengraphThumbnail ? pageMeta.opengraphThumbnail : projectMeta.opengraphThumbnail ?? '',
      favicon: projectMeta.favicon ?? ''
    } : projectMeta;
  }

  async getPageData(pageSlug: string, buildMode: 'default' | 'self-hosted' = 'default'): Promise<CntrlPageData> {
    try {
      const project = await this.fetchProject(buildMode);
      const articleId = this.findArticleIdByPageSlug(pageSlug, project.pages);
      const { article, keyframes } = await this.fetchArticle(articleId, buildMode);
      const page = project.pages.find(page => page.slug === pageSlug)!;
      const meta = Client.getPageMeta(project.meta, page?.meta!);
      return {
        project,
        article,
        keyframes,
        meta
      };
    } catch (e) {
      throw e;
    }
  }

  async getProjectPagesPaths(): Promise<string[]> {
    try {
      const { pages } = await this.fetchProject();
      return pages.map(p => p.slug);
    } catch (e) {
      throw e;
    }
  }

  async getLayouts(): Promise<Layout[]> {
    try {
      const { layouts } = await this.fetchProject();
      return layouts;
    } catch (e) {
      throw e;
    }
  }

  private async fetchProject(buildMode: 'default' | 'self-hosted' = 'default'): Promise<Project> {
    const { username: projectId, password: apiKey, origin } = this.url;
    const url = new URL(`/projects/${projectId}?buildMode=${buildMode}`, origin);
    const response = await this.fetchImpl(url.href, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch project with id #${projectId}: ${response.statusText}`);
    }
    const data = await response.json();
    const project = ProjectSchema.parse(data);
    return project;
  }

  private async fetchArticle(articleId: string, buildMode: 'default' | 'self-hosted' = 'default'): Promise<ArticleData> {
    const { username: projectId, password: apiKey, origin } = this.url;
    const url = new URL(`/projects/${projectId}/articles/${articleId}?buildMode=${buildMode}`, origin);
    const response = await this.fetchImpl(url.href, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch article with id #${articleId}: ${response.statusText}`);
    }
    const data = await response.json();
    const article = ArticleSchema.parse(data.article);
    const keyframes = KeyframesSchema.parse(data.keyframes);
    return { article, keyframes };
  }

  private findArticleIdByPageSlug(slug: string, pages: Page[]): string {
    const { username: projectId } = this.url;
    const page = pages.find((page) => page.slug === slug);
    if (!page) {
      throw new Error(`Page with a slug ${slug} was not found in project with id #${projectId}`);
    }
    return page.articleId;
  }
}

interface FetchImplResponse {
  ok: boolean;
  json(): Promise<any>;
  statusText: string;
}

type FetchImpl = (url: string, init?: RequestInit) => Promise<FetchImplResponse>;
interface ArticleData {
  article: Article;
  keyframes: KeyframeAny[];
}
interface CntrlPageData extends ArticleData {
  project: Project;
  meta: Meta;
}
