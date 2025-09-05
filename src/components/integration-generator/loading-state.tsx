import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
}

export function LoadingState({ isLoading }: LoadingStateProps) {
  if (!isLoading) return null;

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-6">
      <Card className="bg-gray-900/50 backdrop-blur-md p-6 border-gray-800">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 bg-gray-800 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-48 h-6 bg-gray-800" />
            <Skeleton className="w-full h-4 bg-gray-800" />
            <Skeleton className="w-3/4 h-4 bg-gray-800" />
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-md p-6 border-gray-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-64 h-8 bg-gray-800" />
            <Skeleton className="w-24 h-6 bg-gray-800 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-full h-4 bg-gray-800" />
            <Skeleton className="w-5/6 h-4 bg-gray-800" />
            <Skeleton className="w-4/6 h-4 bg-gray-800" />
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-md p-6 border-gray-800">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="w-32 h-10 bg-gray-800 rounded-md" />
            <Skeleton className="w-32 h-10 bg-gray-800 rounded-md" />
            <Skeleton className="w-32 h-10 bg-gray-800 rounded-md" />
          </div>
          <div className="bg-gray-950/50 p-4 space-y-2 rounded-lg">
            <Skeleton className="w-full h-4 bg-gray-800" />
            <Skeleton className="w-5/6 h-4 bg-gray-800" />
            <Skeleton className="w-4/6 h-4 bg-gray-800" />
            <Skeleton className="w-full h-4 bg-gray-800" />
            <Skeleton className="w-3/4 h-4 bg-gray-800" />
            <Skeleton className="w-5/6 h-4 bg-gray-800" />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-3 text-gray-400">
        <Loader2 className="animate-spin w-5 h-5" />
        <span className="text-sm">Analyzing your requirements and generating personalized integration...</span>
      </div>
    </div>
  );
}
