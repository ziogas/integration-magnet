'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import { ParsedUseCase } from '@/types';

const ParsedUseCaseSchema = z.object({
  description: z.string(),
  entities: z.array(z.string()),
  actions: z.array(z.string()),
  sourceSystem: z.string().optional(),
  destinationSystem: z.string().optional(),
  integrationType: z.enum(['sync', 'trigger', 'action', 'bidirectional', 'import', 'export']).optional(),
});

export async function parseUseCase(
  useCase: string,
  companyContext?: { name: string; description?: string }
): Promise<ParsedUseCase> {
  if (!useCase || useCase.trim().length === 0) {
    return {
      description: '',
      entities: [],
      actions: [],
    };
  }

  try {
    const systemPrompt = `You are an integration expert analyzing use-case descriptions.
Extract key information from the use-case to understand what integration is needed.

Focus on:
- Key entities/objects being integrated (e.g., contacts, orders, products)
- Main actions/operations (e.g., sync, import, export, trigger, update)
- Source and destination systems if mentioned
- Type of integration pattern needed`;

    const userPrompt = `Company: ${companyContext?.name || 'Unknown'}
${companyContext?.description ? `Company Description: ${companyContext.description}` : ''}

Use-case description: ${useCase}

Extract the key integration requirements from this use-case.`;

    const result = await queryGpt(systemPrompt, userPrompt, ParsedUseCaseSchema, 'gpt-4o-mini');

    return result;
  } catch (error) {
    console.error('Error parsing use-case:', error);

    return {
      description: useCase,
      entities: [],
      actions: [],
    };
  }
}
