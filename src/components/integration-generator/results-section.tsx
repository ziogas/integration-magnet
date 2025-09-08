'use client';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  Sparkles,
  Code2,
  FileJson,
  BookOpen,
  Zap,
  Activity,
  GitBranch,
  Database,
  Layers,
  Link,
  ArrowLeft,
  Clock,
  Shield,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Server,
  type LucideIcon,
} from 'lucide-react';
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block';
import { useIntegration } from '@/contexts/integration-context';
import { getCompanyLogoUrl, getApplicationLogoUrl } from '@/lib/logo-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/posthog';
import { Button } from '../ui/button';
import { SectionCard } from './section-card';

type CompanyContext = {
  name: string;
  domain: string;
  description?: string;
  industry?: string;
};

type ScenarioResult = {
  confidence: number;
  personalizedDescription?: string;
  applicationLogos?: string[];
  codeSnippet?: string;
  jsonSpec?: Record<string, unknown>;
  matchedScenario: {
    name: string;
    description: string;
    category: string;
    supportedApps: string[];
    howItWorks: string[];
    buildingBlocks: string[];
    codeExample: string;
    jsonSpec: Record<string, unknown>;
  };
};

type ApplicationLogoProps =
  | {
      appName?: string;
      logoUrl?: never;
    }
  | {
      appName?: never;
      logoUrl: string;
    };

function ApplicationLogo({ appName, logoUrl }: ApplicationLogoProps) {
  if (!appName && !logoUrl) {
    return null;
  }

  const imageUrl = logoUrl || getApplicationLogoUrl(appName || '');

  return (
    <>
      <img
        src={imageUrl}
        alt={`${appName} logo`}
        className="filter brightness-90 group-hover:brightness-100 rounded-xl h-12 transition-all"
        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
      />
      {appName && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 rounded-b-xl transition-opacity duration-200',
            'bg-gradient-to-t from-gray-900 to-transparent',
            'opacity-0 group-hover:opacity-100 pointer-events-none'
          )}
        >
          <p className="py-1 text-xs font-medium text-center text-white capitalize">{appName}</p>
        </div>
      )}
    </>
  );
}

type BuildingBlockType = 'actions' | 'events' | 'flows' | 'data-collections' | 'unified-data-models' | 'field-mappings';

const buildingBlockConfig: Record<
  BuildingBlockType,
  { icon: LucideIcon; title: string; description: string; gradient: string }
> = {
  actions: {
    icon: Zap,
    title: 'Actions',
    description: 'Execute requests and queries to external applications.',
    gradient: 'from-purple-500 to-purple-700',
  },
  events: {
    icon: Activity,
    title: 'Events',
    description: 'Track and respond to changes in external applications.',
    gradient: 'from-blue-500 to-blue-700',
  },
  flows: {
    icon: GitBranch,
    title: 'Flows',
    description: 'Multi-step integrations with branching and loops.',
    gradient: 'from-green-500 to-green-700',
  },
  'data-collections': {
    icon: Database,
    title: 'Data Collections',
    description: 'Read, write, and search your data. Enabling synchronization and information retrieval.',
    gradient: 'from-orange-500 to-orange-700',
  },
  'unified-data-models': {
    icon: Layers,
    title: 'Unified Data Models',
    description: 'Consistent data handling across all integrations.',
    gradient: 'from-pink-500 to-pink-700',
  },
  'field-mappings': {
    icon: Link,
    title: 'Field Mappings',
    description: 'Data transformations and mappings between systems, enabling seamless integration.',
    gradient: 'from-cyan-500 to-cyan-700',
  },
};

