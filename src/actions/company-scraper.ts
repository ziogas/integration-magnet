'use server';

import FirecrawlApp from '@mendable/firecrawl-js';
import { CompanyContext } from '@/types';

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

export async function scrapeCompany(domain: string): Promise<CompanyContext> {
  const url = `https://${domain}`;

  if (!process.env.FIRECRAWL_API_KEY) {
    console.warn('FIRECRAWL_API_KEY not found, using fallback data');
    return {
      url,
      domain,
      name: extractCompanyName(domain),
      description: undefined,
      industry: undefined,
      logoUrl: `https://logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY}`,
      faviconUrl: `https://logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY}&size=32`,
    };
  }

  try {
    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

    const result = await firecrawl.scrape(url, {
      formats: ['markdown', 'html'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'p'],
      waitFor: 0,
      timeout: 15000,
    });

    if (!result || !result.metadata) {
      throw new Error('Failed to scrape URL');
    }

    const { metadata } = result;

    const title = (metadata?.title as string) || (metadata?.ogTitle as string) || (metadata?.['og:title'] as string);
    const companyName = extractCompanyName(domain, title);

    const description =
      (metadata?.description as string) ||
      (metadata?.ogDescription as string) ||
      (metadata?.['og:description'] as string);
    const companyDescription = description || undefined;

    return {
      url,
      domain,
      name: companyName,
      description: companyDescription,
      industry: undefined,
      logoUrl: `https://logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY}`,
      faviconUrl: `https://logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY}&size=32`,
    };
  } catch (error) {
    console.error('Error scraping URL:', error);

    return {
      url,
      domain,
      name: extractCompanyName(domain),
      description: undefined,
      industry: undefined,
      logoUrl: `https://logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY}`,
      faviconUrl: `https://logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY}&size=32`,
    };
  }
}
