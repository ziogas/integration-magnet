'use client';

import { useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateUrlParams = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });

      const queryString = newSearchParams.toString();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        router.push(queryString ? `?${queryString}` : '/', { scroll: false });
      }, 300);
    },
    [searchParams, router]
  );

  const getParam = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const clearParams = useCallback(() => {
    router.push('/', { scroll: false });
  }, [router]);

  return {
    updateUrlParams,
    getParam,
    clearParams,
  };
}
