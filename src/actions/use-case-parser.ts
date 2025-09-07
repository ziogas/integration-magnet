'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import { ParsedUseCase } from '@/types';

const ParsedUseCaseSchema = z.object({
  description: z.string(),
  entities: z.array(z.string()),
  actions: z.array(z.string()),
  sourceSystem: z.string().nullable().optional(),
  destinationSystem: z.string().nullable().optional(),
  integrationType: z.enum(['sync', 'trigger', 'action', 'bidirectional', 'import', 'export']).nullable().optional(),
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
Extract key technical information from the use-case to understand the integration requirements.

Analyze and identify:
- Entities/Objects: The specific data types being integrated (contacts, orders, invoices, products, users, etc.)
- Actions/Operations: The operations to perform (sync, import, export, create, update, delete, transform, trigger)
- Source System: Where data originates from (CRM, ERP, database, API, etc.)
- Destination System: Where data needs to go (if different from source)
- Integration Type: The pattern needed (sync, bidirectional, trigger, import, export)

Be specific and technical in your extraction:
- Use singular form for entities (e.g., 'contact' not 'contacts')
- Identify all systems mentioned by name (Salesforce, HubSpot, etc.)
- Determine if real-time or batch processing is implied
- Detect if bidirectional sync is needed`;

    const userPrompt = `Company: ${companyContext?.name || 'Unknown'}
${companyContext?.description ? `Company Description: ${companyContext.description}` : ''}

Use-case description: ${useCase}

Extract the key integration requirements from this use-case.

Rules:
- For entities: extract the actual business objects mentioned (contact, order, invoice, etc.)
- For actions: use verbs that describe the integration (sync, import, export, create, update, delete)
- For systems: identify specific platforms or generic types (Salesforce, HubSpot, CRM, ERP, database)
- For integration type: determine the data flow pattern

If the use case mentions:
- "sync" or "keep in sync" or "synchronize" -> integrationType: 'sync' or 'bidirectional'
- "import" or "pull" or "fetch" -> integrationType: 'import'
- "export" or "push" or "send" -> integrationType: 'export'
- "when X happens" or "trigger" -> integrationType: 'trigger'
- "two-way" or "both directions" -> integrationType: 'bidirectional'`;

    const result = await queryGpt(systemPrompt, userPrompt, ParsedUseCaseSchema);

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
