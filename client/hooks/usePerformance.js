import { useEffect, useRef, useState, useCallback } from 'react';

// Hook for measuring component render performance
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    
    if (lastRenderTime.current) {
      const renderTime = now - lastRenderTime.current;
      if (renderTime > 16) { // More than 16ms (60fps)
        console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
      }
    }
    
    lastRenderTime.current = now;
  });
  
  return { renderCount: renderCount.current };
};

// Hook for debounced state updates
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return [debouncedValue, setValue];
};

// Hook for lazy data loading
export const useLazyData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortController = useRef(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cancel previous request
      if (abortController.current) {
        abortController.current.abort();
      }
      
      abortController.current = new AbortController();
      
      const result = await fetchFunction(abortController.current.signal);
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, dependencies);
  
  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};

// Hook for intersection observer (lazy loading)
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options
      }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold, hasIntersected]);
  
  return { elementRef, isIntersecting, hasIntersected };
};

// Hook for virtual scrolling
export const useVirtualScrolling = (items, itemHeight = 50, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = {
    start: Math.floor(scrollTop / itemHeight),
    end: Math.min(
      Math.floor(scrollTop / itemHeight) + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
  };
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  
  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return {
    visibleItems,
    visibleRange,
    onScroll,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.start * itemHeight
  };
};

// Hook for memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);
  
  useEffect(() => {
    if (!performance.memory) return;
    
    const checkMemory = () => {
      const info = {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
      
      setMemoryInfo(info);
      
      // Warn if memory usage is high
      if (info.used / info.limit > 0.8) {
        console.warn('High memory usage detected:', info);
      }
    };
    
    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return memoryInfo;
};