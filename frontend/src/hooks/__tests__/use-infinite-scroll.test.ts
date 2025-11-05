import { renderHook } from '@testing-library/react';
import { useInfiniteScroll } from '../use-infinite-scroll';

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  private callback: IntersectionObserverCallback;
  private elements: Set<Element> = new Set();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    this.elements.add(target);
  }

  unobserve(target: Element): void {
    this.elements.delete(target);
  }

  disconnect(): void {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // Helper method to trigger intersection
  triggerIntersection(isIntersecting: boolean): void {
    const entries: IntersectionObserverEntry[] = Array.from(this.elements).map(
      (target) =>
        ({
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry)
    );

    this.callback(entries, this);
  }
}

describe('useInfiniteScroll', () => {
  let mockFetchMore: jest.Mock;
  let mockObserver: MockIntersectionObserver;

  beforeEach(() => {
    mockFetchMore = jest.fn();

    // Mock IntersectionObserver globally
    mockObserver = new MockIntersectionObserver(jest.fn());
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
      mockObserver = new MockIntersectionObserver(callback);
      return mockObserver;
    }) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger fetchMore when scrolling near bottom and hasMore is true', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchMore: mockFetchMore,
        hasMore: true,
        isLoading: false,
      })
    );

    // Simulate intersection (user scrolled near bottom)
    mockObserver.triggerIntersection(true);

    expect(mockFetchMore).toHaveBeenCalledTimes(1);
  });

  it('should not trigger fetchMore when hasMore is false', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchMore: mockFetchMore,
        hasMore: false,
        isLoading: false,
      })
    );

    // Simulate intersection
    mockObserver.triggerIntersection(true);

    expect(mockFetchMore).not.toHaveBeenCalled();
  });

  it('should not trigger fetchMore when isLoading is true', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchMore: mockFetchMore,
        hasMore: true,
        isLoading: true,
      })
    );

    // Simulate intersection
    mockObserver.triggerIntersection(true);

    expect(mockFetchMore).not.toHaveBeenCalled();
  });

  it('should not trigger fetchMore when not intersecting', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchMore: mockFetchMore,
        hasMore: true,
        isLoading: false,
      })
    );

    // Simulate no intersection (user not near bottom)
    mockObserver.triggerIntersection(false);

    expect(mockFetchMore).not.toHaveBeenCalled();
  });

  it('should return observer target ref', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchMore: mockFetchMore,
        hasMore: true,
        isLoading: false,
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.current).toBe(null); // Initially null until attached
  });

  it('should disconnect observer on unmount', () => {
    const disconnectSpy = jest.spyOn(mockObserver, 'disconnect');

    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        fetchMore: mockFetchMore,
        hasMore: true,
        isLoading: false,
      })
    );

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should handle multiple intersection triggers correctly', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchMore: mockFetchMore,
        hasMore: true,
        isLoading: false,
      })
    );

    // First intersection
    mockObserver.triggerIntersection(true);
    expect(mockFetchMore).toHaveBeenCalledTimes(1);

    // Second intersection (should trigger again if still hasMore)
    mockObserver.triggerIntersection(true);
    expect(mockFetchMore).toHaveBeenCalledTimes(2);
  });

  it('should update observer when dependencies change', () => {
    const { rerender } = renderHook(
      ({ hasMore }) =>
        useInfiniteScroll({
          fetchMore: mockFetchMore,
          hasMore,
          isLoading: false,
        }),
      { initialProps: { hasMore: true } }
    );

    // Initial state: should trigger
    mockObserver.triggerIntersection(true);
    expect(mockFetchMore).toHaveBeenCalledTimes(1);

    // Update hasMore to false
    rerender({ hasMore: false });

    // Should not trigger anymore
    mockObserver.triggerIntersection(true);
    expect(mockFetchMore).toHaveBeenCalledTimes(1); // Still 1, not 2
  });
});
