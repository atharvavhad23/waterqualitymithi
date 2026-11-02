import React from 'react';

// Performance decorator for components
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return React.memo(React.forwardRef((props, ref) => {
    const renderStartTime = performance.now();
    
    React.useEffect(() => {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;
      
      if (renderTime > 16) { // Slower than 60fps
        console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
      }
      
      // Add performance data attribute
      if (ref?.current) {
        ref.current.setAttribute('data-component', componentName);
        ref.current.setAttribute('data-render-time', renderTime.toFixed(2));
      }
    });
    
    return React.createElement(WrappedComponent, { ...props, ref });
  }));
};

// Performance-aware component wrapper
export const PerformanceWrapper = React.memo(({ 
  children, 
  componentName, 
  threshold = 16,
  onSlowRender 
}) => {
  const startTime = React.useRef(performance.now());
  
  React.useLayoutEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (renderTime > threshold) {
      console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      onSlowRender?.(renderTime, componentName);
    }
  });
  
  return (
    <div 
      data-component={componentName}
      data-render-time={performance.now() - startTime.current}
    >
      {children}
    </div>
  );
});

PerformanceWrapper.displayName = 'PerformanceWrapper';

// Hook for tracking component lifecycle performance
export const useComponentPerformance = (componentName) => {
  const mountTime = React.useRef(performance.now());
  const renderCount = React.useRef(0);
  const [performanceData, setPerformanceData] = React.useState({
    mountTime: 0,
    renderCount: 0,
    averageRenderTime: 0
  });
  
  React.useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    
    setPerformanceData(prev => ({
      mountTime: mountTime.current,
      renderCount: renderCount.current,
      averageRenderTime: (now - mountTime.current) / renderCount.current
    }));
  });
  
  return performanceData;
};

// Utility for measuring function execution time
export const measurePerformance = (fn, label) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  };
};

// Batch updates for better performance
export const batchUpdates = (updates) => {
  React.unstable_batchedUpdates(() => {
    updates.forEach(update => update());
  });
};