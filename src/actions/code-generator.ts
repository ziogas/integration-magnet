'use server';

import type { ScenarioTemplate, CompanyContext, ParsedUseCase } from '@/types';

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
