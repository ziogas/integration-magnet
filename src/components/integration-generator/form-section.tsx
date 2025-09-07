'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Suggestion } from '@/components/ai-elements/suggestion';
import { Globe, AlertCircle, Sparkles, ArrowRight, Loader2, Zap } from 'lucide-react';
import { EXAMPLE_PROMPTS } from './constants';
import { cn } from '@/lib/utils';
import { useIntegration } from '@/contexts/integration-context';

export function FormSection() {
  const { isLoading, handleFormSubmit } = useIntegration();
  const [domain, setDomain] = useState('');
  const [useCase, setUseCase] = useState('');
  const [domainError, setDomainError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const domainPattern = /^([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    if (!domain || !domainPattern.test(domain)) {
      setDomainError('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setDomainError('');
    handleFormSubmit(domain, useCase);
  }

  return (
    <Card className="md:border md:bg-gradient-to-b md:from-gray-900/60 md:to-gray-900/40 md:backdrop-blur-xl md:border-gray-800/50 md:p-8 max-w-4xl mx-auto bg-transparent border-0 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label htmlFor="company-domain" className="block text-sm font-semibold text-gray-100">
            Company Domain
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="company-domain"
              type="text"
              placeholder="your-company.com"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setDomainError('');
              }}
              className={cn(
                'pl-10 h-12 bg-gray-950/60 border-gray-700/50 text-gray-100',
                'placeholder:text-gray-600 transition-all duration-200',
                'hover:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
                domainError && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
          </div>
          {domainError && (
            <div className="animate-in fade-in flex items-center gap-2 text-sm text-red-400 duration-200">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{domainError}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Or try with{' '}
            <button
              type="button"
              onClick={() => setDomain('stripe.com')}
              className="hover:text-purple-300 underline-offset-2 font-medium text-purple-400 underline transition-colors"
            >
              stripe.com
            </button>{' '}
            as an example
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="use-case" className="block text-sm font-semibold text-gray-100">
            Integration Use Case
          </label>
          <Textarea
            id="use-case"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            maxLength={2000}
            placeholder="Describe your integration needs (e.g., sync call recordings with HubSpot and Salesforce)"
            rows={4}
            className={cn(
              'bg-gray-950/60 border-gray-700/50 text-gray-100',
              'placeholder:text-gray-600 resize-none transition-all duration-200',
              'hover:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
            )}
          />

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Quick examples</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <Suggestion
                  key={index}
                  suggestion={prompt}
                  onClick={() => setUseCase(prompt)}
                  className="bg-gray-800/60 hover:bg-gray-700/60 hover:text-gray-100 border-gray-700/50 hover:border-gray-600 text-gray-300 max-w-[270px]"
                  title={prompt}
                >
                  <span className="block truncate">{prompt}</span>
                </Suggestion>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                <span>Generating Integration...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                <span>Generate Integration</span>
                <ArrowRight className="group-hover:translate-x-1 w-4 h-4 ml-2 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
