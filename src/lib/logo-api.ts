export function getCompanyLogoUrl(domain: string, size: number = 256): string {
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
  const apiKey = process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY;

  return `https://img.logo.dev/${cleanDomain}?token=${apiKey}&size=${size}`;
}

export function getApplicationLogoUrl(appName: string, size: number = 128): string {
  const apiKey = process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY;

  const appDomainMap: Record<string, string> = {
    salesforce: 'salesforce.com',
    hubspot: 'hubspot.com',
    slack: 'slack.com',
    stripe: 'stripe.com',
    shopify: 'shopify.com',
    zoom: 'zoom.us',
    zendesk: 'zendesk.com',
    intercom: 'intercom.com',
    mailchimp: 'mailchimp.com',
    twilio: 'twilio.com',
    asana: 'asana.com',
    notion: 'notion.so',
    monday: 'monday.com',
    jira: 'atlassian.com',
    github: 'github.com',
    gitlab: 'gitlab.com',
    airtable: 'airtable.com',
    dropbox: 'dropbox.com',
    google: 'google.com',
    microsoft: 'microsoft.com',
    quickbooks: 'quickbooks.intuit.com',
    xero: 'xero.com',
    pipedrive: 'pipedrive.com',
    zoho: 'zoho.com',
    freshdesk: 'freshdesk.com',
    sendgrid: 'sendgrid.com',
    typeform: 'typeform.com',
    calendly: 'calendly.com',
    discord: 'discord.com',
    segment: 'segment.com',
  };

  const domain = appDomainMap[appName.toLowerCase()] || `${appName.toLowerCase()}.com`;

  return `https://img.logo.dev/${domain}?token=${apiKey}&size=${size}`;
}
