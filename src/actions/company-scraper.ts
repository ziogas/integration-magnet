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

export async function scrapeCompanyDetails(domain: string): Promise<{ data: CompanyContext; hasFullData: boolean }> {
  const url = `https://${domain}`;
  const cacheKey = `company:${domain}`;
  const cacheTTL = 60 * 60 * 24 * 7; // 7 days in seconds

  const fallbackData: CompanyContext = {
    url,
    domain,
    name: extractCompanyName(domain),
    description: undefined,
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
    const result = await scrapeUrl(url, {
      ...defaultScrapeParams,
      formats: ['markdown'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'p'],
      timeout: 15000,
    });

    if (!result || !result.metadata) {
      console.warn('No metadata returned from scraping');
      return { data: fallbackData, hasFullData: false };
    }

    const { metadata } = result;

    const title = (metadata?.title as string) || (metadata?.ogTitle as string) || (metadata?.['og:title'] as string);
    const companyName = extractCompanyName(domain, title);

    const description =
      (metadata?.description as string) ||
      (metadata?.ogDescription as string) ||
      (metadata?.['og:description'] as string);

    const response = {
      data: {
        url,
        domain,
        name: companyName,
        description: description || undefined,
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
  } catch (error) {
    console.error('Error scraping URL:', error);
    return { data: fallbackData, hasFullData: false };
  }
}
