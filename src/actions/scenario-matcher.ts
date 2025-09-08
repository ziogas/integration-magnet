'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import { scenarioTemplates } from '@/lib/scenario-templates';
import type { ScenarioTemplate, BuildingBlock, ScenarioCategory, ParsedUseCase } from '@/types';

function mapToValidCategory(category: string): ScenarioCategory {
  const categoryMap: Record<string, ScenarioCategory> = {
    'unified-api': 'unified-api',
    'data-import-export': 'data-import-export',
    'bi-directional-sync': 'bi-directional-sync',
    'workflow-automation': 'workflow-automation',
    'webhook-events': 'webhook-events',
    'data-transformation': 'data-transformation',
    unified: 'unified-api',
    import: 'data-import-export',
    export: 'data-import-export',
    sync: 'bi-directional-sync',
    bidirectional: 'bi-directional-sync',
    workflow: 'workflow-automation',
    automation: 'workflow-automation',
    webhook: 'webhook-events',
    event: 'webhook-events',
    etl: 'data-transformation',
    transform: 'data-transformation',
    transformation: 'data-transformation',
  };

  const normalized = category.toLowerCase().replace(/[_\s-]/g, '');

  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  return 'workflow-automation';
}

function validateAndMapBuildingBlocks(blocks: string[]): BuildingBlock[] {
  const validBlocks: BuildingBlock[] = [
    'actions',
    'events',
    'flows',
    'data-collections',
    'unified-data-models',
    'field-mappings',
  ];

  const blockMap: Record<string, BuildingBlock> = {
    actions: 'actions',
    action: 'actions',
    events: 'events',
    event: 'events',
    flows: 'flows',
    flow: 'flows',
    datacollections: 'data-collections',
    datacollection: 'data-collections',
    collections: 'data-collections',
    unifieddatamodels: 'unified-data-models',
    unifiedmodels: 'unified-data-models',
    datamodels: 'unified-data-models',
    fieldmappings: 'field-mappings',
    fieldmapping: 'field-mappings',
    mappings: 'field-mappings',
  };

  const result: BuildingBlock[] = [];
  const seen = new Set<BuildingBlock>();

  for (const block of blocks) {
    const normalized = block.toLowerCase().replace(/[_\s-]/g, '');
    const mapped = blockMap[normalized];

    if (mapped && !seen.has(mapped)) {
      result.push(mapped);
      seen.add(mapped);
    } else if (validBlocks.includes(block as BuildingBlock) && !seen.has(block as BuildingBlock)) {
      result.push(block as BuildingBlock);
      seen.add(block as BuildingBlock);
    }
  }

  if (result.length === 0) {
    result.push('actions');
  }

  return result;
}

function preFilterScenarios(useCase: string, maxScenarios = 30): typeof scenarioTemplates {
  const useCaseLower = useCase.toLowerCase();
  const words = useCaseLower.split(/\s+/);

  const scoredScenarios = scenarioTemplates.map((scenario) => {
    let score = 0;

    if (scenario.name.toLowerCase().includes(useCaseLower)) {
      score += 10;
    }

    if (scenario.description.toLowerCase().includes(useCaseLower)) {
      score += 5;
    }

    for (const keyword of scenario.keywords) {
      const keywordLower = keyword.toLowerCase();
      if (useCaseLower.includes(keywordLower)) {
        score += 3;
      }
      for (const word of words) {
        if (keywordLower.includes(word) || word.includes(keywordLower)) {
          score += 1;
        }
      }
    }

    if (useCaseLower.includes('sync') && scenario.category.includes('sync')) {
      score += 5;
    }
    if (useCaseLower.includes('import') && scenario.category.includes('import')) {
      score += 5;
    }
    if (useCaseLower.includes('export') && scenario.category.includes('export')) {
      score += 5;
    }

    return { scenario, score };
  });

  return scoredScenarios
    .sort((a, b) => b.score - a.score)
    .slice(0, maxScenarios)
    .map((item) => item.scenario);
}

const CombinedAnalysisSchema = z.object({
  parsedUseCase: z.object({
    description: z.string(),
    entities: z.array(z.string()),
    actions: z.array(z.string()),
    sourceSystem: z.string().nullable().optional(),
    destinationSystem: z.string().nullable().optional(),
    integrationType: z.enum(['sync', 'trigger', 'action', 'bidirectional', 'import', 'export']).nullable().optional(),
  }),
  matchedScenario: z.object({
    scenarioId: z.string().nullable(),
    confidence: z.number().min(0).max(100),
    personalizedDescription: z.string(),
    customizedCodeSnippet: z.string(),
    reasoning: z.string(),
    fallbackReason: z.string().nullable().optional(),
  }),
});

const GeneratedScenarioSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  keywords: z.array(z.string()),
  supportedApps: z.array(z.string()),
  buildingBlocks: z.array(z.string()),
  codeExample: z.string(),
  howItWorks: z.array(z.string()).min(3).max(4),
});

