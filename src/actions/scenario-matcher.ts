'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import { scenarioTemplates } from '@/lib/scenario-templates';
import { ParsedUseCase, ScenarioTemplate, BuildingBlock, ScenarioCategory } from '@/types';

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

const MatchedScenarioSchema = z.object({
  scenarioId: z.string().nullable(),
  confidence: z.number().min(0).max(100),
  personalizedDescription: z.string(),
  customizedCodeSnippet: z.string(),
  reasoning: z.string(),
  suggestedApps: z.array(z.string()),
  fallbackReason: z.string().nullable().optional(),
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
  initialSyncSteps: z.array(z.string()).optional(),
  continuousSyncDetails: z
    .object({
      fromExternal: z.string().optional(),
      toExternal: z.string().optional(),
    })
    .optional(),
});

export async function matchScenario(
  parsedUseCase: ParsedUseCase,
  companyContext?: { name: string; description?: string; industry?: string }
): Promise<{
  scenario: ScenarioTemplate;
  confidence: number;
  personalizedDescription: string;
  codeSnippet: string;
  isGenerated?: boolean;
} | null> {
  if (!parsedUseCase.description) {
    return null;
  }

  try {
    const scenarioSummaries = scenarioTemplates.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      keywords: s.keywords,
      supportedApps: s.supportedApps.slice(0, 8),
    }));

    const systemPrompt = `You are an AI expert in integration patterns and Membrane's scenario templates.

Your task is to:
1. Analyze the user's integration use case and company context
2. Match it to the most appropriate scenario template from the provided list
3. Provide a confidence score (0-100) for the match
4. Personalize the description and code snippet for the company

Confidence scoring guidelines:
- 90-100: Perfect match with all requirements aligned
- 70-89: Strong match with most requirements met
- 50-69: Partial match with some requirements met
- 30-49: Weak match, may need customization
- 0-29: No good match, would require custom solution

If confidence is below 30, return null for scenarioId and explain why in fallbackReason.

When personalizing the code:
- Show initial sync with pagination: membrane.sync.initial({ pageSize: 100 })
- Include webhook subscription setup for real-time events
- Demonstrate field mapping transformations
- Show event handlers for created/updated/deleted operations
- Use actual company systems and entities mentioned
- Include error handling and retry logic
- Keep code practical and implementation-ready

Available Membrane Scenario Templates:
${JSON.stringify(scenarioSummaries, null, 2)}`;

    const userPrompt = `Company: ${companyContext?.name || 'Your Company'}
${companyContext?.description ? `Description: ${companyContext.description}` : ''}
${companyContext?.industry ? `Industry: ${companyContext.industry}` : ''}

Use Case: ${parsedUseCase.description}
Entities: ${parsedUseCase.entities.join(', ') || 'Not specified'}
Actions: ${parsedUseCase.actions.join(', ') || 'Not specified'}
${parsedUseCase.sourceSystem ? `Source System: ${parsedUseCase.sourceSystem}` : ''}
${parsedUseCase.destinationSystem ? `Destination System: ${parsedUseCase.destinationSystem}` : ''}
${parsedUseCase.integrationType ? `Integration Type: ${parsedUseCase.integrationType}` : ''}

Select the best matching scenario from the available templates and customize it for this company and use case.`;

    const result = await queryGpt(systemPrompt, userPrompt, MatchedScenarioSchema);

    if (!result.scenarioId || result.confidence < 30) {
      return await generateCustomScenario(parsedUseCase, companyContext);
    }

    const matchedScenario = scenarioTemplates.find((s) => s.id === result.scenarioId);

    if (!matchedScenario) {
      return await generateCustomScenario(parsedUseCase, companyContext);
    }

    const scenarioWithConfidence = { ...matchedScenario, confidence: result.confidence };

    return {
      scenario: scenarioWithConfidence,
      confidence: result.confidence,
      personalizedDescription: result.personalizedDescription,
      codeSnippet: result.customizedCodeSnippet,
      isGenerated: false,
    };
  } catch (error) {
    console.error('Error matching scenario:', error);

    return await generateCustomScenario(parsedUseCase, companyContext);
  }
}

