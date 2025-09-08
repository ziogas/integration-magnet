'use client';

import { useCallback } from 'react';
import { Globe, AlertCircle, Sparkles, ArrowRight, Loader2, Zap, User } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Suggestion } from '@/components/ai-elements/suggestion';
import { cn } from '@/lib/utils';
import { Persona } from '@/types';
import { useIntegration } from '@/contexts/integration-context';
import { trackEvent } from '@/lib/posthog';

import { EXAMPLE_PROMPTS } from './constants';

export function FormSection() {
  const {
    domain,
    setDomain,
    useCase,
    setUseCase,
    persona,
    setPersona,
    domainError,
    setDomainError,
    isLoading,
    handleFormSubmit,
  } = useIntegration();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const domainPattern = /^([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      if (!domain || !domainPattern.test(domain)) {
        setDomainError('Please enter a valid domain (e.g., example.com)');
        return;
      }

      setDomainError('');
      handleFormSubmit();
    },
    [domain, handleFormSubmit, setDomainError]
  );

  return (
    <Card className="md:border md:bg-gradient-to-b md:from-gray-900/60 md:to-gray-900/40 md:backdrop-blur-xl md:border-gray-800/50 md:p-8 max-w-4xl mx-auto bg-transparent border-0 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="md:grid-cols-2 grid gap-6">
          <div className="space-y-2">
            <label htmlFor="company-domain" className="required block text-sm font-semibold text-gray-100">
              Company Domain:
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
                  domainError && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
                  !domain && 'border-gray-700/30'
                )}
                required
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
                onClick={() => {
                  setDomain('gong.io');
                  trackEvent('example_used', {
                    example_type: 'domain',
                    value: 'gong.io',
                  });
                }}
                className="hover:text-purple-300 underline-offset-2 font-medium text-purple-400 underline transition-colors"
              >
                gong.io
              </button>{' '}
              as an example
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="persona" className="required block text-sm font-semibold text-gray-100">
              I am a...
            </label>
            <Select value={persona} required onValueChange={(value) => setPersona(value as Persona)}>
              <div>
                <SelectTrigger
                  id="persona"
                  className={cn(
                    '!h-12 mb-0 bg-gray-950/60 border-gray-700/50 text-gray-100 w-full',
                    'transition-all duration-200',
                    'hover:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
                    !persona && 'border-gray-700/30'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Select your role" />
                  </div>
                </SelectTrigger>
              </div>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="technical" className="focus:bg-gray-800 focus:text-gray-100 text-gray-100">
                  Developer / Engineer
                </SelectItem>
                <SelectItem value="executive" className="focus:bg-gray-800 focus:text-gray-100 text-gray-100">
                  CTO / VP Engineering
                </SelectItem>
                <SelectItem value="business" className="focus:bg-gray-800 focus:text-gray-100 text-gray-100">
                  Product Manager / Business Analyst
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">We'll tailor the technical depth based on your role</p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="use-case" className="required block text-sm font-semibold text-gray-100">
            Integration Use Case:
          </label>
          <Textarea
            id="use-case"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            maxLength={2000}
            placeholder="What do you want to integrate? (e.g., 'Sync customer data between systems' or 'Automate lead scoring')"
            rows={4}
            className={cn(
              'bg-gray-950/60 border-gray-700/50 text-gray-100',
              'placeholder:text-gray-600 resize-none transition-all duration-200',
              'hover:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
              !useCase && 'border-gray-700/30'
            )}
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            Describe what you want to integrate and achieve. Include systems to connect, data to sync, workflows to
            automate, or specific business outcomes you're looking for.
          </p>

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
                  onClick={() => {
                    setUseCase(prompt);
                    trackEvent('example_used', {
                      example_type: 'prompt',
                      value: prompt,
                    });
                  }}
                  className="bg-gray-800/60 hover:bg-gray-700/60 hover:text-gray-100 border-gray-700/50 hover:border-gray-600 text-gray-300 max-w-[270px]"
                  title={prompt}
                >
                  <span className="block truncate">{prompt}</span>
                </Suggestion>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Button type="submit" disabled={isLoading || !domain || !useCase || !persona} size="lg">
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
          {!domain || !useCase || !persona ? (
            <p className="text-xs text-gray-500">
              {!domain && !useCase && !persona && 'Please fill in all required fields'}
              {!domain && (useCase || persona) && 'Please enter your company domain'}
              {!persona && (domain || useCase) && 'Please select your role'}
              {!useCase && (domain || persona) && 'Please describe your integration use case'}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Continue to get your personalized integration guide</p>
          )}
        </div>
      </form>
    </Card>
  );
}
