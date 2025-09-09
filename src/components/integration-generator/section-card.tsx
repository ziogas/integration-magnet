import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SectionCardProps = {
  title: string;
  headerAction?: ReactNode;
  gradient?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  headerAction,
  gradient = 'bg-gradient-to-r from-purple-900/20 to-blue-900/20',
  children,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn('bg-gray-900/50 backdrop-blur-xl pt-0 overflow-hidden border-gray-800', className)}>
      <div className={cn('px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 border-b border-gray-800', gradient)}>
        {headerAction ? (
          <div className="flex items-center justify-between gap-3">
            <h2 className="sm:text-xl md:text-2xl text-lg font-semibold text-white">{title}</h2>
            {headerAction}
          </div>
        ) : (
          <h2 className="sm:text-xl md:text-2xl text-lg font-semibold text-white">{title}</h2>
        )}
      </div>
      <div className="md:px-8 px-4 py-2">{children}</div>
    </Card>
  );
}
