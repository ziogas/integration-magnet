'use server';

import { scrapeUrl, defaultScrapeParams } from '@/lib/firecrawl';
import { getCompanyLogoUrl } from '@/lib/logo-api';
import { CompanyContext } from '@/types';
import { redis } from '@/lib/redis';

function extractCompanyName(domain: string, title?: string): string {
  if (title) {
    const cleanTitle = title.split(/[|–-]/)[0].trim();
    if (cleanTitle.length > 2 && cleanTitle.length < 50) {
      return cleanTitle;
    }
  }

  const nameFromDomain = domain.split('.')[0];
  return nameFromDomain.charAt(0).toUpperCase() + nameFromDomain.slice(1);
}

function getErrorMessage(error: unknown): string | undefined {
  const err = error as { message?: string; code?: string; response?: { status: number } };
  const errorMessage = err?.message || '';
  const status = err?.response?.status || 0;

  if (err?.code === 'ENOTFOUND') {
    return 'Domain does not exist';
  } else if (errorMessage.includes('timeout')) {
    return 'Request timed out';
  } else if (status === 404) {
    return 'Website not found';
  } else if (status >= 500) {
    return 'Website is currently unavailable';
  }

  return 'Could not reach website';
}

export async function scrapeCompanyDetails(
  domain: string
): Promise<{ data: CompanyContext; hasFullData: boolean; error?: string }> {
  const url = `https://${domain}`;
  const cacheKey = `company:${domain}`;
  const cacheTTL = 86400 * 7;

  const companyName = extractCompanyName(domain);
  const fallbackData: CompanyContext = {
    url,
    domain,
    name: companyName,
    description: `${companyName} - Visit website for details`,
    industry: undefined,
    logoUrl: getCompanyLogoUrl(domain),
    faviconUrl: getCompanyLogoUrl(domain, 32),
  };

  try {
    const cached = await redis.get<{ data: CompanyContext; hasFullData: boolean }>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.error('Redis cache read error:', error);
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    console.warn('FIRECRAWL_API_KEY not found');
    return { data: fallbackData, hasFullData: false };
  }

  try {
    await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    return { data: fallbackData, hasFullData: false, error: errorMsg };
  }

  async function attemptScrape() {
    return await scrapeUrl(url, {
      ...defaultScrapeParams,
      formats: ['markdown'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'p'],
      timeout: 15000,
    });
  }

  let result;
  let scrapeError;

  try {
    result = await attemptScrape();
  } catch (firstError) {
    console.warn('First scrape attempt failed, retrying once:', firstError);
    try {
      result = await attemptScrape();
    } catch (secondError) {
      console.error('Both scrape attempts failed:', secondError);
      scrapeError = secondError;
    }
  }

  if (scrapeError) {
    return { data: fallbackData, hasFullData: false, error: getErrorMessage(scrapeError) };
  }

  if (!result || !result.metadata) {
    console.warn('No metadata returned from scraping');
    return { data: fallbackData, hasFullData: false, error: "Website didn't provide company details" };
  }

  const { metadata } = result;

  const title = (metadata?.title as string) || (metadata?.ogTitle as string) || (metadata?.['og:title'] as string);
  const extractedName = extractCompanyName(domain, title);

  const description =
    (metadata?.description as string) ||
    (metadata?.ogDescription as string) ||
    (metadata?.['og:description'] as string) ||
    `${extractedName} - Visit website for details`;

  const response = {
    data: {
      url,
      domain,
      name: extractedName,
      description,
      industry: undefined,
      logoUrl: getCompanyLogoUrl(domain),
      faviconUrl: getCompanyLogoUrl(domain, 32),
    },
    hasFullData: true,
  };

  try {
    await redis.set(cacheKey, response, { ex: cacheTTL });
  } catch (error) {
    console.error('Redis cache write error:', error);
  }

  return response;
}
