import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { cache, CacheManager } from '../cache';

interface UseCachedDataOptions {
  key: string;
  fetcher: () => Promise<any>;
  ttl?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

export function useCachedData({
  key,
  fetcher,
  ttl = 300,
  revalidateOnFocus = false,
  revalidateOnReconnect = false
}: UseCachedDataOptions) {
  const [cachedData, setCachedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Try to get data from cache first
  useEffect(() => {
    const loadCachedData = async () => {
      const data = await cache.get(key);
      if (data) {
        setCachedData(data);
        setIsLoading(false);
      }
    };
    loadCachedData();
  }, [key]);
  
  // Use SWR for data fetching with fallback to cached data
  const { data, error, mutate } = useSWR(
    key,
    async () => {
      const freshData = await fetcher();
      // Update cache with fresh data
      await cache.set(key, freshData, ttl);
      return freshData;
    },
    {
      fallbackData: cachedData,
      revalidateOnFocus,
      revalidateOnReconnect,
      onSuccess: (data) => {
        setIsLoading(false);
      }
    }
  );
  
  return {
    data: data || cachedData,
    error,
    isLoading: isLoading && !data && !cachedData,
    mutate,
    invalidate: async () => {
      await cache.delete(key);
      return mutate();
    }
  };
}