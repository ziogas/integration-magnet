'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { scrapeCompany } from '@/actions/company-scraper';
import { toast } from 'sonner';
import type { CompanyContext } from '@/types';

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

  const setDomain = useCallback((domain: string) => {
    setState((prev) => ({ ...prev, domain }));
  }, []);

  const setUrlError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, urlError: error }));
  }, []);

  const setUseCase = useCallback((useCase: string) => {
    setState((prev) => ({ ...prev, useCase: useCase }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

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

      const context = await scrapeCompany(domain);

      if (!context.description) {
        toast.warning('Could not extract company description. Using basic information from domain.', {
          duration: 4000,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        companyContext: context,
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

      if (error instanceof Error && error.message.includes('API')) {
        toast.error('API service is temporarily unavailable. Please try again later.', {
          duration: 5000,
        });
      } else if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.', {
          duration: 5000,
        });
      } else {
        toast.error('Failed to generate integration scenario. Please try again or use a different URL.', {
          duration: 5000,
        });
      }
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
