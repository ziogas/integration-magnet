// Company and Use Case Types
export type CompanyContext = {
  url: string;
  domain: string;
  name: string;
  description?: string;
  industry?: string;
  logoUrl?: string;
  faviconUrl?: string;
};

export type ParsedUseCase = {
  description: string;
  entities: string[];
  actions: string[];
  sourceSystem?: string;
  destinationSystem?: string;
  integrationType?: 'sync' | 'trigger' | 'action' | 'bidirectional' | 'import' | 'export';
};

// Scenario Template Types
export type ScenarioCategory =
  | 'unified-api'
  | 'data-import-export'
  | 'bi-directional-sync'
  | 'workflow-automation'
  | 'webhook-events'
  | 'data-transformation';

export type BuildingBlock =
  | 'actions'
  | 'events'
  | 'flows'
  | 'data-collections'
  | 'unified-data-models'
  | 'field-mappings';

export type ScenarioTemplate = {
  id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  keywords: string[];
  supportedApps: string[];
  buildingBlocks: BuildingBlock[];
  codeExample: string;
  jsonSpec?: Record<string, unknown>;
  howItWorks: string[];
  confidence?: number;
};

// API Response Types
export type FirecrawlResponse = {
  success: boolean;
  data?: {
    title?: string;
    description?: string;
    content?: string;
    metadata?: {
      title?: string;
      description?: string;
      keywords?: string;
      ogTitle?: string;
      ogDescription?: string;
    };
  };
  error?: string;
};

export type OpenAIResponse = {
  parsedUseCase?: ParsedUseCase;
  matchedScenario?: ScenarioTemplate;
  confidence: number;
  error?: string;
};

export type ScenarioGenerationResult = {
  companyContext: CompanyContext;
  parsedUseCase: ParsedUseCase;
  matchedScenario: ScenarioTemplate;
  personalizedDescription: string;
  codeSnippet: string;
  jsonSpec: Record<string, unknown>;
  applicationLogos: string[];
  confidence: number;
};

// Form Types
export type FormData = {
  companyUrl: string;
  useCase: string;
  email?: string;
  gdprConsent?: boolean;
};

// Lead Types
export type Lead = {
  email: string;
  domain: string;
  companyName?: string;
  useCase: string;
  scenarioId?: string;
  timestamp: Date;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

// Analytics Event Types
export type AnalyticsEvent = {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
};

// Error Types
export type AppError = {
  code: string;
  message: string;
  details?: unknown;
};
