'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
  Copy,
  Check,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block';
import { useIntegration } from '@/contexts/integration-context';
import { getCompanyLogoUrl, getApplicationLogoUrl } from '@/lib/logo-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

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
  const imageUrl = logoUrl || getApplicationLogoUrl(appName || '');

  return (
    <div className="group relative">
      <div
        className={cn(
          'bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 border border-gray-700',
          'hover:border-purple-700 hover:scale-105 hover:bg-gray-800/70'
        )}
      >
        <img
          src={imageUrl}
          alt={`${appName} logo`}
          className="filter brightness-90 group-hover:brightness-100 object-contain w-full h-12 transition-all"
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />
      </div>
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
    </div>
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
    description: 'Execute requests and queries to external applications',
    gradient: 'from-purple-500 to-purple-700',
  },
  events: {
    icon: Activity,
    title: 'Events',
    description: 'Track and respond to changes in external applications',
    gradient: 'from-blue-500 to-blue-700',
  },
  flows: {
    icon: GitBranch,
    title: 'Flows',
    description: 'Multi-step integrations with branching and loops',
    gradient: 'from-green-500 to-green-700',
  },
  'data-collections': {
    icon: Database,
    title: 'Data Collections',
    description: 'Read, write, and search data across systems',
    gradient: 'from-orange-500 to-orange-700',
  },
  'unified-data-models': {
    icon: Layers,
    title: 'Unified Data Models',
    description: 'Consistent data handling across all integrations',
    gradient: 'from-pink-500 to-pink-700',
  },
  'field-mappings': {
    icon: Link,
    title: 'Field Mappings',
    description: 'Custom data transformations and mappings',
    gradient: 'from-cyan-500 to-cyan-700',
  },
};

