'use client';

import { useState, useCallback } from 'react';
import { HeroSection } from './integration-generator/hero-section';
import { FormSection } from './integration-generator/form-section';
import { LoadingState } from './integration-generator/loading-state';
import { ResultsSection } from './integration-generator/results-section';

export function IntegrationGenerator() {
  const [companyUrl, setCompanyUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [useCase, setUseCase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!companyUrl || !useCase || urlError) return;

    setIsLoading(true);
    setShowResults(false);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setIsLoading(false);
    setShowResults(true);
  }, [companyUrl, useCase, urlError]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,11%)] via-[hsl(222,47%,9%)] to-[hsl(217,33%,12%)]" />
      <div className="bg-gradient-to-tr from-purple-900/10 via-transparent to-blue-900/10 absolute inset-0" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.05'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl lg:px-8 lg:py-20 relative z-10 px-6 py-16 mx-auto">
        <HeroSection />

        <div className="mt-16">
          <FormSection
            companyUrl={companyUrl}
            setCompanyUrl={setCompanyUrl}
            urlError={urlError}
            setUrlError={setUrlError}
            useCase={useCase}
            setUseCase={setUseCase}
            isLoading={isLoading}
            onGenerate={handleGenerate}
          />
        </div>

        <LoadingState isLoading={isLoading} />
        <ResultsSection showResults={showResults} />
      </div>
    </section>
  );
}
