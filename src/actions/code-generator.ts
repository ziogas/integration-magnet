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
1. Generate clean, working Membrane SDK code for the specific use case
2. Use the company's actual systems and entities
3. Include proper error handling and logging
4. Follow Membrane SDK best practices
5. Make the code immediately usable with minimal configuration

Code requirements:
- Use ES6 module syntax with proper imports
- Include helpful comments explaining key sections
- Use async/await for all asynchronous operations
- Include proper error handling with try/catch
- Use the actual company name and systems mentioned
- Keep it concise but complete (max 50-60 lines)`;

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
Adapt the template to use their actual systems and entities.`;

    const result = await queryGpt(systemPrompt, userPrompt, GeneratedCodeSchema, 'gpt-4o-mini');

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

  let membraneCode = scenario.codeExample
    .replace(/'Your Company'/g, `'${companyName}'`)
    .replace(/YourCompany/g, companyName.replace(/\s+/g, ''))
    .replace(/salesforce/gi, sourceSystem)
    .replace(/hubspot/gi, destSystem || sourceSystem)
    .replace(/companies/gi, primaryEntity)
    .replace(/company/gi, primaryEntity);

  const configSection = `// ${companyName} Integration Configuration
const config = {
  company: '${companyName}',
  domain: '${companyContext.domain}',
  source: '${sourceSystem}',
  destination: '${destSystem}',
  entities: [${entities.map((e) => `'${e}'`).join(', ')}],
};

`;

  if (!membraneCode.includes('const config')) {
    membraneCode = configSection + membraneCode;
  }

  const setupInstructions = [
    `Install Membrane SDK: npm install @membrane/sdk`,
    `Configure API credentials for ${sourceSystem}${destSystem !== sourceSystem ? ` and ${destSystem}` : ''}`,
    `Update the config object with your ${companyName} specific settings`,
    `Deploy using: membrane deploy --env production`,
  ];

  const requiredEnvVars = [
    'MEMBRANE_API_KEY',
    `${sourceSystem.toUpperCase()}_API_KEY`,
    `${sourceSystem.toUpperCase()}_API_SECRET`,
  ];

  if (destSystem !== sourceSystem) {
    requiredEnvVars.push(`${destSystem.toUpperCase()}_API_KEY`, `${destSystem.toUpperCase()}_API_SECRET`);
  }

  const dependencies = ['@membrane/sdk', `@membrane/connector-${sourceSystem}`];

  if (destSystem !== sourceSystem) {
    dependencies.push(`@membrane/connector-${destSystem}`);
  }

  return {
    membraneCode,
    setupInstructions,
    requiredEnvVars: [...new Set(requiredEnvVars)],
    dependencies: [...new Set(dependencies)],
  };
}

export async function generateJsonSpec(
  scenario: ScenarioTemplate,
  companyContext: CompanyContext,
  parsedUseCase: ParsedUseCase
): Promise<Record<string, unknown>> {
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
    configuration: {
      buildingBlocks: scenario.buildingBlocks,
      supportedApplications: scenario.supportedApps,
      dataFlow: {
        source: parsedUseCase.sourceSystem || 'multiple_sources',
        destination: parsedUseCase.destinationSystem || 'multiple_destinations',
        direction: parsedUseCase.integrationType === 'bidirectional' ? 'bidirectional' : 'unidirectional',
        syncFrequency: 'real-time',
      },
      fieldMappings: parsedUseCase.entities.map((entity) => ({
        sourceField: `source.${entity}`,
        destinationField: `destination.${entity}`,
        transformation: 'direct',
        required: true,
      })),
    },
    implementation: {
      estimatedHours: scenario.buildingBlocks.length * 8,
      complexity: scenario.buildingBlocks.length > 3 ? 'high' : 'medium',
      prerequisites: ['API credentials for connected systems', 'Membrane SDK license', 'Development environment setup'],
    },
    metadata: {
      createdAt: new Date().toISOString(),
      scenarioTemplateId: scenario.id,
      confidenceScore: scenario.confidence || 100,
    },
  };

  return spec;
}
