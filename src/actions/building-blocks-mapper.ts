'use server';

import type { BuildingBlock, ScenarioTemplate } from '@/types';

export type BuildingBlockDetail = {
  id: BuildingBlock;
  name: string;
  description: string;
  icon: string;
  usageExample: string;
  isActive: boolean;
  color: string;
};

const buildingBlockDefinitions: Record<BuildingBlock, Omit<BuildingBlockDetail, 'id' | 'isActive'>> = {
  actions: {
    name: 'Actions',
    description: 'Execute API requests and queries to external applications',
    icon: '⚡',
    usageExample: 'membrane.actions.create("send-email", data)',
    color: 'purple',
  },
  events: {
    name: 'Events',
    description: 'Listen for and respond to changes in external systems',
    icon: '📡',
    usageExample: 'membrane.events.on("customer.created", handler)',
    color: 'blue',
  },
  flows: {
    name: 'Flows',
    description: 'Orchestrate multi-step integrations with branching logic',
    icon: '🔄',
    usageExample: 'membrane.flows.create({ steps: [...] })',
    color: 'green',
  },
  'data-collections': {
    name: 'Data Collections',
    description: 'Store, query, and manage integrated data',
    icon: '💾',
    usageExample: 'membrane.data.collection("customers").find()',
    color: 'orange',
  },
  'unified-data-models': {
    name: 'Unified Data Models',
    description: 'Consistent data structures across all integrations',
    icon: '🎯',
    usageExample: 'membrane.models.customer.normalize(data)',
    color: 'indigo',
  },
  'field-mappings': {
    name: 'Field Mappings',
    description: 'Transform and map data between different schemas',
    icon: '🔀',
    usageExample: 'membrane.mappings.transform(source, target)',
    color: 'pink',
  },
};

export function mapBuildingBlocks(scenario: ScenarioTemplate): BuildingBlockDetail[] {
  const allBlocks: BuildingBlock[] = [
    'actions',
    'events',
    'flows',
    'data-collections',
    'unified-data-models',
    'field-mappings',
  ];

  return allBlocks.map((blockId) => {
    const definition = buildingBlockDefinitions[blockId];
    const isActive = scenario.buildingBlocks.includes(blockId);

    return {
      id: blockId,
      ...definition,
      isActive,
    };
  });
}

export function getBuildingBlocksDescription(blocks: BuildingBlock[]): string {
  if (blocks.length === 0) return 'This integration uses core Membrane functionality.';

  const descriptions = blocks.map((block) => {
    const def = buildingBlockDefinitions[block];
    return `**${def.name}**: ${def.description}`;
  });

  return descriptions.join('\n');
}

export function estimateComplexity(blocks: BuildingBlock[]): {
  level: 'simple' | 'moderate' | 'complex';
  score: number;
  description: string;
} {
  const score = blocks.length;

  if (score <= 2) {
    return {
      level: 'simple',
      score,
      description: 'Straightforward integration with basic data synchronization',
    };
  } else if (score <= 4) {
    return {
      level: 'moderate',
      score,
      description: 'Multi-component integration with data transformation and workflows',
    };
  } else {
    return {
      level: 'complex',
      score,
      description: 'Advanced integration with full orchestration and data management',
    };
  }
}

export function generateIntegrationFlow(
  blocks: BuildingBlock[],
  sourceSystem?: string,
  destinationSystem?: string
): string[] {
  const flow: string[] = [];

  if (sourceSystem) {
    flow.push(`Connect to ${sourceSystem}`);
  } else {
    flow.push('Connect to source system');
  }

  if (blocks.includes('events')) {
    flow.push('Listen for real-time events');
  }

  if (blocks.includes('data-collections')) {
    flow.push('Query and collect data');
  }

  if (blocks.includes('field-mappings')) {
    flow.push('Transform data to target schema');
  }

  if (blocks.includes('unified-data-models')) {
    flow.push('Normalize to unified model');
  }

  if (blocks.includes('flows')) {
    flow.push('Process through workflow logic');
  }

  if (blocks.includes('actions')) {
    flow.push('Execute target system actions');
  }

  if (destinationSystem) {
    flow.push(`Update ${destinationSystem}`);
  } else if (blocks.includes('actions')) {
    flow.push('Update destination system');
  }

  return flow;
}
