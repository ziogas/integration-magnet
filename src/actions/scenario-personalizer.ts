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
});

type PersonalizedScenario = z.infer<typeof PersonalizedScenarioSchema>;

export async function personalizeScenario(
  scenario: ScenarioTemplate,
  companyContext: CompanyContext,
  parsedUseCase: ParsedUseCase
): Promise<PersonalizedScenario> {
  try {
    const systemPrompt = `You are an expert at personalizing integration scenarios for specific companies.

Your task is to:
1. Create a compelling, personalized title and description
2. Explain the specific business value for this company
3. Provide clear implementation steps tailored to their use case
4. Highlight key benefits specific to their industry/needs
5. Estimate realistic time to value
6. Suggest actionable next steps

Make it feel custom-built for their specific situation.
Use their company name, industry context, and specific systems mentioned.
Be concrete and specific, not generic.`;

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

Personalize this scenario specifically for ${companyContext.name} and their use case.`;

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

  const implementationSteps = [
    `Connect ${systems[0] || 'your primary system'} to Membrane's unified API`,
    `Configure data mappings for ${parsedUseCase.entities.slice(0, 3).join(', ') || 'your key entities'}`,
    `Set up ${parsedUseCase.actions.slice(0, 2).join(' and ') || 'automation rules'} workflows`,
    `Test the integration with sample data from ${companyName}'s systems`,
    scenario.buildingBlocks.includes('events')
      ? 'Enable real-time event monitoring and alerts'
      : 'Deploy to production with monitoring enabled',
  ].slice(0, 4);

  const keyBenefits = [
    `Eliminate data silos between ${systems.slice(0, 2).join(' and ') || 'systems'}`,
    `Reduce integration development time from months to days`,
    `Enable real-time ${parsedUseCase.entities[0] || 'data'} synchronization`,
    `Scale to handle ${companyName}'s growth without rebuilding`,
  ].slice(0, 4);

  const estimatedTimeToValue =
    scenario.buildingBlocks.length > 3 ? '2-3 weeks for full implementation' : '1-2 weeks for initial deployment';

  const suggestedNextSteps = [
    `Book a demo to see this scenario in action for ${companyName}`,
    `Start a free trial with pre-configured ${scenario.category.replace('-', ' ')} templates`,
    `Connect with our integration experts for ${industry} best practices`,
  ];

  return {
    title,
    description,
    businessValue,
    implementationSteps,
    keyBenefits,
    estimatedTimeToValue,
    suggestedNextSteps,
  };
}
