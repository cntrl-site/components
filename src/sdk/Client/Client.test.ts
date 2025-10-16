import { Client } from './Client';
import { projectMock } from './__mock__/projectMock';
import { articleMock } from './__mock__/articleMock';
import { keyframesMock } from './__mock__/keyframesMock';

describe('Client', () => {
  it('throws an error when no project ID passed to the connect URL', async () => {
    const projectId = '';
    const apiKey = 'MY_API_KEY';
    const apiUrl = `https://${projectId}:${apiKey}@api.cntrl.site/`;
    expect(() => new Client(apiUrl)).toThrow(new Error('Project ID is missing in the URL.'));
    expect(() => new Client('https://api.cntrl.site'))
      .toThrow(new Error('Project ID is missing in the URL.'));
  });

  it('throws an error when no API key passed to the connect URL', async () => {
    const projectId = 'whatever';
    const apiKey = '';
    const apiUrl = `https://${projectId}:${apiKey}@api.cntrl.site/`;
    expect(() => new Client(apiUrl)).toThrow(new Error('API key is missing in the URL.'));
  });

  it('returns page data', async () => {
    const projectId = 'projectId';
    const API_BASE_URL = 'api-test.cntrl.site';
    const fetchesMap: Record<string, unknown> = {
      [`https://${API_BASE_URL}/projects/${projectId}?buildMode=default`]: projectMock,
      [`https://${API_BASE_URL}/projects/${projectId}/articles/articleId?buildMode=default`]: {
        article: articleMock,
        keyframes: keyframesMock
      }
    };
    const apiKey = 'MY_API_KEY';
    let fetchCalledTimes = 0;
    const apiUrl = `https://${projectId}:${apiKey}@${API_BASE_URL}/`;
    const fetch = async (url: string) => {
      fetchCalledTimes += 1;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fetchesMap[url]),
        statusText: ''
      });
    };
    const client = new Client(apiUrl, fetch);
    const pageData = await client.getPageData('/');
    expect(fetchCalledTimes).toBe(2);
    expect(pageData.project).toEqual(projectMock);
    expect(pageData.article).toEqual(articleMock);
    expect(pageData.keyframes).toEqual(keyframesMock);
    expect(pageData.meta).toEqual({
      description: 'page description',
      favicon: 'project favicon',
      keywords: 'page keywords',
      opengraphThumbnail: 'page thumbnail',
      title: 'page title'
    });
  });

  it('ignores page meta if it is not enabled and uses project meta instead', async () => {
    const projectId = 'projectId';
    const API_BASE_URL = 'api-test.cntrl.site';
    const fetchesMap: Record<string, unknown> = {
      [`https://${API_BASE_URL}/projects/${projectId}?buildMode=default`]: projectMock,
      [`https://${API_BASE_URL}/projects/${projectId}/articles/articleId2?buildMode=default`]: {
        article: articleMock,
        keyframes: keyframesMock
      }
    };
    const apiKey = 'MY_API_KEY';
    let fetchCalledTimes = 0;
    const apiUrl = `https://${projectId}:${apiKey}@${API_BASE_URL}/`;
    const fetch = async (url: string) => {
      fetchCalledTimes += 1;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fetchesMap[url]),
        statusText: ''
      });
    };
    const client = new Client(apiUrl, fetch);
    const pageData = await client.getPageData('/2');
    expect(pageData.meta).toEqual({
      description: 'project description',
      favicon: 'project favicon',
      keywords: 'project keywords',
      opengraphThumbnail: 'project opengraph',
      title: 'project title'
    });
  });

  it('throws an error upon page data fetch failure', async () => {
    const projectId = 'MY_PROJECT_ID';
    const apiKey = 'MY_API_KEY';
    const apiUrl = `https://${projectId}:${apiKey}@api.cntrl.site/`;
    const fetch = async () => Promise.resolve({
      ok: false,
      statusText: 'reason',
      json: () => Promise.resolve()
    });
    const client = new Client(apiUrl, fetch);
    await expect(client.getPageData('/')).rejects.toEqual(new Error('Failed to fetch project with id #MY_PROJECT_ID: reason'));
  });

  it('throws an error when trying to fetch article by nonexistent slug', async () => {
    const projectId = 'MY_PROJECT_ID';
    const apiKey = 'MY_API_KEY';
    const apiUrl = `https://${projectId}:${apiKey}@api.cntrl.site/`;
    const projectApiUrl = `https://api.cntrl.site/projects/${projectId}?buildMode=default`;
    const slug = '/nonexistent-slug';
    const fetch = (url: string) => {
      return Promise.resolve({
        ok: url === projectApiUrl,
        json: () => Promise.resolve(projectMock),
        statusText: 'reason'
      });
    };
    const client = new Client(apiUrl, fetch);
    await expect(client.getPageData(slug))
      .rejects.toEqual(new Error(`Page with a slug ${slug} was not found in project with id #${projectId}`));
  });
});
