import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, Clock, Cpu, MemoryStick, Download, Eye } from 'lucide-react';

const PerformanceMonitor = React.memo(({ isVisible = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: [],
    memoryUsage: [],
    networkRequests: [],
    bundleSize: 0,
    cacheHits: 0,
    componentCount: 0
  });
  
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    fps: 60,
    memoryMB: 0,
    renderCount: 0,
    loadTime: 0
  });

  const performanceObserver = useRef(null);
  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());

  useEffect(() => {
    if (!isVisible) return;

    // Performance Observer for measuring render performance
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
            setPerformanceMetrics(prev => ({
              ...prev,
              renderTime: [...prev.renderTime.slice(-19), {
                time: new Date().toLocaleTimeString(),
                duration: entry.duration || entry.loadEventEnd - entry.loadEventStart,
                type: entry.entryType
              }]
            }));
          }
        });
      });

      performanceObserver.current.observe({ 
        entryTypes: ['measure', 'navigation', 'paint', 'largest-contentful-paint'] 
      });
    }

    // Memory monitoring - reduced frequency to minimize performance impact
    const memoryInterval = setInterval(() => {
      if (performance.memory && !isMinimized) {
        const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
        setRealTimeMetrics(prev => ({ ...prev, memoryMB }));
        
        // Only update detailed metrics when expanded
        if (isExpanded) {
          setPerformanceMetrics(prev => ({
            ...prev,
            memoryUsage: [...prev.memoryUsage.slice(-9), {
              time: new Date().toLocaleTimeString(),
              memory: memoryMB,
              total: Math.round(performance.memory.totalJSHeapSize / 1048576),
              limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            }]
          }));
        }
      }
    }, isMinimized ? 5000 : 2000); // Less frequent when minimized

    // FPS monitoring - simplified and less frequent
    const fpsInterval = setInterval(() => {
      if (!isMinimized) {
        const now = performance.now();
        const deltaTime = now - lastFrameTime.current;
        const fps = deltaTime > 0 ? Math.min(60, Math.round(1000 / deltaTime)) : 60;
        
        setRealTimeMetrics(prev => ({ 
          ...prev, 
          fps: fps,
          renderCount: frameCount.current 
        }));
        
        frameCount.current++;
        lastFrameTime.current = now;
      }
    }, 500); // Less frequent updates

    // Component count monitoring - only when expanded
    let componentInterval;
    if (isExpanded && !isMinimized) {
      componentInterval = setInterval(() => {
        const componentCount = document.querySelectorAll('[data-reactroot], [data-react-component]').length;
        setRealTimeMetrics(prev => ({ ...prev, componentCount }));
      }, 3000);
    }

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      clearInterval(memoryInterval);
      clearInterval(fpsInterval);
      if (componentInterval) {
        clearInterval(componentInterval);
      }
    };
  }, [isVisible, isMinimized, isExpanded]);

  const getPerformanceStatus = (value, thresholds) => {
    if (value <= thresholds.good) return { status: 'excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (value <= thresholds.fair) return { status: 'good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (value <= thresholds.poor) return { status: 'fair', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { status: 'poor', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const memoryStatus = getPerformanceStatus(realTimeMetrics.memoryMB, { good: 50, fair: 100, poor: 200 });
  const fpsStatus = getPerformanceStatus(60 - realTimeMetrics.fps, { good: 5, fair: 15, poor: 30 });

  if (!isVisible) return null;

  // Minimized view - just a small toggle button
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-black/80 hover:bg-black/90 text-white border border-gray-600 p-2"
          size="sm"
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-black/95 backdrop-blur-md text-white border-gray-700 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              Performance Monitor
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1 h-6 w-6"
              >
                {isExpanded ? '−' : '+'}
              </Button>
              <Button
                onClick={() => setIsMinimized(true)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1 h-6 w-6"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-0">
          {/* Compact Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">FPS</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">{realTimeMetrics.fps}</span>
                  <div className={`w-2 h-2 rounded-full ${fpsStatus.color}`}></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Memory</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">{realTimeMetrics.memoryMB}MB</span>
                  <div className={`w-2 h-2 rounded-full ${memoryStatus.color}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded p-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">Status</span>
              <Badge className={`text-xs ${
                realTimeMetrics.fps >= 55 && realTimeMetrics.memoryMB < 100 ? 'bg-green-500' : 
                realTimeMetrics.fps >= 45 && realTimeMetrics.memoryMB < 150 ? 'bg-blue-500' : 
                realTimeMetrics.fps >= 30 && realTimeMetrics.memoryMB < 200 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {realTimeMetrics.fps >= 55 && realTimeMetrics.memoryMB < 100 ? 'Excellent' : 
                 realTimeMetrics.fps >= 45 && realTimeMetrics.memoryMB < 150 ? 'Good' : 
                 realTimeMetrics.fps >= 30 && realTimeMetrics.memoryMB < 200 ? 'Fair' : 'Poor'}
              </Badge>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Renders</span>
                    <span className="text-sm font-bold">{realTimeMetrics.renderCount}</span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Components</span>
                    <span className="text-sm font-bold">{realTimeMetrics.componentCount}</span>
                  </div>
                </div>
              </div>

              {/* Memory Chart */}
              {performanceMetrics.memoryUsage.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-1 text-gray-300">Memory Usage (MB)</h4>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceMetrics.memoryUsage}>
                        <defs>
                          <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: '1px solid #374151',
                            borderRadius: '6px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="memory" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#memoryGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Performance Tips */}
              <div className="text-xs text-gray-400">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>React.memo active</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Lazy loading enabled</span>
                </div>
              </div>
            </>
          )}


        </CardContent>
      </Card>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;