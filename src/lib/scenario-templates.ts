import { ScenarioTemplate } from '@/types';

export const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: 'unified-companies-sync',
    name: 'Unified Companies API Sync',
    description: 'Synchronize company data across multiple CRM and business systems',
    category: 'unified-api',
    keywords: ['companies', 'accounts', 'organizations', 'crm', 'sync', 'business'],
    supportedApps: [
      'Salesforce',
      'HubSpot',
      'Pipedrive',
      'Microsoft Dynamics',
      'Zoho CRM',
      'Monday.com',
      'Intercom',
      'Zendesk',
    ],
    buildingBlocks: ['actions', 'data-collections', 'unified-data-models', 'field-mappings'],
    codeExample: `const membrane = require('@membrane/sdk');

const companies = await membrane.companies.list({
  provider: 'salesforce',
  filters: {
    created_after: '2024-01-01',
    revenue: { $gte: 1000000 }
  }
});

companies.forEach(company => {
  await database.companies.upsert({
    id: company.id,
    name: company.name,
    revenue: company.revenue,
    employeeCount: company.employee_count,
    industry: company.industry
  });
});`,
    howItWorks: [
      "Connect to any CRM using Membrane's unified API",
      'Query companies with consistent filters across providers',
      'Map data automatically to your schema',
      'Sync bi-directionally with conflict resolution',
    ],
  },
  {
    id: 'unified-contacts-sync',
    name: 'Unified Contacts API Integration',
    description: 'Manage and synchronize contact data across all your business applications',
    category: 'unified-api',
    keywords: ['contacts', 'people', 'customers', 'leads', 'crm', 'email'],
    supportedApps: [
      'Salesforce',
      'HubSpot',
      'Google Contacts',
      'Microsoft 365',
      'Mailchimp',
      'SendGrid',
      'Intercom',
      'Zendesk',
    ],
    buildingBlocks: ['actions', 'events', 'data-collections', 'unified-data-models'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.contacts.on('created', async (contact) => {
  const enriched = await membrane.enrichment.person(contact.email);

  await membrane.contacts.update(contact.id, {
    ...enriched,
    tags: ['prospect', 'high-value']
  });

  await membrane.actions.trigger('welcome-sequence', { contact });
});`,
    howItWorks: [
      'Connect all your contact sources with one API',
      'Receive real-time updates when contacts change',
      'Enrich data automatically from multiple sources',
      'Keep all systems in sync without duplicates',
    ],
  },
  {
    id: 'unified-invoices-sync',
    name: 'Unified Invoices & Billing Integration',
    description: 'Synchronize invoice and payment data across accounting and billing platforms',
    category: 'unified-api',
    keywords: ['invoices', 'billing', 'payments', 'accounting', 'finance', 'subscriptions'],
    supportedApps: ['Stripe', 'QuickBooks', 'Xero', 'FreshBooks', 'Wave', 'Square', 'PayPal', 'Chargebee'],
    buildingBlocks: ['actions', 'events', 'data-collections', 'field-mappings'],
    codeExample: `const membrane = require('@membrane/sdk');

const invoice = await membrane.invoices.create({
  customer_id: 'cust_123',
  line_items: [
    { description: 'Pro Plan', amount: 99.00, quantity: 1 }
  ],
  provider: 'stripe' // or 'quickbooks', 'xero', etc.
});

membrane.invoices.on('paid', async (invoice) => {
  await membrane.accounting.recordPayment({
    invoice_id: invoice.id,
    amount: invoice.total,
    date: invoice.paid_at
  });
});`,
    howItWorks: [
      'Create invoices in any billing system',
      'Sync payment status in real-time',
      'Automatically update accounting records',
      'Handle currency conversion and tax calculations',
    ],
  },

  {
    id: 'bulk-data-import',
    name: 'Bulk Data Import Pipeline',
    description: 'Import large datasets from CSV, Excel, or APIs into your application',
    category: 'data-import-export',
    keywords: ['import', 'csv', 'excel', 'bulk', 'etl', 'migration', 'data'],
    supportedApps: ['Google Sheets', 'Excel', 'Airtable', 'PostgreSQL', 'MySQL', 'MongoDB', 'Snowflake', 'BigQuery'],
    buildingBlocks: ['flows', 'data-collections', 'field-mappings'],
    codeExample: `const membrane = require('@membrane/sdk');

const importFlow = membrane.flows.create({
  name: 'Customer Data Import',
  steps: [
    {
      action: 'extract',
      source: 'google_sheets',
      config: { spreadsheet_id: 'abc123', range: 'A1:Z1000' }
    },
    {
      action: 'transform',
      mappings: {
        'Full Name': 'name',
        'Email Address': 'email',
        'Company': 'company_name'
      }
    },
    {
      action: 'validate',
      rules: { email: 'email', required: ['name', 'email'] }
    },
    {
      action: 'load',
      destination: 'database',
      mode: 'upsert',
      key: 'email'
    }
  ]
});

await importFlow.run();`,
    howItWorks: [
      'Connect to any data source (files, APIs, databases)',
      'Map and transform fields to match your schema',
      'Validate data with custom rules',
      'Load with deduplication and error handling',
    ],
  },
  {
    id: 'scheduled-export',
    name: 'Automated Data Export & Reporting',
    description: 'Schedule regular exports of your data to external systems or reports',
    category: 'data-import-export',
    keywords: ['export', 'reports', 'scheduled', 'automation', 'csv', 'analytics'],
    supportedApps: ['Google Drive', 'Dropbox', 'S3', 'SFTP', 'Email', 'Slack', 'Tableau', 'Power BI'],
    buildingBlocks: ['flows', 'actions', 'data-collections'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.flows.schedule({
  name: 'Daily Sales Report',
  cron: '0 9 * * *', // 9 AM daily
  flow: async () => {
    const sales = await membrane.data.query({
      collection: 'orders',
      filters: {
        date: { $gte: 'yesterday' },
        status: 'completed'
      }
    });

    const csv = membrane.transform.toCSV(sales);

    await Promise.all([
      membrane.storage.upload('s3', 'reports/daily-sales.csv', csv),
      membrane.email.send({
        to: 'team@company.com',
        subject: 'Daily Sales Report',
        attachments: [{ filename: 'sales.csv', content: csv }]
      }),
      membrane.slack.post('#sales', \`Daily revenue: $\${sales.total}\`)
    ]);
  }
});`,
    howItWorks: [
      'Schedule exports with cron expressions',
      'Query and aggregate data from any source',
      'Transform to multiple formats (CSV, JSON, Excel)',
      'Deliver to multiple destinations simultaneously',
    ],
  },

  {
    id: 'crm-helpdesk-sync',
    name: 'CRM & Help Desk Bi-directional Sync',
    description: 'Keep customer data synchronized between CRM and support systems',
    category: 'bi-directional-sync',
    keywords: ['sync', 'crm', 'support', 'helpdesk', 'tickets', 'bidirectional'],
    supportedApps: ['Salesforce', 'HubSpot', 'Zendesk', 'Intercom', 'Freshdesk', 'Jira Service Desk', 'ServiceNow'],
    buildingBlocks: ['events', 'actions', 'data-collections', 'field-mappings'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.sync.configure({
  source: 'salesforce',
  target: 'zendesk',
  entities: ['contacts', 'companies'],
  mode: 'bidirectional',
  conflictResolution: 'last-write-wins',
  fieldMappings: {
    'salesforce.Account': {
      'Name': 'zendesk.organization.name',
      'AnnualRevenue': 'zendesk.organization.custom_fields.revenue',
      'NumberOfEmployees': 'zendesk.organization.custom_fields.size'
    }
  }
});

membrane.sync.on('conflict', async (conflict) => {
  const resolution = await membrane.ai.resolveConflict(conflict);
  return resolution;
});`,
    howItWorks: [
      'Set up real-time bi-directional sync',
      'Map fields between different systems',
      'Handle conflicts with AI-powered resolution',
      'Maintain data consistency across platforms',
    ],
  },
  {
    id: 'calendar-sync',
    name: 'Multi-Calendar Synchronization',
    description: 'Synchronize events across multiple calendar systems',
    category: 'bi-directional-sync',
    keywords: ['calendar', 'events', 'meetings', 'scheduling', 'sync', 'appointments'],
    supportedApps: ['Google Calendar', 'Microsoft Outlook', 'Calendly', 'Zoom', 'Slack', 'Apple Calendar', 'CalDav'],
    buildingBlocks: ['events', 'actions', 'flows', 'field-mappings'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.calendars.sync({
  sources: ['google_calendar', 'outlook', 'calendly'],
  rules: {
    visibility: 'public_only',
    excludePatterns: ['*personal*', '*private*'],
    conflictHandling: 'create-tentative'
  }
});

membrane.calendars.on('event.created', async (event) => {
  if (event.type === 'meeting') {
    const zoomLink = await membrane.zoom.createMeeting({
      topic: event.title,
      start_time: event.start,
      duration: event.duration
    });

    await membrane.calendars.update(event.id, {
      location: zoomLink.join_url,
      description: event.description + \\n\\nZoom: \${zoomLink.join_url}
    });
  }
});`,
    howItWorks: [
      'Connect multiple calendar systems',
      'Sync events with privacy controls',
      'Auto-generate meeting links',
      'Handle scheduling conflicts intelligently',
    ],
  },

  {
    id: 'lead-routing-automation',
    name: 'Intelligent Lead Routing Workflow',
    description: 'Automatically route and assign leads based on AI-powered scoring and rules',
    category: 'workflow-automation',
    keywords: ['leads', 'routing', 'automation', 'sales', 'assignment', 'scoring'],
    supportedApps: ['Salesforce', 'HubSpot', 'Marketo', 'Pardot', 'ActiveCampaign', 'Mailchimp', 'Segment'],
    buildingBlocks: ['flows', 'actions', 'events'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.flows.create({
  name: 'Smart Lead Router',
  trigger: 'lead.created',
  steps: [
    {
      action: 'enrich',
      provider: 'clearbit',
      data: ['company', 'social', 'demographics']
    },
    {
      action: 'score',
      model: 'membrane-ai',
      factors: ['engagement', 'fit', 'intent', 'budget']
    },
    {
      action: 'route',
      rules: [
        { score: { $gte: 80 }, assign: 'enterprise-team' },
        { score: { $gte: 50 }, assign: 'mid-market-team' },
        { score: { $lt: 50 }, assign: 'smb-team' }
      ]
    },
    {
      action: 'notify',
      channels: ['email', 'slack'],
      template: 'new-lead-assigned'
    }
  ]
});`,
    howItWorks: [
      'Capture leads from any source',
      'Enrich with third-party data',
      'Score using AI models',
      'Route to appropriate team members',
    ],
  },
  {
    id: 'customer-onboarding',
    name: 'Automated Customer Onboarding Flow',
    description: 'Orchestrate complex onboarding workflows across multiple systems',
    category: 'workflow-automation',
    keywords: ['onboarding', 'customer', 'automation', 'workflow', 'provisioning'],
    supportedApps: ['Stripe', 'Auth0', 'Okta', 'SendGrid', 'Twilio', 'DocuSign', 'GitHub', 'AWS'],
    buildingBlocks: ['flows', 'actions', 'events', 'data-collections'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.flows.create({
  name: 'Customer Onboarding',
  trigger: 'payment.succeeded',
  steps: [
    {
      action: 'provision',
      parallel: [
        { service: 'auth0', action: 'create_user' },
        { service: 'aws', action: 'provision_resources' },
        { service: 'github', action: 'create_repository' }
      ]
    },
    {
      action: 'document',
      service: 'docusign',
      template: 'service-agreement'
    },
    {
      action: 'communicate',
      sequence: [
        { channel: 'email', template: 'welcome', delay: 0 },
        { channel: 'email', template: 'getting-started', delay: '1d' },
        { channel: 'sms', template: 'check-in', delay: '3d' }
      ]
    },
    {
      action: 'track',
      events: ['login', 'first-action', 'integration-complete'],
      alert_if_missing: '7d'
    }
  ]
});`,
    howItWorks: [
      'Trigger onboarding on payment completion',
      'Provision accounts across all systems',
      'Send documents for signature',
      'Orchestrate multi-channel communication',
    ],
  },

  {
    id: 'webhook-processor',
    name: 'Intelligent Webhook Event Processor',
    description: 'Process and route webhook events with transformation and enrichment',
    category: 'webhook-events',
    keywords: ['webhooks', 'events', 'real-time', 'streaming', 'notifications'],
    supportedApps: ['Stripe', 'GitHub', 'Shopify', 'Twilio', 'SendGrid', 'Datadog', 'PagerDuty', 'Custom Webhooks'],
    buildingBlocks: ['events', 'flows', 'actions', 'data-collections'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.webhooks.create({
  endpoint: '/hooks/process',
  processors: {
    'stripe': async (event) => {
      if (event.type === 'customer.subscription.deleted') {
        await membrane.flows.trigger('churn-prevention', {
          customer: event.data.object.customer,
          reason: await membrane.ai.analyzeChurn(event)
        });
      }
    },
    'github': async (event) => {
      if (event.type === 'pull_request.opened') {
        await membrane.slack.post('#engineering', {
          text: \`New PR: \${event.pull_request.title}\`,
          actions: ['approve', 'request-changes', 'merge']
        });
      }
    },
    'shopify': async (event) => {
      if (event.type === 'order.created') {
        await membrane.flows.trigger('fulfillment', event.order);
      }
    }
  },
  errorHandling: 'retry-with-backoff',
  storage: 'event-log'
});`,
    howItWorks: [
      'Receive webhooks from any service',
      'Process with service-specific logic',
      'Trigger automated workflows',
      'Store events for audit and replay',
    ],
  },
  {
    id: 'real-time-alerts',
    name: 'Multi-Channel Alert System',
    description: 'Send intelligent alerts across multiple channels based on business events',
    category: 'webhook-events',
    keywords: ['alerts', 'monitoring', 'notifications', 'real-time', 'incidents'],
    supportedApps: [
      'PagerDuty',
      'Slack',
      'Microsoft Teams',
      'Twilio',
      'Email',
      'Discord',
      'Telegram',
      'Custom Webhooks',
    ],
    buildingBlocks: ['events', 'flows', 'actions'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.alerts.configure({
  rules: [
    {
      condition: 'revenue.dropped',
      threshold: { percent: 20, window: '1h' },
      severity: 'critical',
      channels: ['pagerduty', 'slack-ops', 'sms-oncall']
    },
    {
      condition: 'api.error_rate',
      threshold: { percent: 5, window: '5m' },
      severity: 'warning',
      channels: ['slack-engineering', 'email-team']
    },
    {
      condition: 'customer.churn_risk',
      threshold: { score: 0.8 },
      severity: 'info',
      channels: ['slack-customer-success', 'crm-task']
    }
  ],
  escalation: {
    no_ack_in: '10m',
    escalate_to: 'manager',
    max_escalations: 3
  },
  quiet_hours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
    timezone: 'America/New_York',
    override_severity: ['critical']
  }
});`,
    howItWorks: [
      'Monitor business metrics in real-time',
      'Evaluate alert conditions continuously',
      'Route to appropriate channels by severity',
      'Handle escalation and quiet hours',
    ],
  },

  {
    id: 'etl-pipeline',
    name: 'ETL Data Pipeline',
    description: 'Extract, transform, and load data between systems with complex transformations',
    category: 'data-transformation',
    keywords: ['etl', 'pipeline', 'transformation', 'data', 'warehouse', 'analytics'],
    supportedApps: ['PostgreSQL', 'MySQL', 'MongoDB', 'Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'Kafka'],
    buildingBlocks: ['flows', 'data-collections', 'field-mappings'],
    codeExample: `const membrane = require('@membrane/sdk');

const pipeline = membrane.pipeline.create({
  name: 'Sales Analytics ETL',
  schedule: '*/15 * * * *', // Every 15 minutes

  extract: {
    sources: [
      { type: 'database', connection: 'postgres_prod', query: 'SELECT * FROM orders WHERE updated_at > :last_sync' },
      { type: 'api', service: 'stripe', endpoint: 'charges', params: { created: { gte: ':last_sync' } } },
      { type: 'stream', service: 'kafka', topic: 'user-events', offset: 'latest' }
    ]
  },

  transform: {
    steps: [
      { action: 'join', on: 'customer_id', type: 'left' },
      { action: 'aggregate',
        groupBy: ['customer_id', 'product_id'],
        calculations: {
          total_revenue: 'sum(amount)',
          order_count: 'count(*)',
          avg_order_value: 'avg(amount)'
        }
      },
      { action: 'enrich',
        fields: {
          customer_segment: 'membrane.ai.classify(customer_id)',
          predicted_ltv: 'membrane.ai.predict("ltv", customer_id)'
        }
      },
      { action: 'normalize',
        schema: 'analytics.sales_metrics'
      }
    ]
  },

  load: {
    destination: 'snowflake',
    table: 'analytics.sales_metrics',
    mode: 'merge',
    keys: ['customer_id', 'product_id', 'date']
  },

  monitoring: {
    alerts: ['failed_records', 'schema_drift', 'performance_degradation'],
    logging: 'detailed',
    retention: '30d'
  }
});`,
    howItWorks: [
      'Extract data from multiple sources',
      'Join and aggregate data sets',
      'Apply AI enrichment and predictions',
      'Load to data warehouse with deduplication',
    ],
  },
  {
    id: 'data-sync-mapping',
    name: 'Advanced Field Mapping & Transformation',
    description: 'Map and transform data between systems with different schemas',
    category: 'data-transformation',
    keywords: ['mapping', 'transformation', 'schema', 'sync', 'conversion'],
    supportedApps: ['Any API', 'Any Database', 'Custom Systems'],
    buildingBlocks: ['field-mappings', 'data-collections', 'actions'],
    codeExample: `const membrane = require('@membrane/sdk');

membrane.mapping.create({
  name: 'CRM to ERP Sync',
  source: 'salesforce',
  target: 'sap',

  mappings: [
    { from: 'Account.Name', to: 'Customer.CompanyName' },

    {
      from: 'Account.AnnualRevenue',
      to: 'Customer.Revenue',
      transform: (value) => value * 1.1 // Add 10% markup
    },

    {
      from: 'Account.Type',
      to: 'Customer.Category',
      transform: (value) => {
        switch(value) {
          case 'Enterprise': return 'A';
          case 'Mid-Market': return 'B';
          default: return 'C';
        }
      }
    },

    {
      to: 'Customer.CreditLimit',
      compute: (record) => {
        const revenue = record['Account.AnnualRevenue'];
        const employees = record['Account.NumberOfEmployees'];
        return membrane.ai.calculateCreditLimit({ revenue, employees });
      }
    },

    {
      from: 'Contact[]',
      to: 'Customer.Contacts[]',
      mapping: {
        'FirstName': 'GivenName',
        'LastName': 'FamilyName',
        'Email': 'EmailAddress',
        'Phone': 'PhoneNumber'
      }
    }
  ],

  validation: {
    required: ['Customer.CompanyName', 'Customer.Category'],
    unique: ['Customer.TaxId'],
    custom: [
      {
        field: 'Customer.CreditLimit',
        rule: (value) => value >= 0 && value <= 1000000,
        message: 'Credit limit must be between 0 and 1M'
      }
    ]
  },

  errorHandling: 'queue-for-review'
});`,
    howItWorks: [
      'Define complex field mappings',
      'Apply transformation functions',
      'Compute derived fields with AI',
      'Validate data before syncing',
    ],
  },
];

// Helper function to find scenarios by keywords
export function findScenariosByKeywords(keywords: string[]): ScenarioTemplate[] {
  const keywordSet = new Set(keywords.map((k) => k.toLowerCase()));

  return scenarioTemplates.filter((scenario) => {
    const scenarioKeywords = new Set(scenario.keywords.map((k) => k.toLowerCase()));
    return [...keywordSet].some((keyword) => scenarioKeywords.has(keyword));
  });
}

// Helper function to find scenarios by category
export function findScenariosByCategory(category: ScenarioTemplate['category']): ScenarioTemplate[] {
  return scenarioTemplates.filter((scenario) => scenario.category === category);
}

// Helper function to find scenarios by supported apps
export function findScenariosBySupportedApps(apps: string[]): ScenarioTemplate[] {
  const appSet = new Set(apps.map((a) => a.toLowerCase()));

  return scenarioTemplates.filter((scenario) => {
    const scenarioApps = new Set(scenario.supportedApps.map((a) => a.toLowerCase()));
    return [...appSet].some((app) => scenarioApps.has(app));
  });
}

// Get all unique supported apps across all scenarios
export function getAllSupportedApps(): string[] {
  const apps = new Set<string>();
  scenarioTemplates.forEach((scenario) => {
    scenario.supportedApps.forEach((app) => apps.add(app));
  });
  return Array.from(apps).sort();
}

// Get all unique categories
export function getAllCategories(): ScenarioTemplate['category'][] {
  const categories = new Set<ScenarioTemplate['category']>();
  scenarioTemplates.forEach((scenario) => {
    categories.add(scenario.category);
  });
  return Array.from(categories);
}
