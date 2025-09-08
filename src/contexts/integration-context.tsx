'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useUrlParams } from '@/hooks/use-url-params';
import type { CompanyContext, ScenarioGenerationResult, Persona } from '@/types';
import { EXAMPLE_PROMPTS } from '@/components/integration-generator/constants';
import { scrapeCompanyDetails } from '@/actions/company-scraper';
import { generateScenario } from '@/actions/generate-scenario';
import { trackEvent } from '@/lib/posthog';

type IntegrationState = {
  domain: string;
  domainError: string;
  useCase: string;
  persona: Persona;
  isLoading: boolean;
  showResults: boolean;
  companyContext: CompanyContext | null;
  scenarioResult: ScenarioGenerationResult | null;
  email: string;
  noMatch: boolean;
};

type IntegrationContextType = IntegrationState & {
  setDomain: (domain: string) => void;
  setDomainError: (error: string) => void;
  setUseCase: (useCase: string) => void;
  setPersona: (persona: Persona) => void;
  setEmail: (email: string) => void;
  handleFormSubmit: () => Promise<void>;
  resetState: () => void;
};

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

const initialState: IntegrationState = {
  domain: '',
  domainError: '',
  useCase: '',
  persona: 'executive',
  isLoading: false,
  showResults: false,
  companyContext: null,
  scenarioResult: null,
  email: '',
  noMatch: false,
};

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IntegrationState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const { updateUrlParams, getParam, clearParams } = useUrlParams();

  useEffect(() => {
    if (isInitialized) return;

    const domainParam = getParam('domain');
    const emailParam = getParam('email');
    const useCaseParam = getParam('usecase');
    const personaParam = getParam('persona') as Persona;

    if (domainParam) {
      const cleanDomain = domainParam.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      setState((prev) => ({ ...prev, domain: cleanDomain }));
    }

    if (emailParam) {
      if (!domainParam) {
        const emailDomain = emailParam.split('@')[1];
        if (emailDomain) {
          setState((prev) => ({ ...prev, email: emailParam, domain: emailDomain }));
        }
      } else {
        setState((prev) => ({ ...prev, email: emailParam }));
      }
    }

    if (useCaseParam) {
      const exampleIndex = parseInt(useCaseParam, 10);
      if (!isNaN(exampleIndex) && exampleIndex >= 1 && exampleIndex <= EXAMPLE_PROMPTS.length) {
        setState((prev) => ({ ...prev, useCase: EXAMPLE_PROMPTS[exampleIndex - 1] }));
      }
    }

    if (personaParam) {
      setState((prev) => ({ ...prev, persona: personaParam }));
    }

    setIsInitialized(true);
  }, [getParam, isInitialized]);

  const setDomain = useCallback(
    (domain: string) => {
      setState((prev) => ({ ...prev, domain }));
      updateUrlParams({ domain });
    },
    [updateUrlParams]
  );

  const setDomainError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, domainError: error }));
  }, []);

  const setUseCase = useCallback((useCase: string) => {
    setState((prev) => ({ ...prev, useCase: useCase }));
  }, []);

  const setPersona = useCallback((persona: Persona) => {
    setState((prev) => ({ ...prev, persona }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, email }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
    clearParams();
  }, [clearParams]);

  const handleFormSubmit = useCallback(async () => {
    if (!state.domain || !state.useCase || !state.persona) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const cleanDomain = state.domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    setState((prev) => ({
      ...prev,
      domain: cleanDomain,
      isLoading: true,
      showResults: false,
      companyContext: null,
      scenarioResult: null,
      noMatch: false,
    }));

    updateUrlParams({ domain: cleanDomain });

    trackEvent('form_submitted', {
      domain: cleanDomain,
      persona: state.persona,
      use_case: state.useCase,
    });

    try {
      const { data: companyContext, hasFullData, error: scrapeError } = await scrapeCompanyDetails(cleanDomain);

      if (scrapeError) {
        toast.error(scrapeError, {
          duration: 5000,
        });
        setState((prev) => ({
          ...prev,
          isLoading: false,
          showResults: false,
        }));
        trackEvent('integration_failed', {
          domain: cleanDomain,
          error_type: 'scraping_error',
        });
        return;
      }

      if (!hasFullData) {
        toast.warning('Using limited company information. Results may be less accurate.', {
          duration: 4000,
        });
      }

      const scenarioResult = await generateScenario(companyContext, state.useCase, state.persona);

      if (scenarioResult.noMatch) {
        setState((prev) => ({
          ...prev,
          companyContext,
          isLoading: false,
          showResults: true,
          noMatch: true,
        }));
        trackEvent('integration_failed', {
          domain: cleanDomain,
          error_type: 'no_match',
        });
        return;
      }

      if (!scenarioResult.success) {
        const errorMsg = scenarioResult.error || 'Failed to generate scenario';
        trackEvent('integration_failed', {
          domain: cleanDomain,
          error_type: 'generation_error',
        });
        throw new Error(errorMsg);
      }

      setState((prev) => ({
        ...prev,
        companyContext,
        scenarioResult: scenarioResult.data!,
        isLoading: false,
        showResults: true,
        noMatch: false,
      }));

      trackEvent('integration_generated', {
        domain: cleanDomain,
        persona: state.persona,
        scenario_name: scenarioResult.data!.matchedScenario.name,
        confidence_score: scenarioResult.data!.confidence,
      });

      toast.success('Integration scenario generated successfully!');
    } catch (error) {
      console.error('Error generating integration:', error);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        showResults: false,
      }));

      const errorMessage = error instanceof Error ? error.message : 'Failed to generate integration scenario';
      trackEvent('integration_failed', {
        domain: cleanDomain,
        error_type: 'unexpected_error',
      });
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  }, [state.domain, state.persona, state.useCase, updateUrlParams]);

  return (
    <IntegrationContext.Provider
      value={{
        ...state,
        setDomain,
        setDomainError,
        setUseCase,
        setPersona,
        setEmail,
        handleFormSubmit,
        resetState,
      }}
    >
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegration() {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
}
