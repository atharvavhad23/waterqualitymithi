import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MapPin,
  Factory,
  Droplets,
  Truck,
  Building2,
  Zap,
  AlertTriangle,
  Eye,
  Navigation,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Target,
  Info
} from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { usePerformanceMonitor } from '../hooks/usePerformance';

const PollutionSourceTracker = React.memo(() => {
  const { renderCount } = usePerformanceMonitor('PollutionSourceTracker');
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [trackingMode, setTrackingMode] = useState('realtime');
  const mapRef = useRef(null);

  // Pollution source data - memoized for performance
  const pollutionSources = useMemo(() => [
    {
      id: 'industrial-1',
      type: 'Industrial',
      name: 'Dharavi Textile Complex',
      location: { lat: 19.0423, lng: 72.8573 },
      severity: 'high',
      pollutants: ['Heavy Metals', 'Dyes', 'Chemicals'],
      impact: 85,
      status: 'active',
      coordinates: { x: 320, y: 180 },
      contribution: 28,
      recentIncidents: 12,
      compliance: 'violation'
    },
    {
      id: 'sewage-1',
      type: 'Sewage',
      name: 'Bandra East STP',
      location: { lat: 19.0596, lng: 72.8656 },
      severity: 'critical',
      pollutants: ['BOD', 'Pathogens', 'Nutrients'],
      impact: 95,
      status: 'overflow',
      coordinates: { x: 280, y: 120 },
      contribution: 35,
      recentIncidents: 18,
      compliance: 'critical'
    },
    {
      id: 'landfill-1',
      type: 'Solid Waste',
      name: 'Mahim Creek Dump',
      location: { lat: 19.0330, lng: 72.8517 },
      severity: 'medium',
      pollutants: ['Leachate', 'Plastics', 'Organics'],
      impact: 65,
      status: 'active',
      coordinates: { x: 180, y: 220 },
      contribution: 18,
      recentIncidents: 8,
      compliance: 'warning'
    },
    {
      id: 'commercial-1',
      type: 'Commercial',
      name: 'BKC Business District',
      location: { lat: 19.0625, lng: 72.8674 },
      severity: 'low',
      pollutants: ['Runoff', 'Chemicals', 'Oils'],
      impact: 35,
      status: 'monitored',
      coordinates: { x: 380, y: 100 },
      contribution: 12,
      recentIncidents: 3,
      compliance: 'good'
    },
    {
      id: 'residential-1',
      type: 'Residential',
      name: 'Kurla Slum Complex',
      location: { lat: 19.0728, lng: 72.8826 },
      severity: 'medium',
      pollutants: ['Domestic Waste', 'Greywater'],
      impact: 45,
      status: 'active',
      coordinates: { x: 420, y: 80 },
      contribution: 7,
      recentIncidents: 5,
      compliance: 'fair'
    }
  ], []);

  // Generate tracking data - memoized for performance
  const generateTrackingData = useCallback(() => {
    return pollutionSources.map(source => {
      const baseData = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const seasonalFactor = Math.sin((i / 30) * 2 * Math.PI) * 0.3 + 0.7;
        const randomFactor = Math.random() * 0.4 + 0.8;
        
        baseData.push({
          date: date.toISOString().split('T')[0],
          impact: source.impact * seasonalFactor * randomFactor,
          detected: Math.random() > 0.7,
          concentration: Math.random() * 100
        });
      }
      return {
        ...source,
        trackingData: baseData.reverse()
      };
    });
  }, [pollutionSources]);

  const initialTrackingData = useMemo(() => generateTrackingData(), [generateTrackingData]);
  const [trackingData, setTrackingData] = useState(initialTrackingData);

  // Source type configuration - memoized for performance
  const sourceTypeConfig = useMemo(() => ({
    'Industrial': { color: '#ef4444', icon: Factory, bgColor: 'bg-red-500' },
    'Sewage': { color: '#8b5cf6', icon: Droplets, bgColor: 'bg-purple-500' },
    'Solid Waste': { color: '#f59e0b', icon: Truck, bgColor: 'bg-amber-500' },
    'Commercial': { color: '#06b6d4', icon: Building2, bgColor: 'bg-cyan-500' },
    'Residential': { color: '#10b981', icon: Building2, bgColor: 'bg-emerald-500' }
  }), []);

  const severityConfig = useMemo(() => ({
    'critical': { color: '#dc2626', label: 'Critical', pulse: true },
    'high': { color: '#ea580c', label: 'High', pulse: false },
    'medium': { color: '#ca8a04', label: 'Medium', pulse: false },
    'low': { color: '#16a34a', label: 'Low', pulse: false }
  }), []);

  // Real-time animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (trackingMode === 'realtime') {
        setTrackingData(prev => prev.map(source => ({
          ...source,
          impact: source.impact + (Math.random() - 0.5) * 5,
          status: Math.random() > 0.8 ? 'alert' : source.status
        })));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [trackingMode]);

  const getSeverityColor = useCallback((impact) => {
    if (impact >= 80) return severityConfig.critical;
    if (impact >= 60) return severityConfig.high;
    if (impact >= 40) return severityConfig.medium;
    return severityConfig.low;
  }, [severityConfig]);

  const getComplianceColor = useCallback((compliance) => {
    switch (compliance) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'violation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fair': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Pollution flow simulation
  const PollutionFlowMap = () => {
    const [animationFrame, setAnimationFrame] = useState(0);

    useEffect(() => {
      // Reduced animation frequency for better performance: 100ms -> 300ms
      const interval = setInterval(() => {
        setAnimationFrame(prev => prev + 1);
      }, 300);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="relative bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100 rounded-xl p-4 overflow-hidden w-full h-full min-h-[300px] border border-gray-200 shadow-inner">
        {/* River representation */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
          {/* River path */}
          <path
            d="M 50 250 Q 150 200 250 180 Q 350 160 450 150"
            stroke="url(#riverGradient)"
            strokeWidth="20"
            fill="none"
            className="drop-shadow-lg"
          />
          
          {/* Pollution flow paths */}
          {trackingData.map((source, index) => {
            const { x, y } = source.coordinates;
            const riverY = 180 - (x / 450) * 30; // River curve
            
            return (
              <g key={source.id}>
                {/* Pollution stream */}
                <path
                  d={`M ${x} ${y} Q ${x + 20} ${(y + riverY) / 2} ${x + 40} ${riverY}`}
                  stroke={sourceTypeConfig[source.type].color}
                  strokeWidth={Math.max(2, source.contribution / 5)}
                  strokeOpacity={0.6}
                  fill="none"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
                
                {/* Pollution particles */}
                {[...Array(3)].map((_, particleIndex) => (
                  <circle
                    key={particleIndex}
                    cx={x + 20 + (animationFrame + particleIndex * 20) % 60}
                    cy={y + ((riverY - y) * ((animationFrame + particleIndex * 20) % 60)) / 60}
                    r={2 + source.severity === 'critical' ? 2 : 0}
                    fill={sourceTypeConfig[source.type].color}
                    opacity={0.8}
                  />
                ))}
              </g>
            );
          })}
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Source markers */}
        {trackingData.map(source => {
          const config = sourceTypeConfig[source.type];
          const IconComponent = config.icon;
          const severity = getSeverityColor(source.impact);
          
          return (
            <div
              key={source.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${
                selectedSource?.id === source.id ? 'z-20 scale-125' : 'z-10'
              }`}
              style={{
                left: `${(source.coordinates.x / 500) * 100}%`,
                top: `${(source.coordinates.y / 300) * 100}%`
              }}
              onClick={() => setSelectedSource(selectedSource?.id === source.id ? null : source)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${
                  severity.pulse ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: severity.color }}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              
              {/* Impact indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {Math.round(source.impact / 10)}
              </div>
              
              {/* Tooltip on hover */}
              {selectedSource?.id === source.id && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-xl border z-30 min-w-48">
                  <div className="font-semibold text-sm">{source.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{source.type}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Impact:</span>
                      <span className="font-semibold" style={{ color: severity.color }}>
                        {source.impact.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Contribution:</span>
                      <span className="font-semibold">{source.contribution}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Status:</span>
                      <Badge className={getComplianceColor(source.compliance)}>
                        {source.compliance}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
          <div className="text-sm font-semibold mb-2">Source Types</div>
          <div className="space-y-1">
            {Object.entries(sourceTypeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                ></div>
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50/50 to-orange-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Pollution Source Tracker & Flow Analysis
              </CardTitle>
              <CardDescription className="text-gray-600">
                Real-time identification and tracking of pollution sources affecting Mithi River
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={trackingMode === 'realtime' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTrackingMode('realtime')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Zap className="h-4 w-4 mr-1" />
                Live Tracking
              </Button>
              <Button
                variant={trackingMode === 'historical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTrackingMode('historical')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Historical
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="flow-map" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flow-map">Flow Map</TabsTrigger>
          <TabsTrigger value="source-analysis">Source Analysis</TabsTrigger>
          <TabsTrigger value="impact-assessment">Impact Assessment</TabsTrigger>
          <TabsTrigger value="compliance-tracking">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="flow-map" className="space-y-6">
          {/* Pollution Flow Map */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-red-600" />
                Real-time Pollution Flow Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <PollutionFlowMap />
              </div>
            </CardContent>
          </Card>

          {/* Active Sources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackingData.map(source => {
              const config = sourceTypeConfig[source.type];
              const severity = getSeverityColor(source.impact);
              const IconComponent = config.icon;
              
              return (
                <Card 
                  key={source.id} 
                  className={`border-0 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedSource?.id === source.id ? 'ring-2 ring-red-400' : ''
                  }`}
                  onClick={() => setSelectedSource(selectedSource?.id === source.id ? null : source)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: config.color }}
                        >
                          <IconComponent className="h-3 w-3" />
                        </div>
                        <div className="text-sm font-semibold">{source.name}</div>
                      </div>
                      <Badge className={getComplianceColor(source.compliance)}>
                        {source.compliance}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impact Level:</span>
                        <span className="font-semibold" style={{ color: severity.color }}>
                          {source.impact.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Contribution:</span>
                        <span className="font-semibold">{source.contribution}%</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Recent Incidents:</span>
                        <span className="font-semibold text-red-600">{source.recentIncidents}</span>
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-xs text-gray-600 mb-1">Main Pollutants:</div>
                        <div className="flex flex-wrap gap-1">
                          {source.pollutants.slice(0, 2).map(pollutant => (
                            <Badge key={pollutant} variant="secondary" className="text-xs">
                              {pollutant}
                            </Badge>
                          ))}
                          {source.pollutants.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{source.pollutants.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="source-analysis" className="space-y-6">
          {/* Source Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Pollution Source Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trackingData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="contribution"
                        nameKey="name"
                      >
                        {trackingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={sourceTypeConfig[entry.type].color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Contribution']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Impact vs Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={trackingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="impact" name="Impact Level" unit="%" />
                      <YAxis dataKey="recentIncidents" name="Recent Incidents" />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [value, name === 'impact' ? 'Impact Level (%)' : 'Recent Incidents']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                      />
                      <Scatter dataKey="impact" fill="#ef4444" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact-assessment" className="space-y-6">
          {/* Impact Analysis */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Environmental Impact Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={trackingData.map(source => ({
                    name: source.name,
                    impact: source.impact,
                    incidents: source.recentIncidents * 5,
                    compliance: source.compliance === 'good' ? 100 : 
                               source.compliance === 'fair' ? 75 :
                               source.compliance === 'warning' ? 50 : 25
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Impact" dataKey="impact" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Radar name="Incidents" dataKey="incidents" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    <Radar name="Compliance" dataKey="compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance-tracking" className="space-y-6">
          {/* Compliance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['critical', 'violation', 'warning', 'good'].map(status => {
              const count = trackingData.filter(source => source.compliance === status).length;
              const percentage = Math.round((count / trackingData.length) * 100);
              
              return (
                <Card key={status} className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      status === 'critical' ? 'text-red-600' :
                      status === 'violation' ? 'text-orange-600' :
                      status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{status} Status</div>
                    <div className="text-xs text-gray-500">{percentage}% of sources</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Compliance Timeline */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trackingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="recentIncidents" fill="#ef4444" name="Recent Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

PollutionSourceTracker.displayName = 'PollutionSourceTracker';

export default PollutionSourceTracker;