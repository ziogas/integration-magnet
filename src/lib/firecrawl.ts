import FirecrawlApp, { type ScrapeOptions } from '@mendable/firecrawl-js';

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

export async function scrapeUrl(url: string, scrapeParams: ScrapeOptions) {
  const scrapeResult = await app.scrape(url, scrapeParams || defaultScrapeParams);

  return scrapeResult;
}
