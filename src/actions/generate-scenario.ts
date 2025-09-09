'use server';

import { getApplicationLogoUrl } from '@/lib/logo-api';
import type { ScenarioGenerationResult, CompanyContext } from '@/types';
import { parseAndMatchScenario } from './scenario-matcher';
import { generateJsonSpec } from './code-generator';

export async function generateScenario(
  companyContext: CompanyContext,
  useCase: string,
  persona: 'technical' | 'executive' | 'business' = 'executive'
): Promise<{ success: boolean; data?: ScenarioGenerationResult; error?: string; noMatch?: boolean }> {
  try {
    const matchResult = await parseAndMatchScenario(
      useCase,
      {
        name: companyContext.name,
        description: companyContext.description,
        industry: companyContext.industry,
      },
      persona
    );

    if (!matchResult) {
      return {
        success: false,
        noMatch: true,
        error: 'Could not match your use case to a scenario. Please try with more details.',
      };
    }

    const { parsedUseCase, scenario, confidence, personalizedDescription, codeSnippet } = matchResult;

    if (confidence < 30) {
      return {
        success: false,
        noMatch: true,
        error: 'No strong match found for your use case.',
      };
    }

    const [applicationLogos, jsonSpec] = await Promise.all([
      Promise.resolve(scenario.supportedApps.slice(0, 8).map((app) => getApplicationLogoUrl(app))),
      generateJsonSpec(scenario, companyContext, parsedUseCase),
    ]);

    const result: ScenarioGenerationResult = {
      companyContext,
      parsedUseCase,
      matchedScenario: scenario,
      personalizedDescription,
      codeSnippet,
      jsonSpec,
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