async function generateCustomScenario(
  parsedUseCase: ParsedUseCase,
  companyContext?: { name: string; description?: string; industry?: string }
): Promise<{
  scenario: ScenarioTemplate;
  confidence: number;
  personalizedDescription: string;
  codeSnippet: string;
  isGenerated: boolean;
}> {
  try {
    const systemPrompt = `You are an AI expert in creating custom integration scenarios for Membrane.

Create a completely custom scenario based on the user's specific needs.
The scenario should:
1. Have a clear, descriptive name
2. Include relevant keywords and supported applications
3. Select appropriate building blocks from: actions, events, flows, data-collections, unified-data-models, field-mappings
4. Provide production-ready Membrane SDK code example
5. Include 3-4 technical "how it works" steps following this pattern:
   - Initial Sync: How data is imported/exported initially
   - Continuous Sync (External): How updates from external apps are received
   - Continuous Sync (Your App): How your app sends updates
   - Data Transformation: How field mapping and validation works

Code should demonstrate:
- Pagination for initial data sync
- Webhook/event subscription setup
- Field mapping and transformation
- Error handling and retries
- Real-time vs batch processing options`;

    const userPrompt = `Company: ${companyContext?.name || 'Your Company'}
${companyContext?.description ? `Description: ${companyContext.description}` : ''}
${companyContext?.industry ? `Industry: ${companyContext.industry}` : ''}

Use Case: ${parsedUseCase.description}
Entities: ${parsedUseCase.entities.join(', ') || 'Not specified'}
Actions: ${parsedUseCase.actions.join(', ') || 'Not specified'}
${parsedUseCase.sourceSystem ? `Source System: ${parsedUseCase.sourceSystem}` : ''}
${parsedUseCase.destinationSystem ? `Destination System: ${parsedUseCase.destinationSystem}` : ''}
${parsedUseCase.integrationType ? `Integration Type: ${parsedUseCase.integrationType}` : ''}

Generate a custom Membrane integration scenario for this specific use case.`;

    const generatedScenario = await queryGpt(systemPrompt, userPrompt, GeneratedScenarioSchema);

    const mappedCategory = mapToValidCategory(generatedScenario.category);

    const filteredBlocks = validateAndMapBuildingBlocks(generatedScenario.buildingBlocks);

    const customScenario: ScenarioTemplate = {
      id: `custom-generated-${Date.now()}`,
      name: generatedScenario.name,
      description: generatedScenario.description,
      category: mappedCategory,
      keywords: generatedScenario.keywords,
      supportedApps: generatedScenario.supportedApps,
      buildingBlocks: filteredBlocks,
      codeExample: generatedScenario.codeExample,
      howItWorks: generatedScenario.howItWorks,
      confidence: 85,
    };

    return {
      scenario: customScenario,
      confidence: 85,
      personalizedDescription: generatedScenario.description,
      codeSnippet: generatedScenario.codeExample,
      isGenerated: true,
    };
  } catch (error) {
    console.error('Error generating custom scenario:', error);

    const fallbackScenario: ScenarioTemplate = {
      id: `custom-fallback-${Date.now()}`,
      name: 'Custom Integration Solution',
      description: `Build a custom integration for ${companyContext?.name || 'your organization'} to connect your systems and automate workflows.`,
      category: 'workflow-automation',
      keywords: parsedUseCase.entities.concat(parsedUseCase.actions),
      supportedApps: [parsedUseCase.sourceSystem, parsedUseCase.destinationSystem].filter(Boolean) as string[],
      buildingBlocks: ['actions', 'flows'],
      codeExample: `const membrane = require('@membrane/sdk');

const integration = membrane.integration({
  name: 'Custom Integration',
  description: '${parsedUseCase.description}',
});

integration.connect({
  source: '${parsedUseCase.sourceSystem || 'source_system'}',
  destination: '${parsedUseCase.destinationSystem || 'destination_system'}',
});

integration.on('data', async (data) => {
  const processed = await processData(data);
  await integration.send(processed);
});

integration.start();`,
      howItWorks: [
        'Connect to your data sources',
        'Process and transform data',
        'Sync to destination systems',
        'Monitor and manage integration',
      ],
      confidence: 50,
    };

    return {
      scenario: fallbackScenario,
      confidence: 50,
      personalizedDescription: fallbackScenario.description,
      codeSnippet: fallbackScenario.codeExample,
      isGenerated: true,
    };
  }
}
