import { Project } from '../../types/project/Project';

export const projectMock: Project = {
  id: 'projectId',
  layouts: [],
  fonts: {
    google: '',
    adobe: '',
    custom: []
  },
  html: {
    beforeBodyClose: '',
    afterBodyOpen: '',
    head: ''
  },
  meta: {
    favicon: 'project favicon',
    title: 'project title',
    opengraphThumbnail: 'project opengraph',
    keywords: 'project keywords',
    description: 'project description'
  },
  pages: [{
    id: 'pageId',
    title: 'Page',
    articleId: 'articleId',
    slug: '/',
    meta: {
      opengraphThumbnail: 'page thumbnail',
      title: 'page title',
      description: 'page description',
      enabled: true,
      keywords: 'page keywords'
    }
  },
    {
      id: 'pageId2',
      title: 'Page 2',
      articleId: 'articleId2',
      slug: '/2',
      meta: {
        opengraphThumbnail: 'page thumbnail',
        title: 'page title',
        description: 'page description',
        enabled: false,
        keywords: 'page keywords'
      }
    }]
};
