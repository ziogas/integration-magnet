'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { scrapeCompany } from '@/actions/company-scraper';
import { toast } from 'sonner';
import type { CompanyContext } from '@/types';
import { EXAMPLE_PROMPTS } from '@/components/integration-generator/constants';

type IntegrationState = {
  domain: string;
  urlError: string;
  useCase: string;
  isLoading: boolean;
  showResults: boolean;
  companyContext: CompanyContext | null;
};

type IntegrationContextType = IntegrationState & {
  setDomain: (domain: string) => void;
  setUrlError: (error: string) => void;
  setUseCase: (useCase: string) => void;
  generateIntegration: () => Promise<void>;
  resetState: () => void;
};

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

const initialState: IntegrationState = {
  domain: '',
  urlError: '',
  useCase: '',
  isLoading: false,
  showResults: false,
  companyContext: null,
};

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IntegrationState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) return;

    const domainParam = searchParams.get('domain');
    const emailParam = searchParams.get('email');
    const useCaseParam = searchParams.get('usecase');

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
  }, [searchParams, isInitialized]);

  const updateUrlParams = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });

      const queryString = newSearchParams.toString();
      router.push(queryString ? `?${queryString}` : '/', { scroll: false });
    },
    [searchParams, router]
  );

  const setDomain = useCallback(
    (domain: string) => {
      setState((prev) => ({ ...prev, domain }));
      updateUrlParams({ domain });
    },
    [updateUrlParams]
  );

  const setUrlError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, urlError: error }));
  }, []);

  const setUseCase = useCallback((useCase: string) => {
    setState((prev) => ({ ...prev, useCase: useCase }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
    router.push('/', { scroll: false });
  }, [router]);

  const generateIntegration = useCallback(async () => {
    if (!state.domain || !state.useCase || state.urlError) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      showResults: false,
      companyContext: null,
    }));

    try {
      const domain = state.domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

      const { data, hasFullData } = await scrapeCompany(domain);

      if (!hasFullData) {
        toast.warning('Could not extract full company details.', {
          duration: 4000,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        companyContext: data,
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
  }, [state.domain, state.useCase, state.urlError]);

  return (
    <IntegrationContext.Provider
      value={{
        ...state,
        setDomain,
        setUrlError,
        setUseCase,
        generateIntegration,
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
