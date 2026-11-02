import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from './ui/card';

// Lazy load heavy components
export const LazyWaterQuality3D = lazy(() => import('./WaterQuality3D'));
export const LazyWaterQualityTimeline = lazy(() => import('./WaterQualityTimeline'));
export const LazyPollutionSourceTracker = lazy(() => import('./PollutionSourceTracker'));
export const LazyEcosystemHealthMonitor = lazy(() => import('./EcosystemHealthMonitor'));
export const LazyWaterTreatmentDashboard = lazy(() => import('./WaterTreatmentDashboard'));

// Loading component
const ComponentLoader = ({ className = "h-64" }) => (
  <Card className={`border-0 shadow-lg ${className}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading component...</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// HOC for lazy loading with error boundary
export const withLazyLoading = (LazyComponent, fallback = <ComponentLoader />) => {
  return React.memo((props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

// Error boundary for lazy loaded components
export class LazyLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy load error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Component failed to load</p>
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}