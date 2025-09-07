'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useUrlParams } from '@/hooks/use-url-params';
import { toast } from 'sonner';
import type { CompanyContext, ScenarioGenerationResult } from '@/types';
import { EXAMPLE_PROMPTS } from '@/components/integration-generator/constants';
import { scrapeCompanyDetails } from '@/actions/company-scraper';
import { generateScenario } from '@/actions/generate-scenario';

type IntegrationState = {
  domain: string;
  domainError: string;
  useCase: string;
  isLoading: boolean;
  showResults: boolean;
  companyContext: CompanyContext | null;
  scenarioResult: ScenarioGenerationResult | null;
};

type IntegrationContextType = IntegrationState & {
  setDomain: (domain: string) => void;
  setDomainError: (error: string) => void;
  setUseCase: (useCase: string) => void;
  generateIntegration: () => Promise<void>;
  handleFormSubmit: (domain: string, useCase: string) => Promise<void>;
  resetState: () => void;
};

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

const initialState: IntegrationState = {
  domain: '',
  domainError: '',
  useCase: '',
  isLoading: false,
  showResults: false,
  companyContext: null,
  scenarioResult: null,
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

    if (domainParam) {
      const cleanDomain = domainParam.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      setState((prev) => ({ ...prev, domain: cleanDomain }));
    }

    if (emailParam && !domainParam) {
      const emailDomain = emailParam.split('@')[1];
      if (emailDomain) {
        setState((prev) => ({ ...prev, domain: emailDomain }));
      }
    }

    if (useCaseParam) {
      const exampleIndex = parseInt(useCaseParam, 10);
      if (!isNaN(exampleIndex) && exampleIndex >= 1 && exampleIndex <= EXAMPLE_PROMPTS.length) {
        setState((prev) => ({ ...prev, useCase: EXAMPLE_PROMPTS[exampleIndex - 1] }));
      }
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

  const resetState = useCallback(() => {
    setState(initialState);
    clearParams();
  }, [clearParams]);

  const handleFormSubmit = useCallback(
    async (domain: string, useCase: string) => {
      if (!domain || !useCase) {
        toast.error('Please fill in all required fields correctly');
        return;
      }

      setState((prev) => ({
        ...prev,
        domain,
        useCase,
        isLoading: true,
        showResults: false,
        companyContext: null,
        scenarioResult: null,
      }));

      updateUrlParams({ domain });

      try {
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

        const { data: companyContext, hasFullData } = await scrapeCompanyDetails(cleanDomain);

        if (!hasFullData) {
          toast.warning('Could not extract full company details.', {
            duration: 4000,
          });
        }

        const scenarioResult = await generateScenario(companyContext, useCase);

        if (!scenarioResult.success) {
          throw new Error(scenarioResult.error || 'Failed to generate scenario');
        }

        setState((prev) => ({
          ...prev,
          companyContext,
          scenarioResult: scenarioResult.data!,
          isLoading: false,
          showResults: true,
        }));

        toast.success('Integration scenario generated successfully!');
      } catch (error) {
        console.error('Error generating integration:', error);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          showResults: false,
        }));

        toast.error('Failed to generate integration scenario. Please try again.', {
          duration: 5000,
        });
      }
    },
    [updateUrlParams]
  );

  const generateIntegration = useCallback(async () => {
    if (!state.domain || !state.useCase || state.domainError) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    await handleFormSubmit(state.domain, state.useCase);
  }, [state.domain, state.useCase, state.domainError, handleFormSubmit]);

  return (
    <IntegrationContext.Provider
      value={{
        ...state,
        setDomain,
        setDomainError,
        setUseCase,
        generateIntegration,
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
