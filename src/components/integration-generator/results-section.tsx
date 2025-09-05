'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIntegration } from '@/contexts/integration-context';

export function ResultsSection() {
  const { showResults, companyContext } = useIntegration();

  if (!showResults || !companyContext) return null;

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-6">
      <Card className="bg-gray-900/50 backdrop-blur-md p-6 border-gray-800">
        <div className="flex items-start gap-4">
          {companyContext.faviconUrl && (
            <img
              src={companyContext.faviconUrl}
              alt={`${companyContext.name} logo`}
              className="bg-white/10 w-12 h-12 p-2 rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-semibold text-white">{companyContext.name}</h3>
            {companyContext.description ? (
              <p className="mb-3 text-gray-400">{companyContext.description}</p>
            ) : (
              <p className="mb-3 italic text-gray-500">
                Company description not available. Using domain information only.
              </p>
            )}
            <Badge variant="secondary" className="bg-purple-950 text-purple-200 border-purple-800">
              {companyContext.domain}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-md p-6 border-gray-800">
        <p className="text-gray-400">Scenario matching and code generation will be implemented in the next tasks...</p>
      </Card>
    </div>
  );
}