export async function parseAndMatchScenario(
  useCase: string,
  companyContext: { name: string; description?: string; industry?: string },
  persona: 'technical' | 'executive' | 'business' = 'executive'
): Promise<{
  parsedUseCase: ParsedUseCase;
  scenario: ScenarioTemplate;
  confidence: number;
  personalizedDescription: string;
  codeSnippet: string;
  isGenerated?: boolean;
} | null> {
  if (!useCase || useCase.trim().length === 0) {
    return null;
  }

  try {
    const relevantScenarios = preFilterScenarios(useCase);
    const scenarioSummaries = relevantScenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      keywords: s.keywords.slice(0, 5),
    }));

    const personaPrompts = {
      technical: `You are a senior integration engineer helping developers implement production systems.`,
      executive: `You are an expert technical advisor for Product Managers, VP of Product, and CTOs evaluating integration solutions.`,
      business: `You are a business integration consultant helping Product Managers and Business Analysts design workflow solutions.`,
    };

    const systemPrompt = `${personaPrompts[persona]}

Your task is to:
1. Parse the use case to extract technical requirements from a product leader's perspective
2. Match it to the best scenario template that delivers business value
3. Generate production-ready code that technical teams can implement

Context: You're advising technical decision-makers who need to:
- Reduce time-to-market for integrations
- Minimize engineering resources required
- Ensure scalability and reliability
- Deliver measurable ROI to stakeholders

Step 1 - Parse and validate the use case:
First, determine if this is a valid integration use case. Valid integration use cases involve:
- Connecting two or more systems/applications
- Synchronizing or transferring data between platforms
- Automating workflows across different tools
- Setting up webhooks, APIs, or data pipelines
- Importing/exporting data between business systems

If the use case is NOT about integration (e.g., "make me a sandwich", "write code", "explain something"):
- Set all entities, actions, and systems to empty/null
- This will naturally result in confidence: 0 in Step 2

Otherwise, identify:
- Entities/Objects: Business-critical data types (contacts, orders, invoices, etc.)
- Actions/Operations: Operations that drive business outcomes (sync, import, export, create, update, etc.)
- Source System: Where data originates (critical for data governance)
- Destination System: Where data needs to flow (for operational efficiency)
- Integration Type: Pattern that best serves product goals (sync, bidirectional, trigger, import, export)

Step 2 - Match to scenario:
- Find the best matching scenario that Product/Engineering leaders would approve
- Score confidence (0-100) based on technical feasibility and business alignment
- Consider implementation complexity vs. value delivered
- If confidence < 30, set scenarioId to null

Step 3 - Generate production-ready code:
${
  persona === 'technical'
    ? '- Full implementation with detailed comments and error handling\n- Show all technical patterns: pagination, webhooks, retries, field mapping\n- Include advanced features like rate limiting and circuit breakers\n- Keep it comprehensive (~80-100 lines)'
    : persona === 'business'
      ? '- Simplified pseudo-code focusing on business logic flow\n- Emphasize data transformations and workflow steps\n- Show key integration points without implementation details\n- Keep it readable for non-developers (~40-60 lines)'
      : '- Code that a CTO would approve for production deployment\n- Show enterprise patterns: pagination, webhooks, field mapping\n- Include monitoring and error handling that VP Engineering requires\n- Keep it practical and maintainable (~60-80 lines)\n- Focus on scalability and reliability'
}

Available Scenarios (pre-filtered for relevance):
${JSON.stringify(scenarioSummaries, null, 2)}`;

    const userPrompt = `Company: ${companyContext.name}
${companyContext.description ? `Description: ${companyContext.description}` : ''}
${companyContext.industry ? `Industry: ${companyContext.industry}` : ''}

Use Case: ${useCase}

As a technical advisor to Product Managers and CTOs, analyze this use case, extract the requirements, match to a scenario, and generate production-ready Membrane SDK code that engineering teams can implement immediately.`;

    const result = await queryGpt(systemPrompt, userPrompt, CombinedAnalysisSchema);

    if (!result.matchedScenario.scenarioId || result.matchedScenario.confidence < 30) {
      return null; // Return null for invalid/non-integration requests
    }

    const matchedScenario = relevantScenarios.find((s) => s.id === result.matchedScenario.scenarioId);

    if (!matchedScenario) {
      return null; // Return null if no matching scenario found
    }

    return {
      parsedUseCase: result.parsedUseCase,
      scenario: { ...matchedScenario, confidence: result.matchedScenario.confidence },
      confidence: result.matchedScenario.confidence,
      personalizedDescription: result.matchedScenario.personalizedDescription,
      codeSnippet: result.matchedScenario.customizedCodeSnippet,
      isGenerated: false,
    };
  } catch (error) {
    console.error('Error in parseAndMatchScenario:', error);
    return null;
  }
}
