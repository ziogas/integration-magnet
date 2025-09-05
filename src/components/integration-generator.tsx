'use client';

import { IntegrationProvider } from '@/contexts/integration-context';
import { HeroSection } from './integration-generator/hero-section';
import { FormSection } from './integration-generator/form-section';
import { LoadingState } from './integration-generator/loading-state';
import { ResultsSection } from './integration-generator/results-section';

function IntegrationGeneratorContent() {
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
          <FormSection />
        </div>
        <LoadingState />
        <ResultsSection />
      </div>
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
