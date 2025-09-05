'use client';

import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Suggestion } from '@/components/ai-elements/suggestion';
import { Globe, AlertCircle, Sparkles, ArrowRight, Loader2, Zap } from 'lucide-react';
import { EXAMPLE_PROMPTS } from './constants';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  companyUrl: string;
  setCompanyUrl: (url: string) => void;
  urlError: string;
  setUrlError: (error: string) => void;
  useCase: string;
  setUseCase: (useCase: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
}

export function FormSection({
  companyUrl,
  setCompanyUrl,
  urlError,
  setUrlError,
  useCase,
  setUseCase,
  isLoading,
  onGenerate,
}: FormSectionProps) {
  const validateUrl = useCallback(
    (url: string) => {
      if (!url) {
        setUrlError('');
        return true;
      }

      const domainPattern = /^([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      const isValid = domainPattern.test(url);

      setUrlError(isValid ? '' : 'Please enter a valid domain (e.g., example.com)');
      return isValid;
    },
    [setUrlError]
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCompanyUrl(value);
      validateUrl(value);
    },
    [setCompanyUrl, validateUrl]
  );

  const handleExampleDomain = useCallback(() => {
    const exampleDomain = 'stripe.com';
    setCompanyUrl(exampleDomain);
    validateUrl(exampleDomain);
  }, [setCompanyUrl, validateUrl]);

  const isFormValid = companyUrl && useCase && !urlError && !isLoading;

  return (
    <Card className="bg-gradient-to-b from-gray-900/60 to-gray-900/40 backdrop-blur-xl border-gray-800/50 max-w-4xl p-8 mx-auto shadow-2xl">
      <div className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="company-domain" className="block text-sm font-semibold text-gray-100">
            Company Domain
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="company-domain"
              type="text"
              placeholder="your-company.com"
              value={companyUrl}
              onChange={handleUrlChange}
              className={cn(
                'pl-10 h-12 bg-gray-950/60 border-gray-700/50 text-gray-100',
                'placeholder:text-gray-600 transition-all duration-200',
                'hover:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
                urlError && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
          </div>
          {urlError && (
            <div className="animate-in fade-in flex items-center gap-2 text-sm text-red-400 duration-200">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{urlError}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Or try with{' '}
            <button
              type="button"
              onClick={handleExampleDomain}
              className="hover:text-purple-300 underline-offset-2 font-medium text-purple-400 underline transition-colors"
            >
              stripe.com
            </button>{' '}
            as an example
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="use-case" className="block text-sm font-semibold text-gray-100">
              Integration Use Case
            </label>
            <span className="font-mono text-xs text-gray-600">{useCase.length}/2000</span>
          </div>
          <Textarea
            id="use-case"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value.slice(0, 2000))}
            placeholder="Describe your integration needs (e.g., sync call recordings with HubSpot and Salesforce)"
            rows={4}
            className={cn(
              'bg-gray-950/60 border-gray-700/50 text-gray-100',
              'placeholder:text-gray-600 resize-none transition-all duration-200',
              'hover:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
            )}
          />

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Quick examples</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <Suggestion
                  key={index}
                  suggestion={prompt}
                  onClick={setUseCase}
                  className="bg-gray-800/60 hover:bg-gray-700/60 hover:text-gray-100 border-gray-700/50 hover:border-gray-600 text-gray-300"
                  title={prompt}
                >
                  {prompt.length > 45 ? `${prompt.slice(0, 45)}...` : prompt}
                </Suggestion>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            type="button"
            disabled={!isFormValid}
            onClick={onGenerate}
            size="lg"
            className={cn(
              'relative group h-12 px-8 font-semibold',
              'bg-gradient-to-r from-purple-600 to-blue-600',
              'hover:from-purple-500 hover:to-blue-500',
              'text-white shadow-lg hover:shadow-purple-500/25',
              'transition-all duration-300 hover:scale-105',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              'disabled:hover:shadow-lg'
            )}
          >
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
      </div>
    </Card>
  );
}
