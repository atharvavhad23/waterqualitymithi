import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import SensorNetworkDashboard from '../components/SensorNetworkDashboard';
import EnvironmentalImpactAssessment from '../components/EnvironmentalImpactAssessment';
import SmartAlertSystem from '../components/SmartAlertSystem';
import WaterQualityHeatmap from '../components/WaterQualityHeatmap';
import { 
  LazyWaterQuality3D,
  LazyWaterQualityTimeline,
  LazyPollutionSourceTracker,
  LazyEcosystemHealthMonitor,
  LazyWaterTreatmentDashboard,
  withLazyLoading,
  LazyLoadErrorBoundary
} from '../components/LazyComponents';
import { 
  Sparkles, 
  Activity, 
  Map, 
  Shield, 
  Bell, 
  Zap,
  Eye,
  BarChart3,
  Waves,
  Target,
  TreePine,
  Filter,
  Leaf
} from 'lucide-react';

// Create lazy wrapped components
const WaterQuality3D = withLazyLoading(LazyWaterQuality3D);
const WaterQualityTimeline = withLazyLoading(LazyWaterQualityTimeline);
const PollutionSourceTracker = withLazyLoading(LazyPollutionSourceTracker);
const EcosystemHealthMonitor = withLazyLoading(LazyEcosystemHealthMonitor);
const WaterTreatmentDashboard = withLazyLoading(LazyWaterTreatmentDashboard);

const AdvancedFeatures = React.memo(() => {
  const [activeTab, setActiveTab] = useState('3d-viz');

  const features = useMemo(() => [
    {
      id: '3d-viz',
      name: '3D Water Quality Visualization',
      icon: Sparkles,
      description: 'Interactive 3D visualization with real-time animated water quality data',
      component: WaterQuality3D,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'sensor-network',
      name: 'Sensor Network Dashboard',
      icon: Activity,
      description: 'Real-time monitoring of all sensors with status, battery, and signal strength',
      component: SensorNetworkDashboard,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'heatmap',
      name: 'Interactive Heatmap',
      icon: Map,
      description: 'Dynamic heatmap visualization with animated contours and sensor overlays',
      component: WaterQualityHeatmap,
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 'impact-assessment',
      name: 'Environmental Impact Assessment',
      icon: Shield,
      description: 'Comprehensive environmental analysis with predictions and recommendations',
      component: EnvironmentalImpactAssessment,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'smart-alerts',
      name: 'Smart Alert System',
      icon: Bell,
      description: 'Intelligent alert management with real-time notifications and emergency contacts',
      component: SmartAlertSystem,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'timeline-analysis',
      name: 'Water Quality Timeline & Historical Trends',
      icon: BarChart3,
      description: 'Comprehensive temporal analysis with historical data visualization and trend detection',
      component: WaterQualityTimeline,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'pollution-tracker',
      name: 'Real-time Pollution Flow Visualization',
      icon: Target,
      description: 'Real-time identification and tracking of pollution sources with flow visualization',
      component: PollutionSourceTracker,
      color: 'from-red-600 to-orange-600'
    },
    {
      id: 'ecosystem-health',
      name: 'Ecosystem Health Monitoring System',
      icon: Eye,
      description: 'Biodiversity monitoring with species health tracking and conservation effectiveness',
      component: EcosystemHealthMonitor,
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'treatment-dashboard',
      name: 'Water Treatment Effectiveness Dashboard',
      icon: Zap,
      description: 'Advanced monitoring of sewage treatment processes with optimization recommendations',
      component: WaterTreatmentDashboard,
      color: 'from-blue-600 to-cyan-600'
    }
  ], []);

  return (
    <LazyLoadErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            ✨ Advanced Water Quality Features ✨
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore cutting-edge visualization and monitoring tools designed to provide comprehensive 
            insights into the Mithi River water quality system with beautiful, interactive interfaces.
          </p>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-gradient-to-br ${feature.color} p-1`}
                onClick={() => setActiveTab(feature.id)}
              >
                <div className="bg-white rounded-lg p-6 h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${feature.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{feature.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  <Button 
                    className={`mt-4 w-full bg-gradient-to-r ${feature.color} text-white border-0 hover:opacity-90`}
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Explore Feature
                  </Button>
                </div>
              </Card>
            );
          })}
          
          {/* Coming Soon Card */}
          <Card className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-6 text-center h-full flex flex-col justify-center">
              <div className="mb-4">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700 mb-2">More Features Coming Soon!</h3>
                <p className="text-sm text-gray-500">
                  AI-powered predictions, drone integration, satellite analysis, and much more...
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Stay Tuned
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Showcase */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 rounded-xl p-1">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden md:inline">{feature.name.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {features.map((feature) => {
            const FeatureComponent = feature.component;
            return (
              <TabsContent key={feature.id} value={feature.id} className="mt-6">
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className={`text-2xl font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent flex items-center justify-center space-x-2`}>
                      <feature.icon className="h-6 w-6" />
                      <span>{feature.name}</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 max-w-2xl mx-auto">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <FeatureComponent />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Development Notes */}
        <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              � Development Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Project Goals
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Monitor Mithi River water quality effectively</p>
                  <p>• Provide real-time alerts for pollution events</p>
                  <p>• Support environmental researchers and policy makers</p>
                  <p>• Create accessible data visualization tools</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-green-600" />
                  Key Features
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Interactive 3D water quality visualization</p>
                  <p>• Comprehensive sensor network monitoring</p>
                  <p>• Environmental impact assessment tools</p>
                  <p>• Smart alert and notification system</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-600" />
                  Implementation
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Built with modern React architecture</p>
                  <p>• Custom Canvas animations for data viz</p>
                  <p>• Responsive design for all devices</p>
                  <p>• Integration with Django backend</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Stack */}
        <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-slate-50 to-gray-50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Technical Implementation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Frontend Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'React 18',
                    'Vite',
                    'Tailwind CSS',
                    'Recharts',
                    'Canvas API'
                  ].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Backend & Data</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Django',
                    'SQLite',
                    'Python ML',
                    'REST API',
                    'CSV Processing'
                  ].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700 italic">
                "This project demonstrates practical application of full-stack development skills, 
                combining environmental science with modern web technologies to create meaningful 
                solutions for water quality monitoring."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </LazyLoadErrorBoundary>
  );
});

AdvancedFeatures.displayName = 'AdvancedFeatures';

export default AdvancedFeatures;