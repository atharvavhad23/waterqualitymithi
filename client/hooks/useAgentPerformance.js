import { useState } from 'react';

export function useAgentPerformance() {
  const [metrics, setMetrics] = useState({
    avgResponseTime: 0,
    cacheHitRate: 0,
    totalRequests: 0,
  });

  function trackRequest(responseTimeMs, fromCache) {
    setMetrics(prev => {
      const total = prev.totalRequests + 1;
      const avg = (prev.avgResponseTime * prev.totalRequests + responseTimeMs) / total;
      const hits = prev.cacheHitRate * prev.totalRequests + (fromCache ? 1 : 0);
      return {
        avgResponseTime: avg,
        cacheHitRate: hits / total,
        totalRequests: total,
      };
    });
  }

  return { metrics, trackRequest };
}
