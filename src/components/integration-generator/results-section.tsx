import { Card } from '@/components/ui/card';

interface ResultsSectionProps {
  showResults: boolean;
}

export function ResultsSection({ showResults }: ResultsSectionProps) {
  if (!showResults) return null;

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-6">
      <Card className="bg-gray-900/50 backdrop-blur-md p-6 border-gray-800">
        <p className="text-gray-300">Results will be displayed here (implementation coming in next tasks)</p>
      </Card>
    </div>
  );
}