function BuildingBlockCard({ blockType, isActive }: { blockType: BuildingBlockType; isActive: boolean }) {
  const config = buildingBlockConfig[blockType];
  const Icon = config.icon;

  return (
    <div className={cn('relative group', !isActive && 'opacity-60')}>
      <div
        className={cn(
          'bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300',
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
        <h4 className={cn('font-semibold mb-2', isActive ? 'text-white' : 'text-gray-300')}>{config.title}</h4>
        <p className="text-sm leading-relaxed text-gray-400">{config.description}</p>
        {isActive && (
          <div className="top-3 right-3 absolute">
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export function ResultsSection() {
  const { showResults, companyContext, scenarioResult, resetState } = useIntegration();
  const [copiedScenario, setCopiedScenario] = useState(false);

  if (!showResults || !companyContext) return null;

  const logoUrl = getCompanyLogoUrl(companyContext.domain);

  return (
    <div className="max-w-5xl mx-auto mt-16 space-y-8">
      <div className="flex justify-start">
        <Button onClick={resetState} variant="ghost">
          <ArrowLeft className="w-4 h-4" />
          New Integration
        </Button>
      </div>

      <Card className="bg-gray-900/50 backdrop-blur-xl pt-0 overflow-hidden border-gray-800">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-8 py-6 border-b border-gray-800">
          <h2 className="text-2xl font-semibold text-white">Company Context</h2>
        </div>
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <img
                src={logoUrl}
                alt={`${companyContext.name} logo`}
                className="rounded-xl bg-white/5 object-contain w-20 h-20 p-3"
              />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-2xl font-bold text-white">{companyContext.name}</h3>
              {companyContext.description ? (
                <p className="mb-4 leading-relaxed text-gray-300">{companyContext.description}</p>
              ) : (
                <p className="mb-4 italic text-gray-500">
                  Company description not available. Using domain information only.
                </p>
              )}
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-purple-950/50 px-3 py-1 text-purple-200 border-purple-800">
                  <Globe className="w-3 h-3 mr-1.5" />
                  {companyContext.domain}
                </Badge>
                {companyContext.industry && (
                  <Badge variant="secondary" className="bg-blue-950/50 px-3 py-1 text-blue-200 border-blue-800">
                    {companyContext.industry}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {scenarioResult && (
        <>
          <Card className="bg-gray-900/50 backdrop-blur-xl pt-0 overflow-hidden border-gray-800">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 px-8 py-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Matched Scenario</h2>
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
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">{scenarioResult.matchedScenario.name}</h3>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(scenarioResult.matchedScenario.name);
                      setCopiedScenario(true);
                      toast.success('Scenario name copied!', { duration: 2000 });
                      setTimeout(() => setCopiedScenario(false), 2000);
                    } catch {
                      toast.error('Failed to copy scenario name');
                    }
                  }}
                  className={cn(
                    'p-2 text-gray-400 rounded-lg transition-all duration-200',
                    'bg-gray-800/50 hover:bg-gray-700/50 hover:text-gray-200 hover:scale-110'
                  )}
                  title="Copy scenario name"
                >
                  {copiedScenario ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="mb-6 leading-relaxed text-gray-300">
                {scenarioResult.personalizedDescription || scenarioResult.matchedScenario.description}
              </p>

              <div className="bg-gray-800/30 rounded-xl p-6 mb-6">
                <h4 className="mb-4 text-lg font-semibold text-white">How It Works</h4>
                <div className="space-y-3">
                  {scenarioResult.matchedScenario.howItWorks.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center',
                          'bg-gradient-to-r from-purple-500 to-blue-500'
                        )}
                      >
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                      <p className="leading-relaxed text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-purple-300 border-purple-800">
                  {scenarioResult.matchedScenario.category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
                {scenarioResult.matchedScenario.buildingBlocks.slice(0, 3).map((block) => (
                  <Badge key={block} variant="outline" className="text-blue-300 border-blue-800">
                    {block.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-xl pt-0 overflow-hidden border-gray-800">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-8 py-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Supported Applications</h2>
                <Badge
                  variant="secondary"
                  className={cn(
                    'px-3 py-1 text-purple-200',
                    'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-800/50'
                  )}
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  {scenarioResult.applicationLogos?.length || scenarioResult.matchedScenario.supportedApps.length}+
                  Integrations
                </Badge>
              </div>
            </div>
            <div className="p-8">
              <p className="mb-6 text-gray-300">
                This scenario seamlessly connects with these popular applications and many more:
              </p>
              <div className="sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 grid grid-cols-4 gap-4">
                {(scenarioResult.applicationLogos || scenarioResult.matchedScenario.supportedApps.slice(0, 10)).map(
                  (logoUrl, index) => (
                    <ApplicationLogo key={index} logoUrl={logoUrl} />
                  )
                )}
              </div>
              <div className="pt-6 mt-6 border-t border-gray-800">
                <p className="text-sm text-gray-500">
                  Plus 3,289+ more integrations available through Membrane's AI-powered connector builder
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-xl pt-0 overflow-hidden border-gray-800">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 px-8 py-6 border-b border-gray-800">
              <h2 className="text-2xl font-semibold text-white">Implementation</h2>
            </div>
            <div className="p-8">
              <Tabs defaultValue="membrane" className="w-full">
                <TabsList className="bg-gray-800/50 grid w-full grid-cols-3 border border-gray-700">
                  <TabsTrigger
                    value="membrane"
                    className={cn(
                      'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900/50',
                      'data-[state=active]:to-blue-900/50 data-[state=active]:text-white',
                      'data-[state=active]:border-purple-700'
                    )}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Membrane Code
                  </TabsTrigger>
                  <TabsTrigger
                    value="json"
                    className={cn(
                      'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900/50',
                      'data-[state=active]:to-blue-900/50 data-[state=active]:text-white',
                      'data-[state=active]:border-purple-700'
                    )}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON Spec
                  </TabsTrigger>
                  <TabsTrigger
                    value="docs"
                    className={cn(
                      'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900/50',
                      'data-[state=active]:to-blue-900/50 data-[state=active]:text-white',
                      'data-[state=active]:border-purple-700'
                    )}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    API Docs
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
            </div>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-xl pt-0 overflow-hidden border-gray-800">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-8 py-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Building Blocks</h2>
                <Badge
                  variant="secondary"
                  className={cn(
                    'px-3 py-1 text-purple-200',
                    'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-800/50'
                  )}
                >
                  AI-Powered Components
                </Badge>
              </div>
            </div>
            <div className="p-8">
              <p className="mb-6 text-gray-300">
                This integration leverages Membrane's powerful building blocks to create a seamless connection:
              </p>
              <div className="md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-4">
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
                  'p-4 mt-8 border rounded-lg',
                  'bg-gradient-to-r from-purple-900/10 to-blue-900/10 border-purple-800/30'
                )}
              >
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-purple-300">✨ AI-Native Platform:</span> Membrane automatically
                  selects and configures the optimal building blocks for your integration, eliminating the need for
                  manual API configuration.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
