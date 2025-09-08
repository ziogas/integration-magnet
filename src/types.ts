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
  sourceSystem?: string | null;
  destinationSystem?: string | null;
  integrationType?: 'sync' | 'trigger' | 'action' | 'bidirectional' | 'import' | 'export' | null;
};

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

export type Persona = 'technical' | 'executive' | 'business';

export type FormData = {
  domain: string;
  useCase: string;
  persona: Persona;
  email?: string;
  gdprConsent?: boolean;
};

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

export type AnalyticsEvent = {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
};

export type AppError = {
  code: string;
  message: string;
  details?: unknown;
};
