'use server';

import { parseUseCase } from './use-case-parser';
import { matchScenario } from './scenario-matcher';
import type { ScenarioGenerationResult, CompanyContext } from '@/types';

export async function generateScenario(
  companyContext: CompanyContext,
  useCase: string
): Promise<{ success: boolean; data?: ScenarioGenerationResult; error?: string }> {
  try {
    const parsedUseCase = await parseUseCase(useCase, {
      name: companyContext.name,
      description: companyContext.description,
    });

    const matchResult = await matchScenario(parsedUseCase, {
      name: companyContext.name,
      description: companyContext.description,
    });

    if (!matchResult) {
      return {
        success: false,
        error: 'Could not match your use case to a scenario. Please try with more details.',
      };
    }

    const { scenario, confidence, personalizedDescription, codeSnippet } = matchResult;

    const applicationLogos = scenario.supportedApps
      .slice(0, 8)
      .map(
        (app) =>
          `https://logo.dev/${app.toLowerCase().replace(/\s+/g, '')}.com?token=${process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY}`
      );

    const result: ScenarioGenerationResult = {
      companyContext,
      parsedUseCase,
      matchedScenario: scenario,
      personalizedDescription,
      codeSnippet,
      jsonSpec: scenario.jsonSpec || {},
      applicationLogos,
      confidence,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error generating scenario:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate scenario',
    };
  }
}
