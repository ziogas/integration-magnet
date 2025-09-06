import FirecrawlApp, { MapOptions, type ScrapeOptions, type SearchRequest } from '@mendable/firecrawl-js';

if (globalThis.window) {
  throw new Error('Crawling is not supported in the browser');
}

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export const defaultScrapeParams: ScrapeOptions = {
  formats: ['markdown'],
  onlyMainContent: false,
  waitFor: 2000,
  removeBase64Images: true,
  maxAge: 86400000,
};

export const defaultSearchParams: Omit<SearchRequest, 'query'> = {
  sources: ['web'],
  limit: 10,
};

export const defaultMapParams: MapOptions = {
  limit: 10,
  includeSubdomains: false,
};

export async function scrapeUrl(url: string, scrapeParams: ScrapeOptions) {
  const scrapeResult = await app.scrape(url, scrapeParams || defaultScrapeParams);

  return scrapeResult;
}

export async function getUrlLinks(url: string, mapParams: MapOptions) {
  const scrapeResult = await app.map(url, mapParams || defaultMapParams);

  return scrapeResult.links;
}

export async function search(query: string, searchParams: SearchRequest) {
  const searchResult = await app.search(query, searchParams || defaultSearchParams);

  return searchResult;
}