function BuildingBlockCard({ blockType, isActive }: { blockType: BuildingBlockType; isActive: boolean }) {
  const config = buildingBlockConfig[blockType];
  const Icon = config.icon;

  return (
    <div className={cn('relative group', !isActive && 'opacity-60 hidden md:block')}>
      <div
        className={cn(
          'bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 border transition-all duration-300',
          isActive
            ? 'border-purple-700/50 bg-gradient-to-br from-purple-900/20 to-blue-900/20'
            : 'border-gray-700/50 hover:border-gray-600'
        )}
      >
        <div
          className={cn(
            'w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center mb-4',
            config.gradient,
            isActive && 'shadow-lg'
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h4 className={cn('font-semibold mb-2 text-sm sm:text-base', isActive ? 'text-white' : 'text-gray-300')}>
          {config.title}
        </h4>
        <p className="sm:text-sm text-xs leading-relaxed text-gray-400">{config.description}</p>
        {isActive && (
          <div className="top-3 right-3 absolute">
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyContextCard({ companyContext }: { companyContext: CompanyContext }) {
  const logoUrl = getCompanyLogoUrl(companyContext.domain);

  return (
    <SectionCard title="Company Context">
      <div className="sm:flex-row sm:items-start sm:gap-6 flex flex-col items-center gap-4">
        <div className="flex-shrink-0">
          <img
            src={logoUrl}
            alt={`${companyContext.name} logo`}
            className="rounded-xl bg-white/5 sm:w-20 sm:h-20 object-contain w-16 h-16"
          />
        </div>
        <div className="sm:text-left flex-1 text-center">
          <h3 className="sm:text-2xl mb-2 text-xl font-bold text-white">{companyContext.name}</h3>
          {companyContext.description ? (
            <p className="mb-4 leading-relaxed text-gray-300">{companyContext.description}</p>
          ) : (
            <p className="mb-4 italic text-gray-500">
              Company description not available. Using domain information only.
            </p>
          )}
          <div className="sm:justify-start sm:gap-3 flex flex-wrap items-center justify-center gap-2">
            <Badge
              variant="secondary"
              className="bg-purple-950/50 sm:px-3 sm:text-sm px-2 py-1 text-xs text-purple-200 border-purple-800"
            >
              <Globe className="w-3 h-3 mr-1 sm:mr-1.5" />
              {companyContext.domain}
            </Badge>
            {companyContext.industry && (
              <Badge
                variant="secondary"
                className="bg-blue-950/50 sm:px-3 sm:text-sm px-2 py-1 text-xs text-blue-200 border-blue-800"
              >
                {companyContext.industry}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function SupportedApplicationsCard({ scenarioResult }: { scenarioResult: ScenarioResult }) {
  const headerAction = (
    <Badge
      variant="secondary"
      className={cn(
        'px-2 sm:px-3 py-1 text-xs sm:text-sm text-purple-200',
        'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-800/50'
      )}
    >
      <Sparkles className="w-3 h-3 mr-1 sm:mr-1.5" />
      <span className="sm:inline hidden">
        {scenarioResult.applicationLogos?.length || scenarioResult.matchedScenario.supportedApps.length}+ Integrations
      </span>
      <span className="sm:hidden">
        {scenarioResult.applicationLogos?.length || scenarioResult.matchedScenario.supportedApps.length}+
      </span>
    </Badge>
  );

  return (
    <SectionCard title="Supported Applications" headerAction={headerAction}>
      <p className="sm:text-left sm:mb-8 sm:text-base mb-6 text-sm text-center text-gray-300">
        This scenario seamlessly connects with these popular applications and many more:
      </p>
      <div className="sm:gap-4 flex flex-wrap justify-center gap-3">
        {(scenarioResult.applicationLogos || scenarioResult.matchedScenario.supportedApps.slice(0, 10)).map(
          (logoUrl: string, index: number) => (
            <ApplicationLogo key={index} logoUrl={logoUrl} />
          )
        )}
      </div>
      <div className="sm:pt-6 sm:mt-6 pt-4 mt-4 border-t border-gray-800">
        <p className="sm:text-left sm:text-sm text-xs text-center text-gray-500">
          Plus 3,289+ more integrations available through Membrane's AI-powered connector builder
        </p>
      </div>
    </SectionCard>
  );
}

function NoMatchFallback({ companyContext, resetState }: { companyContext: CompanyContext; resetState: () => void }) {
  return (
    <div className="sm:mt-12 md:mt-16 max-w-4xl mx-auto mt-8">
      <div className="flex justify-start mb-6">
        <Button
          onClick={() => {
            trackEvent('try_again_clicked');
            resetState();
          }}
          variant="ghost"
          className="sm:text-base text-sm"
        >
          <ArrowLeft className="sm:w-4 sm:h-4 w-3 h-3" />
          <span className="sm:inline hidden">Try Again</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <SectionCard title="No Perfect Match Found" gradient="bg-gradient-to-r from-orange-900/20 to-yellow-900/20">
        <div className="py-4 space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-lg text-gray-300">
              We couldn't find an exact match for your use case with {companyContext.name}.
            </p>
            <p className="text-gray-400">
              But don't worry! You can explore our extensive scenario library to find the perfect integration for your
              needs.
            </p>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              onClick={() => window.open('https://integration.app/scenarios', '_blank')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Scenario Library
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Or try refining your use case description with more specific details about the systems and workflows you
              want to integrate.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export function ResultsSection() {
  const { showResults, companyContext, scenarioResult, resetState, noMatch } = useIntegration() as {
    showResults: boolean;
    companyContext: CompanyContext | null;
    scenarioResult: ScenarioResult | null;
    resetState: () => void;
    noMatch: boolean;
  };

  if (!showResults || !companyContext) return null;

  if (noMatch) {
    return <NoMatchFallback companyContext={companyContext} resetState={resetState} />;
  }

  return (
    <div className="sm:mt-12 md:mt-16 sm:space-y-8 max-w-6xl mx-auto mt-8 space-y-6">
      <div className="flex justify-start">
        <Button
          onClick={() => {
            trackEvent('try_again_clicked');
            resetState();
          }}
          variant="ghost"
          className="sm:text-base text-sm"
        >
          <ArrowLeft className="sm:w-4 sm:h-4 w-3 h-3" />
          <span className="sm:inline hidden">New Integration</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <div className="sm:space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 space-y-6">
        <CompanyContextCard companyContext={companyContext} />

        {scenarioResult && <SupportedApplicationsCard scenarioResult={scenarioResult} />}
      </div>

      {scenarioResult && (
        <>
          <MatchedScenarioCard scenarioResult={scenarioResult} />
          <ImplementationCard scenarioResult={scenarioResult} />
          <BuildingBlocksCard scenarioResult={scenarioResult} />
        </>
      )}
    </div>
  );
}

function MatchedScenarioCard({ scenarioResult }: { scenarioResult: ScenarioResult }) {
  const headerAction = (
    <Badge
      variant="default"
      className={cn(
        'px-4 py-1.5 text-sm font-semibold',
        scenarioResult.confidence >= 90
          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
          : scenarioResult.confidence >= 70
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500'
      )}
    >
      {scenarioResult.confidence}% Match
    </Badge>
  );

  return (
    <SectionCard
      title="Matched Scenario"
      headerAction={headerAction}
      gradient="bg-gradient-to-r from-blue-900/20 to-purple-900/20"
    >
      <div className="sm:flex-row sm:items-start sm:justify-between flex flex-col gap-3 mb-4">
        <h3 className="sm:text-2xl text-xl font-bold text-white">{scenarioResult.matchedScenario.name}</h3>
      </div>
      <p className="mb-6 leading-relaxed text-gray-300">
        {scenarioResult.personalizedDescription || scenarioResult.matchedScenario.description}
      </p>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="mb-1 text-lg font-semibold text-white">Integration Architecture</h4>
            <p className="text-sm text-gray-400">Enterprise-grade implementation pipeline</p>
          </div>
          <div className="sm:gap-4 flex flex-wrap items-center gap-3">
            <div className="sm:gap-2 flex items-center gap-1">
              <Clock className="sm:w-4 sm:h-4 w-3 h-3 text-gray-400" />
              <span className="sm:text-sm text-xs text-gray-400">~15 min</span>
            </div>
            <div className="sm:gap-2 flex items-center gap-1">
              <Shield className="sm:w-4 sm:h-4 w-3 h-3 text-green-400" />
              <span className="sm:text-sm text-xs text-green-400">Secure</span>
            </div>
          </div>
        </div>

        <div className="relative">
          {scenarioResult.matchedScenario.howItWorks.map((step: string, index: number) => {
            const isLast = index === scenarioResult.matchedScenario.howItWorks.length - 1;
            const complexity =
              index === 0
                ? 'Simple'
                : index === scenarioResult.matchedScenario.howItWorks.length - 1
                  ? 'Advanced'
                  : 'Moderate';
            const timeEstimate =
              index === 0
                ? '2 min'
                : index === scenarioResult.matchedScenario.howItWorks.length - 1
                  ? '5 min'
                  : '3 min';
            const icon =
              index === 0
                ? Server
                : index === scenarioResult.matchedScenario.howItWorks.length - 1
                  ? CheckCircle2
                  : Cpu;
            const IconComponent = icon;

            return (
              <div key={index} className="relative">
                {!isLast && (
                  <div className="hidden lg:block absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-purple-500/50 to-blue-500/50" />
                )}

                <div className="group sm:gap-4 md:gap-3 relative flex mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="sm:block relative hidden">
                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
                          'bg-gradient-to-br shadow-lg',
                          index === 0 && 'from-purple-500/20 to-purple-600/20 border border-purple-500/30',
                          index === scenarioResult.matchedScenario.howItWorks.length - 1 &&
                            'from-green-500/20 to-green-600/20 border border-green-500/30',
                          index !== 0 &&
                            index !== scenarioResult.matchedScenario.howItWorks.length - 1 &&
                            'from-blue-500/20 to-blue-600/20 border border-blue-500/30',
                          'group-hover:scale-110'
                        )}
                      >
                        <IconComponent
                          className={cn(
                            'w-7 h-7',
                            index === 0 && 'text-purple-400',
                            index === scenarioResult.matchedScenario.howItWorks.length - 1 && 'text-green-400',
                            index !== 0 &&
                              index !== scenarioResult.matchedScenario.howItWorks.length - 1 &&
                              'text-blue-400'
                          )}
                        />
                      </div>
                      <div className="-top-2 -right-2 absolute flex items-center justify-center w-6 h-6 bg-gray-900 border border-gray-700 rounded-full">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/30 rounded-xl border-gray-700/50 group-hover:border-purple-700/50 sm:p-4 md:p-5 flex-1 p-3 transition-all duration-300 border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="mb-1 text-base font-semibold text-white">
                          {index === 0
                            ? 'Initialize Connection'
                            : index === scenarioResult.matchedScenario.howItWorks.length - 1
                              ? 'Deploy & Monitor'
                              : `Process Step ${index}`}
                        </h5>
                        <p className="leading-relaxed text-gray-300">{step}</p>
                      </div>
                    </div>

                    <div className="border-gray-700/50 sm:gap-3 sm:pt-4 sm:mt-4 flex flex-wrap items-center gap-2 pt-3 mt-3 border-t">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            complexity === 'Simple' && 'bg-green-900/30 text-green-400 border border-green-800/50',
                            complexity === 'Moderate' && 'bg-blue-900/30 text-blue-400 border border-blue-800/50',
                            complexity === 'Advanced' && 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
                          )}
                        >
                          {complexity}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="flex-shrink-0 w-3 h-3" />
                        <span className="whitespace-nowrap text-xs">{timeEstimate}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Database className="flex-shrink-0 w-3 h-3" />
                        <span className="whitespace-nowrap text-xs">API v2</span>
                      </div>
                      {!isLast && <ArrowRight className="sm:block hidden w-4 h-4 ml-auto text-purple-400" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-purple-300 border-purple-800">
          {scenarioResult.matchedScenario.category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
        {scenarioResult.matchedScenario.buildingBlocks.slice(0, 3).map((block: string) => (
          <Badge key={block} variant="outline" className="text-blue-300 border-blue-800">
            {block.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </Badge>
        ))}
      </div>
    </SectionCard>
  );
}

function ImplementationCard({ scenarioResult }: { scenarioResult: ScenarioResult }) {
  return (
    <SectionCard title="Implementation" gradient="bg-gradient-to-r from-blue-900/20 to-purple-900/20">
      <Tabs defaultValue="membrane" className="w-full">
        <TabsList className="bg-gray-800/50 grid w-full h-auto grid-cols-3 border border-gray-700">
          <TabsTrigger
            value="membrane"
            className={cn(
              'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900/50',
              'data-[state=active]:to-blue-900/50 data-[state=active]:text-white',
              'data-[state=active]:border-purple-700',
              'flex flex-col sm:flex-row items-center justify-center py-2 sm:py-1.5'
            )}
          >
            <Code2 className="sm:mb-0 sm:mr-2 w-4 h-4 mb-1" />
            <span className="text-[10px] sm:text-sm">Code</span>
          </TabsTrigger>
          <TabsTrigger
            value="json"
            className={cn(
              'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900/50',
              'data-[state=active]:to-blue-900/50 data-[state=active]:text-white',
              'data-[state=active]:border-purple-700',
              'flex flex-col sm:flex-row items-center justify-center py-2 sm:py-1.5'
            )}
          >
            <FileJson className="sm:mb-0 sm:mr-2 w-4 h-4 mb-1" />
            <span className="text-[10px] sm:text-sm">JSON</span>
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            className={cn(
              'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900/50',
              'data-[state=active]:to-blue-900/50 data-[state=active]:text-white',
              'data-[state=active]:border-purple-700',
              'flex flex-col sm:flex-row items-center justify-center py-2 sm:py-1.5'
            )}
          >
            <BookOpen className="sm:mb-0 sm:mr-2 w-4 h-4 mb-1" />
            <span className="text-[10px] sm:text-sm">Docs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="membrane" className="mt-6">
          <CodeBlock
            code={scenarioResult.codeSnippet || scenarioResult.matchedScenario.codeExample}
            language="javascript"
            showLineNumbers
            className="bg-gray-900/50 border-gray-800 max-h-[500px] overflow-y-auto"
          >
            <CodeBlockCopyButton
              className={cn(
                'text-gray-300 transition-all duration-200',
                'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-110'
              )}
              onCopy={() => {
                trackEvent('code_copied', {
                  integration_type: 'membrane',
                });
                toast.success('Code copied to clipboard!', {
                  duration: 3000,
                  description: 'Paste it into your Membrane project',
                });
              }}
              onError={() => {
                toast.error('Failed to copy code', { duration: 3000 });
              }}
            />
          </CodeBlock>
        </TabsContent>

        <TabsContent value="json" className="mt-6">
          <CodeBlock
            code={JSON.stringify(scenarioResult.jsonSpec || scenarioResult.matchedScenario.jsonSpec, null, 2)}
            language="json"
            showLineNumbers
            className="bg-gray-900/50 border-gray-800"
          >
            <CodeBlockCopyButton
              className={cn(
                'text-gray-300 transition-all duration-200',
                'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-110'
              )}
              onCopy={() => {
                trackEvent('code_copied', {
                  integration_type: 'json',
                });
                toast.success('JSON specification copied!', {
                  duration: 3000,
                  description: 'Ready to use in your configuration',
                });
              }}
              onError={() => {
                toast.error('Failed to copy JSON', { duration: 3000 });
              }}
            />
          </CodeBlock>
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <div className="bg-gray-900/50 p-6 border border-gray-800 rounded-lg">
            <h3 className="mb-4 text-lg font-semibold text-white">API Documentation</h3>
            <p className="mb-4 text-gray-300">
              Learn how to implement this integration with Membrane's comprehensive API documentation.
            </p>
            <div className="space-y-3">
              <a href="#" className="hover:text-purple-300 block text-purple-400 transition-colors">
                → Getting Started Guide
              </a>
              <a href="#" className="hover:text-purple-300 block text-purple-400 transition-colors">
                → {scenarioResult.matchedScenario.name} Reference
              </a>
              <a href="#" className="hover:text-purple-300 block text-purple-400 transition-colors">
                → Building Blocks Documentation
              </a>
              <a href="#" className="hover:text-purple-300 block text-purple-400 transition-colors">
                → Code Examples Repository
              </a>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </SectionCard>
  );
}

function BuildingBlocksCard({ scenarioResult }: { scenarioResult: ScenarioResult }) {
  const headerAction = (
    <Badge
      variant="secondary"
      className={cn(
        'px-3 py-1 text-purple-200 hidden md:block',
        'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-800/50'
      )}
    >
      AI-Powered Components
    </Badge>
  );

  return (
    <SectionCard title="Building Blocks" headerAction={headerAction}>
      <p className="sm:text-base md:text-left mb-6 text-sm text-center text-gray-300">
        This integration leverages Membrane's powerful building blocks to create a seamless connection:
      </p>
      <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-4">
        {(
          [
            'actions',
            'events',
            'flows',
            'data-collections',
            'unified-data-models',
            'field-mappings',
          ] as BuildingBlockType[]
        ).map((blockType) => (
          <BuildingBlockCard
            key={blockType}
            blockType={blockType}
            isActive={scenarioResult.matchedScenario.buildingBlocks.includes(blockType)}
          />
        ))}
      </div>
      <div
        className={cn(
          'p-3 sm:p-4 mt-6 sm:mt-8 border rounded-lg',
          'bg-gradient-to-r from-purple-900/10 to-blue-900/10 border-purple-800/30'
        )}
      >
        <p className="sm:text-sm text-xs text-gray-300">
          <span className="font-semibold text-purple-300">✨ AI-Native Platform:</span> Membrane automatically selects
          and configures the optimal building blocks for your integration, eliminating the need for manual API
          configuration.
        </p>
      </div>
    </SectionCard>
  );
}
