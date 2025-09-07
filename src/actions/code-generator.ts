'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import type { ScenarioTemplate, CompanyContext, ParsedUseCase } from '@/types';

const GeneratedCodeSchema = z.object({
  membraneCode: z.string(),
  setupInstructions: z.array(z.string()),
  requiredEnvVars: z.array(z.string()),
  dependencies: z.array(z.string()),
});

type GeneratedCode = z.infer<typeof GeneratedCodeSchema>;

export async function generateMembraneCode(
  scenario: ScenarioTemplate,
  companyContext: CompanyContext,
  parsedUseCase: ParsedUseCase
): Promise<GeneratedCode> {
  try {
    const systemPrompt = `You are an expert Membrane SDK developer creating production-ready integration code.

Your task is to:
1. Generate production-ready Membrane SDK code demonstrating the integration pattern
2. Use the company's actual systems and entities
3. Include proper error handling, retries, and logging
4. Follow Membrane SDK best practices and patterns
5. Make the code immediately implementable

Code must demonstrate:
- Initial sync with pagination: membrane.sync.initial({ pageSize: 100, cursor })
- Webhook subscription for real-time events: membrane.webhooks.subscribe()
- Field mapping transformations: membrane.transform.map()
- Event handlers for created/updated/deleted operations
- Error handling with exponential backoff
- Bi-directional sync where applicable

Code structure:
- Configuration section with company-specific settings
- Initial sync implementation with pagination
- Continuous sync setup (webhooks/polling)
- Field mapping and transformation logic
- Event handlers for CRUD operations
- Error handling and monitoring

Keep code practical, ~60-80 lines, with clear sections`;

    const userPrompt = `Company: ${companyContext.name}
Domain: ${companyContext.domain}
${companyContext.industry ? `Industry: ${companyContext.industry}` : ''}

Use Case: ${parsedUseCase.description}
Entities: ${parsedUseCase.entities.join(', ')}
Actions: ${parsedUseCase.actions.join(', ')}
${parsedUseCase.sourceSystem ? `Source System: ${parsedUseCase.sourceSystem}` : ''}
${parsedUseCase.destinationSystem ? `Destination System: ${parsedUseCase.destinationSystem}` : ''}

Scenario: ${scenario.name}
Building Blocks: ${scenario.buildingBlocks.join(', ')}
Supported Apps: ${scenario.supportedApps.slice(0, 5).join(', ')}

Base Template Code:
${scenario.codeExample}

Generate Membrane SDK code specifically for ${companyContext.name}'s use case.
Adapt the template to use their actual systems (${parsedUseCase.sourceSystem || 'source'}, ${parsedUseCase.destinationSystem || 'destination'}) and entities.

Ensure the code shows:
1. Initial data sync with pagination
2. Real-time event subscription
3. Field mapping for their entities
4. Bi-directional sync if applicable`;

    const result = await queryGpt(systemPrompt, userPrompt, GeneratedCodeSchema);

    return result;
  } catch (error) {
    console.error('Error generating code:', error);
    return generateBasicCode(scenario, companyContext, parsedUseCase);
  }
}

function generateBasicCode(
  scenario: ScenarioTemplate,
  companyContext: CompanyContext,
  parsedUseCase: ParsedUseCase
): GeneratedCode {
  const companyName = companyContext.name || 'YourCompany';
  const sourceSystem = parsedUseCase.sourceSystem?.toLowerCase() || 'source_system';
  const destSystem = parsedUseCase.destinationSystem?.toLowerCase() || 'destination_system';
  const entities = parsedUseCase.entities.length > 0 ? parsedUseCase.entities : ['data'];
  const primaryEntity = entities[0];
  const isBidirectional =
    parsedUseCase.integrationType === 'bidirectional' || scenario.category === 'bi-directional-sync';

  const membraneCode = `const membrane = require('@membrane/sdk');

// ${companyName} Integration Configuration
const config = {
  company: '${companyName}',
  domain: '${companyContext.domain}',
  source: '${sourceSystem}',
  destination: '${destSystem}',
  entities: [${entities.map((e) => `'${e}'`).join(', ')}],
  syncMode: '${isBidirectional ? 'bidirectional' : 'unidirectional'}',
};

// Initialize Membrane with your API key
const integration = membrane.connect({
  apiKey: process.env.MEMBRANE_API_KEY,
  ...config
});

// Initial sync with pagination
async function performInitialSync() {
  let cursor = null;
  let hasMore = true;
  
  while (hasMore) {
    const { data, nextCursor } = await integration.${primaryEntity}.list({
      provider: config.source,
      pageSize: 100,
      cursor
    });
    
    for (const item of data) {
      await integration.${primaryEntity}.upsert({
        provider: config.destination,
        data: membrane.transform.map(item, '${sourceSystem}-to-${destSystem}')
      });
    }
    
    cursor = nextCursor;
    hasMore = !!nextCursor;
  }
}

// Set up continuous sync
integration.webhooks.subscribe({
  provider: config.source,
  events: ['${primaryEntity}.created', '${primaryEntity}.updated', '${primaryEntity}.deleted'],
  handler: async (event) => {
    const transformed = membrane.transform.map(event.data, '${sourceSystem}-to-${destSystem}');
    
    switch(event.type) {
      case 'created':
        await integration.${primaryEntity}.create({ provider: config.destination, data: transformed });
        break;
      case 'updated':
        await integration.${primaryEntity}.update({ provider: config.destination, id: event.id, data: transformed });
        break;
      case 'deleted':
        await integration.${primaryEntity}.delete({ provider: config.destination, id: event.id });
        break;
    }
  }
});

${
  isBidirectional
    ? `// Bi-directional sync from your app
integration.webhooks.receive('/webhook/${companyContext.domain.replace(/\./g, '-')}', async (event) => {
  const transformed = membrane.transform.map(event.data, '${destSystem}-to-${sourceSystem}');
  await integration.${primaryEntity}.sync({ provider: config.source, data: transformed });
});

`
    : ''
}// Start the integration
integration.start();`;

  return {
    membraneCode,
    setupInstructions: generateSetupInstructions(companyName, sourceSystem, destSystem, isBidirectional),
    requiredEnvVars: generateEnvVars(sourceSystem, destSystem),
    dependencies: generateDependencies(sourceSystem, destSystem),
  };
}

