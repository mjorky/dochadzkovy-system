import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  fetchMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

/**
 * Custom hook for implementing infinite scroll using IntersectionObserver API
 *
 * @param fetchMore - Callback function to fetch more data
 * @param hasMore - Boolean indicating if more data is available
 * @param isLoading - Optional boolean indicating if data is currently loading
 * @returns observerTarget ref to attach to sentinel element
 *
 * Usage:
 * const observerTarget = useInfiniteScroll({
 *   fetchMore: handleFetchMore,
 *   hasMore: data.hasMore,
 *   isLoading: loading
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={observerTarget} />
 *   </div>
 * );
 */
export function useInfiniteScroll({
  fetchMore,
  hasMore,
  isLoading = false,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const lastFetchTime = useRef<number>(0);

  useEffect(() => {
    // Don't set up observer if no more data or currently loading
    if (!hasMore || isLoading) {
      return;
    }

    const currentTarget = observerTarget.current;
    if (!currentTarget) {
      return;
    }

    // Create IntersectionObserver to detect when sentinel element is visible
    const observer = new IntersectionObserver(
      (entries) => {
        // entries[0] is the sentinel element
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          // Debounce: prevent fetches within 500ms of each other
          const now = Date.now();
          if (now - lastFetchTime.current < 500) {
            return;
          }
          lastFetchTime.current = now;
          fetchMore();
        }
      },
      {
        // Root is viewport by default
        root: null,
        // 200px from bottom of viewport
        rootMargin: '200px',
        // Trigger when at least 10% of element is visible
        threshold: 0.1,
      }
    );

    observer.observe(currentTarget);

    // Clean up observer on unmount or when dependencies change
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [fetchMore, hasMore, isLoading]);

  return observerTarget;
}
