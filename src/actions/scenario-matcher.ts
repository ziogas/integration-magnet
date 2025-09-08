'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import { scenarioTemplates } from '@/lib/scenario-templates';
import type { ScenarioTemplate, ParsedUseCase } from '@/types';

function preFilterScenarios(useCase: string, maxScenarios = 30): typeof scenarioTemplates {
  const useCaseLower = useCase.toLowerCase();
  const words = new Set(useCaseLower.split(/\s+/));

  const scoredScenarios = scenarioTemplates.map((scenario) => {
    let score = 0;
    const scenarioText = `${scenario.name} ${scenario.description}`.toLowerCase();

    // Direct match gets highest score
    if (scenarioText.includes(useCaseLower)) {
      score += 10;
    }

    // Keyword matches
    for (const keyword of scenario.keywords) {
      if (useCaseLower.includes(keyword.toLowerCase())) {
        score += 3;
      }
    }

    // Word overlap
    for (const word of words) {
      if (scenarioText.includes(word)) {
        score += 1;
      }
    }

    return { scenario, score };
  });

  return scoredScenarios
    .sort((a, b) => b.score - a.score)
    .slice(0, maxScenarios)
    .map((item) => item.scenario);
}

const AnalysisSchema = z.object({
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
  }),
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

    const personaContext = {
      technical: 'a senior integration engineer helping developers implement production systems',
      business:
        'a business integration consultant helping Product Managers and Business Analysts design workflow solutions',
      executive:
        'an expert technical advisor for Product Managers, VP of Product, and CTOs evaluating integration solutions',
    };

    const codeGuidelines = {
      technical: `Full implementation with detailed comments and error handling
- Show all technical patterns: pagination, webhooks, retries, field mapping
- Include advanced features like rate limiting and circuit breakers
- Keep it comprehensive (~80-100 lines)`,
      business: `Simplified pseudo-code focusing on business logic flow
- Emphasize data transformations and workflow steps
- Show key integration points without implementation details
- Keep it readable for non-developers (~40-60 lines)`,
      executive: `Code that a CTO would approve for production deployment
- Show enterprise patterns: pagination, webhooks, field mapping
- Include monitoring and error handling that VP Engineering requires
- Keep it practical and maintainable (~60-80 lines)
- Focus on scalability and reliability`,
    };

    const systemPrompt = `You are ${personaContext[persona]}.

Your task is to:
1. Parse the use case to extract technical requirements
2. Match it to the best scenario template (confidence 0-100)
3. Generate production-ready code that ${persona === 'technical' ? 'engineering teams' : persona === 'business' ? 'business teams can understand' : 'technical leaders would approve'}

Step 1 - Parse the use case:
Determine if this is a valid integration use case (connecting systems, syncing data, automating workflows).
If not valid (e.g., "make me a sandwich"), set confidence to 0.
Otherwise identify: entities, actions, source/destination systems, integration type.

Step 2 - Match to scenario:
Find the best matching scenario based on technical feasibility and business alignment.
If confidence < 30, set scenarioId to null.

Step 3 - Generate code:
${codeGuidelines[persona]}

Available Scenarios:
${JSON.stringify(scenarioSummaries, null, 2)}`;

    const userPrompt = `Company: ${companyContext.name}
${companyContext.description ? `Description: ${companyContext.description}` : ''}
${companyContext.industry ? `Industry: ${companyContext.industry}` : ''}

Use Case: ${useCase}`;

    const result = await queryGpt(systemPrompt, userPrompt, AnalysisSchema);

    if (!result.matchedScenario.scenarioId || result.matchedScenario.confidence < 30) {
      return null;
    }

    const matchedScenario = relevantScenarios.find((s) => s.id === result.matchedScenario.scenarioId);
    if (!matchedScenario) {
      return null;
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
