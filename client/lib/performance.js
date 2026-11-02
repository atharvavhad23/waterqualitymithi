// Performance optimization utilities

// Debounce function for user inputs
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle function for scroll/resize events
export const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};

// Memoized chart data processor
export const processChartData = (rawData, parameters) => {
  if (!rawData || !parameters) return [];
  
  return rawData.map(item => {
    const processedItem = { date: item.date };
    parameters.forEach(param => {
      if (item[param] !== undefined) {
        processedItem[param] = Number(item[param]).toFixed(2);
      }
    });
    return processedItem;
  });
};

// Lazy loading helper
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1
  };
  
  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Virtual scrolling helper for large datasets
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  return {
    startIndex,
    endIndex,
    visibleItems: items.slice(startIndex, endIndex)
  };
};

// Memory-efficient data sampling for charts
export const sampleData = (data, maxPoints = 100) => {
  if (!data || data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};

// Performance monitoring
export const performanceMonitor = {
  measureRender: (componentName) => {
    const startTime = performance.now();
    return {
      end: () => {
        const endTime = performance.now();
        console.log(`${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
      }
    };
  },
  
  measureDataProcessing: (operation) => {
    const startTime = performance.now();
    const result = operation();
    const endTime = performance.now();
    console.log(`Data processing time: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }
};