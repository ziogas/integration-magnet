'use server';

import { z } from 'zod';
import { queryGpt } from '@/lib/gpt';
import type { ScenarioTemplate, CompanyContext, ParsedUseCase } from '@/types';

const PersonalizedScenarioSchema = z.object({
  title: z.string(),
  description: z.string(),
  businessValue: z.string(),
  implementationSteps: z.array(z.string()).min(3).max(5),
  keyBenefits: z.array(z.string()).min(3).max(4),
  estimatedTimeToValue: z.string(),
  suggestedNextSteps: z.array(z.string()).min(2).max(3),
  technicalHighlights: z.array(z.string()).min(2).max(3).optional(),
});

type PersonalizedScenario = z.infer<typeof PersonalizedScenarioSchema>;

export async function personalizeScenario(
  scenario: ScenarioTemplate,
  companyContext: CompanyContext,
  parsedUseCase: ParsedUseCase
): Promise<PersonalizedScenario> {
  try {
    const systemPrompt = `You are an expert at personalizing technical integration scenarios for specific companies.

Your task is to:
1. Create a compelling, personalized title and description
2. Explain the specific business value and ROI for this company
3. Provide technical implementation steps following this pattern:
   - Initial Sync: How to import/export existing data with pagination
   - Continuous Sync (External): How to receive real-time updates from external apps
   - Continuous Sync (Your App): How your app sends updates to external systems
   - Data Transformation: How field mapping and validation works
4. Highlight measurable benefits (time saved, error reduction, etc.)
5. Provide realistic time to value based on complexity
6. Suggest concrete next steps for implementation

Be technical and specific:
- Reference actual API patterns and sync mechanisms
- Include specific field mapping examples
- Mention webhook endpoints and event types
- Use their actual company name, systems, and entities
- Provide metrics and quantifiable improvements`;

    const userPrompt = `Company: ${companyContext.name}
${companyContext.description ? `Description: ${companyContext.description}` : ''}
${companyContext.industry ? `Industry: ${companyContext.industry}` : ''}
Domain: ${companyContext.domain}

Use Case: ${parsedUseCase.description}
Entities: ${parsedUseCase.entities.join(', ')}
Actions: ${parsedUseCase.actions.join(', ')}
${parsedUseCase.sourceSystem ? `Source System: ${parsedUseCase.sourceSystem}` : ''}
${parsedUseCase.destinationSystem ? `Destination System: ${parsedUseCase.destinationSystem}` : ''}

Scenario Template:
Name: ${scenario.name}
Description: ${scenario.description}
Category: ${scenario.category}
Supported Apps: ${scenario.supportedApps.slice(0, 10).join(', ')}
Building Blocks: ${scenario.buildingBlocks.join(', ')}

Personalize this scenario specifically for ${companyContext.name} and their use case.

Make the implementation steps technical and actionable:
- Step 1 should cover initial data sync with pagination details
- Step 2 should explain webhook/event subscription setup  
- Step 3 should detail field mapping and transformation
- Step 4 should cover monitoring and error handling

Ensure benefits are quantifiable (e.g., "reduce integration time by 90%", "eliminate 100% of manual data entry")`;

    const result = await queryGpt(systemPrompt, userPrompt, PersonalizedScenarioSchema);

    return result;
  } catch (error) {
    console.error('Error personalizing scenario:', error);
    return generateBasicPersonalization(scenario, companyContext, parsedUseCase);
  }
}

function generateBasicPersonalization(
  scenario: ScenarioTemplate,
  companyContext: CompanyContext,
  parsedUseCase: ParsedUseCase
): PersonalizedScenario {
  const companyName = companyContext.name || 'Your Company';
  const industry = companyContext.industry || 'your industry';

  const systems = [parsedUseCase.sourceSystem, parsedUseCase.destinationSystem, ...scenario.supportedApps.slice(0, 3)]
    .filter(Boolean)
    .slice(0, 4);

  const title = `${scenario.name} for ${companyName}`;

  const description = scenario.description
    .replace(/your (company|business|organization)/gi, companyName)
    .replace(/across multiple/gi, `across ${companyName}'s`)
    .replace(/all your/gi, `all ${companyName}'s`);

  const businessValue = `By implementing this ${scenario.category.replace('-', ' ')} solution, ${
    companyName
  } can streamline ${parsedUseCase.entities.join(', ')} management, reduce manual data entry by up to 80%, and ensure real-time synchronization across ${systems.join(
    ', '
  )}. This will significantly improve operational efficiency and data accuracy in ${industry}.`;

  const isBidirectional =
    parsedUseCase.integrationType === 'bidirectional' || scenario.category === 'bi-directional-sync';
  const hasEvents = scenario.buildingBlocks.includes('events');

  const implementationSteps = [
    `Initial Sync: Import existing ${parsedUseCase.entities[0] || 'data'} from ${systems[0] || 'source system'} using paginated API calls (100 records per batch) to Membrane's unified data model`,
    hasEvents
      ? `Continuous Sync (External): Subscribe to webhooks for real-time ${parsedUseCase.entities[0] || 'entity'} created/updated/deleted events from ${systems[0] || 'external system'}`
      : `Continuous Sync: Set up 5-minute polling intervals to detect changes in ${systems[0] || 'external system'}`,
    isBidirectional
      ? `Continuous Sync (Your App): Configure webhook endpoint at /webhook/${companyContext.domain?.replace(/\./g, '-') || 'your-domain'} to send updates from ${companyName} to external systems`
      : `Data Flow: Transform and push ${parsedUseCase.entities[0] || 'data'} updates to ${systems[1] || systems[0] || 'destination'}`,
    `Field Mapping: Configure automatic transformation between ${companyName}'s schema and ${systems.join('/')} field structures using Membrane's mapping engine`,
    `Monitoring: Enable error tracking, retry logic with exponential backoff, and real-time sync status dashboard`,
  ].slice(0, 4);

  const keyBenefits = [
    `Eliminate 100% of manual data entry between ${systems.slice(0, 2).join(' and ') || 'systems'}`,
    `Reduce integration development time by 90% (from months to days)`,
    hasEvents
      ? `Enable real-time ${parsedUseCase.entities[0] || 'data'} synchronization with <1 second latency`
      : `Synchronize ${parsedUseCase.entities[0] || 'data'} every 5 minutes across all systems`,
    `Handle ${companyName}'s scale with automatic pagination and retry mechanisms`,
    `Save 20+ developer hours per week on integration maintenance`,
  ].slice(0, 4);

  const complexity = scenario.buildingBlocks.length;
  const estimatedTimeToValue =
    complexity > 4
      ? '2-3 weeks for full production deployment with testing'
      : complexity > 2
        ? '1-2 weeks for implementation and testing'
        : '3-5 days for basic integration setup';

  const suggestedNextSteps = [
    `Book a technical demo to see the ${scenario.name} pattern implemented for ${companyName}`,
    `Start a 14-day free trial with pre-built connectors for ${systems[0] || 'your systems'}`,
    `Get API credentials and begin initial sync implementation within 24 hours`,
  ];

  const technicalHighlights = [
    `Automatic handling of API rate limits and pagination`,
    `Built-in error recovery with exponential backoff`,
    `Support for ${systems.length > 0 ? systems.join(', ') : 'multiple systems'} with unified API`,
  ];

  return {
    title,
    description,
    businessValue,
    implementationSteps,
    keyBenefits,
    estimatedTimeToValue,
    suggestedNextSteps,
    technicalHighlights,
  };
}