function generateSetupInstructions(
  companyName: string,
  sourceSystem: string,
  destSystem: string,
  isBidirectional: boolean
): string[] {
  const instructions = [
    `Install Membrane SDK: npm install @membrane/sdk`,
    `Configure API credentials for ${sourceSystem}${destSystem !== sourceSystem ? ` and ${destSystem}` : ''}`,
    `Set up field mappings for ${companyName}'s schema`,
    `Run initial sync: npm run sync:initial`,
  ];

  if (isBidirectional) {
    instructions.push(`Configure webhook endpoint in your application to send events to Membrane`);
  }

  instructions.push(`Deploy using: membrane deploy --env production`);

  return instructions;
}

function generateEnvVars(sourceSystem: string, destSystem: string): string[] {
  const envVars = [
    'MEMBRANE_API_KEY',
    `${sourceSystem.toUpperCase()}_API_KEY`,
    `${sourceSystem.toUpperCase()}_API_SECRET`,
  ];

  if (destSystem !== sourceSystem) {
    envVars.push(`${destSystem.toUpperCase()}_API_KEY`, `${destSystem.toUpperCase()}_API_SECRET`);
  }

  return [...new Set(envVars)];
}

function generateDependencies(sourceSystem: string, destSystem: string): string[] {
  const deps = ['@membrane/sdk', `@membrane/connector-${sourceSystem}`];

  if (destSystem !== sourceSystem) {
    deps.push(`@membrane/connector-${destSystem}`);
  }

  return [...new Set(deps)];
}

export async function generateJsonSpec(
  scenario: ScenarioTemplate,
  companyContext: CompanyContext,
  parsedUseCase: ParsedUseCase
): Promise<Record<string, unknown>> {
  const isBidirectional =
    parsedUseCase.integrationType === 'bidirectional' || scenario.category === 'bi-directional-sync';

  const spec = {
    version: '1.0.0',
    company: {
      name: companyContext.name,
      domain: companyContext.domain,
      industry: companyContext.industry || 'General',
    },
    integration: {
      id: scenario.id,
      name: scenario.name,
      category: scenario.category,
      confidence: scenario.confidence || 100,
      isGenerated: scenario.id.startsWith('custom-generated'),
    },
    useCase: {
      description: parsedUseCase.description,
      entities: parsedUseCase.entities,
      actions: parsedUseCase.actions,
      sourceSystem: parsedUseCase.sourceSystem || null,
      destinationSystem: parsedUseCase.destinationSystem || null,
      integrationType: parsedUseCase.integrationType || 'sync',
    },
    syncPattern: {
      initialSync: {
        method: 'paginated-import',
        pageSize: 100,
        estimatedRecords: 'varies',
      },
      continuousSync: {
        fromExternal: {
          method: scenario.buildingBlocks.includes('events') ? 'webhook' : 'polling',
          frequency: scenario.buildingBlocks.includes('events') ? 'real-time' : '5-minutes',
        },
        toExternal: isBidirectional
          ? {
              method: 'webhook-receive',
              endpoint: `/webhook/${companyContext.domain.replace(/\./g, '-')}`,
            }
          : null,
      },
    },
    configuration: {
      buildingBlocks: scenario.buildingBlocks,
      supportedApplications: scenario.supportedApps,
      dataFlow: {
        source: parsedUseCase.sourceSystem || 'multiple_sources',
        destination: parsedUseCase.destinationSystem || 'multiple_destinations',
        direction: isBidirectional ? 'bidirectional' : 'unidirectional',
        syncFrequency: 'real-time',
      },
      fieldMappings: parsedUseCase.entities.map((entity) => ({
        sourceField: `${parsedUseCase.sourceSystem || 'source'}.${entity}`,
        destinationField: `${parsedUseCase.destinationSystem || 'destination'}.${entity}`,
        transformation: 'membrane.transform.map',
        validation: true,
        required: true,
      })),
    },
    implementation: {
      estimatedHours: scenario.buildingBlocks.length * 8,
      complexity: scenario.buildingBlocks.length > 3 ? 'high' : 'medium',
      prerequisites: [
        'API credentials for connected systems',
        'Membrane SDK license',
        'Field mapping configuration',
        isBidirectional ? 'Webhook endpoint configuration' : null,
      ].filter(Boolean),
    },
    metadata: {
      createdAt: new Date().toISOString(),
      scenarioTemplateId: scenario.id,
      confidenceScore: scenario.confidence || 100,
      generatedBy: 'membrane-lead-magnet',
    },
  };

  return spec;
}
