'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntegration } from '@/contexts/integration-context';
import { cn } from '@/lib/utils';

const LOADING_MESSAGES = [
  'Analyzing company profile',
  'Scanning integration patterns',
  'Matching with best scenarios',
  'Optimizing data flows',
  'Configuring building blocks',
  'Generating implementation code',
  'Finalizing integration blueprint',
];

export function LoadingState() {
  const { isLoading } = useIntegration();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      const completeInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(completeInterval);
            setTimeout(() => {
              setProgress(0);
              setMessageIndex(0);
            }, 600);
            return 100;
          }
          return Math.min(prev + 10, 100);
        });
      }, 20);

      return () => clearInterval(completeInterval);
    }

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 5000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const increment = Math.random() * 1.5 + 0.5;
        return Math.min(prev + increment, 95);
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  const currentMessage = LOADING_MESSAGES[messageIndex];

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-6">
      <Card className="bg-gray-900/50 backdrop-blur-xl overflow-hidden border-gray-800">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="animate-spin border-purple-500/20 absolute inset-0 w-20 h-20 border-4 rounded-full" />
              <div className="animate-spin border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent absolute inset-0 w-20 h-20 border-4 rounded-full" />
              <div className="flex items-center justify-center w-20 h-20">
                <Sparkles className="animate-pulse w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="mb-8 text-center">
            <p className="animate-pulse text-lg text-white">{currentMessage}...</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Processing</span>
              <span className="font-medium text-purple-400">{Math.round(progress)}%</span>
            </div>
            <div className="relative w-full h-2 overflow-hidden bg-gray-800 rounded-full">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500',
                  'transition-all duration-300 ease-out rounded-full'
                )}
                style={{ width: `${progress}%` }}
              >
                <div className="bg-white/20 animate-pulse absolute inset-0" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-md p-6 border-gray-800">
        <div className="flex items-start gap-4">
          <Skeleton className="animate-pulse w-12 h-12 bg-gray-800 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="animate-pulse w-48 h-6 bg-gray-800" />
            <Skeleton className="animate-pulse w-full h-4 bg-gray-800" />
            <Skeleton className="animate-pulse w-3/4 h-4 bg-gray-800" />
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-md p-6 border-gray-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="animate-pulse w-64 h-8 bg-gray-800" />
            <Skeleton className="animate-pulse w-24 h-6 bg-gray-800 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="animate-pulse w-full h-4 bg-gray-800" />
            <Skeleton className="animate-pulse w-5/6 h-4 bg-gray-800" />
            <Skeleton className="animate-pulse w-4/6 h-4 bg-gray-800" />
          </div>
        </div>
      </Card>
    </div>
  );
}
