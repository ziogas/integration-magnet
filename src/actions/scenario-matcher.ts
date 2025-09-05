'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import { scenarioTemplates } from '@/lib/scenario-templates';
import { ParsedUseCase, ScenarioTemplate } from '@/types';

const MatchedScenarioSchema = z.object({
  scenarioId: z.string(),
  confidence: z.number().min(0).max(100),
  personalizedDescription: z.string(),
  customizedCodeSnippet: z.string(),
});

export async function matchScenario(
  parsedUseCase: ParsedUseCase,
  companyContext?: { name: string; description?: string }
): Promise<{
  scenario: ScenarioTemplate;
  confidence: number;
  personalizedDescription: string;
  codeSnippet: string;
} | null> {
  if (!parsedUseCase.description) {
    return null;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, using first template as fallback');
    const fallbackScenario = scenarioTemplates[0];
    return {
      scenario: fallbackScenario,
      confidence: 50,
      personalizedDescription: fallbackScenario.description,
      codeSnippet: fallbackScenario.codeExample,
    };
  }

  try {
    const scenarioSummaries = scenarioTemplates.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      keywords: s.keywords.join(', '),
    }));

    const systemPrompt = `You are an integration expert matching use cases to scenario templates.
Given a parsed use case and a list of available scenarios, select the best matching scenario.

Consider:
- Keywords and entities mentioned in the use case
- Integration type and pattern needed
- Systems and applications involved

Return the scenario ID that best matches, with a confidence score (0-100).
Also create a personalized description and code snippet for the company.`;

    const userPrompt = `Company: ${companyContext?.name || 'Your Company'}
Use Case: ${parsedUseCase.description}
Entities: ${parsedUseCase.entities.join(', ')}
Actions: ${parsedUseCase.actions.join(', ')}
${parsedUseCase.sourceSystem ? `Source System: ${parsedUseCase.sourceSystem}` : ''}
${parsedUseCase.destinationSystem ? `Destination System: ${parsedUseCase.destinationSystem}` : ''}

Available Scenarios:
${JSON.stringify(scenarioSummaries, null, 2)}

Select the best matching scenario and customize it for this company.`;

    const result = await queryGpt(systemPrompt, userPrompt, MatchedScenarioSchema, 'gpt-4o-mini');

    const matchedScenario = scenarioTemplates.find((s) => s.id === result.scenarioId);

    if (!matchedScenario) {
      console.warn('No matching scenario found, using fallback');
      const fallbackScenario = scenarioTemplates[0];
      return {
        scenario: fallbackScenario,
        confidence: 50,
        personalizedDescription: fallbackScenario.description,
        codeSnippet: fallbackScenario.codeExample,
      };
    }

    return {
      scenario: matchedScenario,
      confidence: result.confidence,
      personalizedDescription: result.personalizedDescription,
      codeSnippet: result.customizedCodeSnippet,
    };
  } catch (error) {
    console.error('Error matching scenario:', error);

    const fallbackScenario = scenarioTemplates[0];
    return {
      scenario: fallbackScenario,
      confidence: 50,
      personalizedDescription: fallbackScenario.description,
      codeSnippet: fallbackScenario.codeExample,
    };
  }
}
