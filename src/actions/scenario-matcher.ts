'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import { scenarioTemplates } from '@/lib/scenario-templates';
import { ParsedUseCase, ScenarioTemplate, BuildingBlock } from '@/types';

const MatchedScenarioSchema = z.object({
  scenarioId: z.string().nullable(),
  confidence: z.number().min(0).max(100),
  personalizedDescription: z.string(),
  customizedCodeSnippet: z.string(),
  reasoning: z.string(),
  suggestedApps: z.array(z.string()),
  fallbackReason: z.string().optional(),
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

When personalizing:
- Replace generic terms with company-specific names
- Adjust the code example to reflect their specific use case
- Keep the core Membrane SDK patterns intact
- Focus on their mentioned systems and entities`;

    const userPrompt = `Company: ${companyContext?.name || 'Your Company'}
${companyContext?.description ? `Description: ${companyContext.description}` : ''}
${companyContext?.industry ? `Industry: ${companyContext.industry}` : ''}

Use Case: ${parsedUseCase.description}
Entities: ${parsedUseCase.entities.join(', ') || 'Not specified'}
Actions: ${parsedUseCase.actions.join(', ') || 'Not specified'}
${parsedUseCase.sourceSystem ? `Source System: ${parsedUseCase.sourceSystem}` : ''}
${parsedUseCase.destinationSystem ? `Destination System: ${parsedUseCase.destinationSystem}` : ''}
${parsedUseCase.integrationType ? `Integration Type: ${parsedUseCase.integrationType}` : ''}

Available Scenarios:
${JSON.stringify(scenarioSummaries, null, 2)}

Select the best matching scenario and customize it for this company and use case.`;

    const result = await queryGpt(systemPrompt, userPrompt, MatchedScenarioSchema, 'gpt-4o-mini');

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
3. Select appropriate building blocks
4. Provide working Membrane SDK code example
5. Include 3-4 clear "how it works" steps

Focus on making it specific to their use case while showcasing Membrane's capabilities.
Use actual application names they mentioned or suggest relevant ones.`;

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

    const generatedScenario = await queryGpt(systemPrompt, userPrompt, GeneratedScenarioSchema, 'gpt-4o-mini');

    const categoryMap: Record<string, ScenarioTemplate['category']> = {
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
      workflow: 'workflow-automation',
      webhook: 'webhook-events',
      event: 'webhook-events',
      etl: 'data-transformation',
      transform: 'data-transformation',
    };

    const genCategoryLower = generatedScenario.category.toLowerCase();
    let mappedCategory: ScenarioTemplate['category'] = 'workflow-automation';

    for (const [key, value] of Object.entries(categoryMap)) {
      if (genCategoryLower.includes(key)) {
        mappedCategory = value;
        break;
      }
    }

    const blockMap: Record<string, BuildingBlock> = {
      actions: 'actions',
      events: 'events',
      flows: 'flows',
      datacollections: 'data-collections',
      unifieddatamodels: 'unified-data-models',
      fieldmappings: 'field-mappings',
    };

    const filteredBlocks: BuildingBlock[] = [];
    for (const block of generatedScenario.buildingBlocks) {
      const normalized = block.toLowerCase().replace(/[_\s-]/g, '');
      if (blockMap[normalized]) {
        filteredBlocks.push(blockMap[normalized]);
      }
    }

    if (filteredBlocks.length === 0) {
      filteredBlocks.push('actions');
    }

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

// Custom integration for ${companyContext?.name || 'your company'}
const integration = membrane.integration({
  name: 'Custom Integration',
  description: '${parsedUseCase.description}',
});

// Connect to your systems
integration.connect({
  source: '${parsedUseCase.sourceSystem || 'source_system'}',
  destination: '${parsedUseCase.destinationSystem || 'destination_system'}',
});

// Process your data
integration.on('data', async (data) => {
  // Custom logic here
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
