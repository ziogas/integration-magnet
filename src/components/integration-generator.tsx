'use client';

import { IntegrationProvider, useIntegration } from '@/contexts/integration-context';
import { HeroSection } from './integration-generator/hero-section';
import { FormSection } from './integration-generator/form-section';
import { LoadingState } from './integration-generator/loading-state';
import { ResultsSection } from './integration-generator/results-section';
import { StickyFooter } from './integration-generator/sticky-footer';
import { SocialProofSection } from './integration-generator/social-proof-section';

function IntegrationGeneratorContent() {
  const { showResults, isLoading } = useIntegration();

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

      <div className="max-w-7xl lg:px-8 relative z-10 px-6 py-6 mx-auto">
        <HeroSection />
        {!showResults && !isLoading && (
          <div className="md:mt-16 mt-8">
            <FormSection />
          </div>
        )}
        <LoadingState />
        <ResultsSection />
        <SocialProofSection />
      </div>

      <StickyFooter />

      {/* Add padding to prevent content from being hidden behind footer */}
      <div className="h-20" />
    </section>
  );
}

export function IntegrationGenerator() {
  return (
    <IntegrationProvider>
      <IntegrationGeneratorContent />
    </IntegrationProvider>
  );
}
