import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Beaker,
  Filter,
  Zap,
  Droplets,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Calendar,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { usePerformanceMonitor } from '../hooks/usePerformance';

const WaterTreatmentDashboard = React.memo(() => {
  const { renderCount } = usePerformanceMonitor('WaterTreatmentDashboard');
  const [selectedPlant, setSelectedPlant] = useState('bandra-stp');
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Treatment plant data
  const treatmentPlants = {
    'bandra-stp': {
      name: 'Bandra East STP',
      capacity: '180 MLD',
      currentFlow: 165,
      efficiency: 72,
      status: 'operational',
      technology: 'Activated Sludge Process',
      stages: ['Primary', 'Secondary', 'Tertiary'],
      coordinates: { lat: 19.0596, lng: 72.8656 }
    },
    'versova-stp': {
      name: 'Versova STP',
      capacity: '100 MLD',
      currentFlow: 85,
      efficiency: 68,
      status: 'maintenance',
      technology: 'SBR Technology',
      stages: ['Primary', 'Secondary'],
      coordinates: { lat: 19.1297, lng: 72.8147 }
    },
    'malad-stp': {
      name: 'Malad STP',
      capacity: '140 MLD',
      currentFlow: 125,
      efficiency: 75,
      status: 'operational',
      technology: 'MBBR Process',
      stages: ['Primary', 'Secondary', 'Tertiary'],
      coordinates: { lat: 19.1875, lng: 72.8486 }
    },
    'ghatkopar-stp': {
      name: 'Ghatkopar STP',
      capacity: '90 MLD',
      currentFlow: 78,
      efficiency: 63,
      status: 'operational',
      technology: 'Extended Aeration',
      stages: ['Primary', 'Secondary'],
      coordinates: { lat: 19.0863, lng: 72.9081 }
    }
  };

  // Generate treatment process data
  const generateProcessData = () => {
    const stages = ['Inlet', 'Primary Treatment', 'Secondary Treatment', 'Tertiary Treatment', 'Outlet'];
    return stages.map((stage, index) => {
      const baseEfficiency = 100 - (index * 15) - Math.random() * 10;
      return {
        stage,
        index: index + 1,
        BOD_removal: Math.max(10, baseEfficiency + Math.random() * 15),
        COD_removal: Math.max(15, baseEfficiency + Math.random() * 12),
        TSS_removal: Math.max(20, baseEfficiency + Math.random() * 18),
        pathogen_removal: Math.max(30, baseEfficiency + Math.random() * 20),
        nutrient_removal: Math.max(5, baseEfficiency + Math.random() * 25),
        energy_consumption: Math.random() * 50 + 20,
        chemical_usage: Math.random() * 30 + 10,
        flow_rate: Math.random() * 20 + 80,
        temperature: 28 + Math.random() * 5,
        pH: 7.2 + (Math.random() - 0.5) * 0.8
      };
    });
  };

  // Generate efficiency timeline
  const generateEfficiencyTimeline = () => {
    const data = [];
    for (let i = 48; i >= 0; i--) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      
      // Simulate treatment efficiency variations
      const baseEfficiency = 75;
      const timeVariation = Math.sin((i / 48) * 4 * Math.PI) * 5;
      const randomVariation = (Math.random() - 0.5) * 8;
      
      // Simulate maintenance events
      const maintenanceEvent = Math.random() < 0.02;
      const powerOutage = Math.random() < 0.005;
      
      const efficiency = Math.max(40, Math.min(95, 
        baseEfficiency + timeVariation + randomVariation - 
        (maintenanceEvent ? 15 : 0) - (powerOutage ? 25 : 0)
      ));
      
      data.push({
        time: date.toISOString(),
        hour: date.getHours(),
        efficiency,
        BOD_removal: efficiency + Math.random() * 5,
        COD_removal: efficiency - Math.random() * 3,
        TSS_removal: efficiency + Math.random() * 8,
        pathogen_removal: Math.min(99.9, efficiency + Math.random() * 10),
        energy_consumption: 100 - efficiency + Math.random() * 20,
        chemical_cost: (100 - efficiency) * 2 + Math.random() * 50,
        flow_rate: 80 + Math.random() * 40,
        maintenanceEvent,
        powerOutage,
        alert: efficiency < 60 || maintenanceEvent || powerOutage
      });
    }
    return data;
  };

  const [processData, setProcessData] = useState(generateProcessData());
  const [efficiencyData, setEfficiencyData] = useState(generateEfficiencyTimeline());

  // Real-time data updates
  useEffect(() => {
    if (!realTimeMode) return;
    
    const interval = setInterval(() => {
      setProcessData(generateProcessData());
      setEfficiencyData(prev => {
        const newData = [...prev.slice(1), {
          ...prev[prev.length - 1],
          time: new Date().toISOString(),
          hour: new Date().getHours(),
          efficiency: Math.max(40, Math.min(95, prev[prev.length - 1].efficiency + (Math.random() - 0.5) * 4)),
          BOD_removal: Math.max(30, Math.min(98, prev[prev.length - 1].BOD_removal + (Math.random() - 0.5) * 3)),
          COD_removal: Math.max(35, Math.min(95, prev[prev.length - 1].COD_removal + (Math.random() - 0.5) * 3)),
          TSS_removal: Math.max(40, Math.min(99, prev[prev.length - 1].TSS_removal + (Math.random() - 0.5) * 4))
        }];
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeMode]);

  // Treatment performance metrics
  const performanceMetrics = {
    overall_efficiency: efficiencyData[efficiencyData.length - 1]?.efficiency || 0,
    BOD_reduction: 88.5,
    COD_reduction: 82.3,
    TSS_reduction: 94.2,
    pathogen_removal: 99.8,
    energy_efficiency: 76.4,
    operational_cost: 245000,
    treated_volume: 2850000,
    compliance_score: 86
  };

  // Treatment stage configuration
  const stageConfig = {
    'Primary Treatment': { 
      color: '#3b82f6', 
      icon: Filter,
      description: 'Physical separation of large solids and particles',
      efficiency: '30-40% BOD reduction'
    },
    'Secondary Treatment': { 
      color: '#10b981', 
      icon: Beaker,
      description: 'Biological treatment using activated sludge',
      efficiency: '80-90% BOD reduction'
    },
    'Tertiary Treatment': { 
      color: '#8b5cf6', 
      icon: Zap,
      description: 'Advanced filtration and disinfection',
      efficiency: '95%+ pathogen removal'
    }
  };

  // Get plant status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentPlant = treatmentPlants[selectedPlant];
  const currentEfficiency = efficiencyData[efficiencyData.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Water Treatment Effectiveness Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                Real-time monitoring and optimization of sewage treatment processes
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={realTimeMode ? "default" : "outline"}
                size="sm"
                onClick={() => setRealTimeMode(!realTimeMode)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {realTimeMode ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {realTimeMode ? 'Pause' : 'Start'} Live
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Plant Selector */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(treatmentPlants).map(([key, plant]) => (
              <Button
                key={key}
                variant={selectedPlant === key ? "default" : "outline"}
                onClick={() => setSelectedPlant(key)}
                className={selectedPlant === key ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                {plant.name}
                <Badge className={`ml-2 ${getStatusColor(plant.status)}`}>
                  {plant.status}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="process-flow">Process Flow</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overall Efficiency', value: `${performanceMetrics.overall_efficiency.toFixed(1)}%`, color: 'text-blue-600', icon: Activity },
              { label: 'BOD Reduction', value: `${performanceMetrics.BOD_reduction}%`, color: 'text-green-600', icon: TrendingUp },
              { label: 'Pathogen Removal', value: `${performanceMetrics.pathogen_removal}%`, color: 'text-purple-600', icon: CheckCircle },
              { label: 'Daily Volume', value: `${(performanceMetrics.treated_volume / 1000000).toFixed(1)}M L`, color: 'text-cyan-600', icon: Droplets }
            ].map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <IconComponent className={`h-8 w-8 mx-auto mb-2 ${metric.color}`} />
                    <div className={`text-2xl font-bold mb-1 ${metric.color}`}>
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Current Plant Status */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-600" />
                {currentPlant.name} - Real-time Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plant Info */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Plant Information</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-semibold">{currentPlant.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Flow:</span>
                        <span className="font-semibold">{currentPlant.currentFlow} MLD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Technology:</span>
                        <span className="font-semibold">{currentPlant.technology}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stages:</span>
                        <span className="font-semibold">{currentPlant.stages.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Current Performance</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overall Efficiency</span>
                        <span className="font-bold text-green-600">{currentPlant.efficiency}%</span>
                      </div>
                      <Progress value={currentPlant.efficiency} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Real-time Metrics */}
                <div className="lg:col-span-2">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={efficiencyData.slice(-24)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="hour" 
                          tickFormatter={(hour) => `${hour}:00`}
                        />
                        <YAxis domain={[40, 100]} />
                        <Tooltip 
                          labelFormatter={(hour) => `${hour}:00`}
                          formatter={(value, name) => [`${value.toFixed(1)}%`, name.replace('_', ' ').toUpperCase()]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="efficiency" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="BOD_removal" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="COD_removal" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Alerts */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                System Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {efficiencyData.slice(-5).reverse().filter(d => d.alert).map((alert, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-orange-800">
                        {alert.maintenanceEvent ? 'Maintenance Required' :
                         alert.powerOutage ? 'Power System Alert' :
                         alert.efficiency < 60 ? 'Low Efficiency Warning' : 'System Alert'}
                      </div>
                      <div className="text-sm text-orange-600">
                        {new Date(alert.time).toLocaleString()} - Efficiency: {alert.efficiency.toFixed(1)}%
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {alert.efficiency < 50 ? 'Critical' : 'Warning'}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-4">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    All systems operating normally
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process-flow" className="space-y-6">
          {/* Treatment Process Visualization */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Treatment Process Flow Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Process Flow Diagram */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg overflow-x-auto">
                  {processData.map((stage, index) => (
                    <div key={index} className="flex items-center">
                      <div className="text-center min-w-32">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2"
                          style={{ 
                            backgroundColor: index === 0 ? '#dc2626' : 
                                           index === processData.length - 1 ? '#16a34a' : '#3b82f6'
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="text-sm font-medium">{stage.stage}</div>
                        <div className="text-xs text-gray-600">
                          {stage.BOD_removal.toFixed(0)}% BOD
                        </div>
                      </div>
                      {index < processData.length - 1 && (
                        <div className="w-8 h-1 bg-blue-300 mx-2 relative">
                          <div className="absolute inset-0 bg-blue-500 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stage Performance Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {processData.slice(1, -1).map((stage, index) => {
                    const config = stageConfig[stage.stage] || { color: '#3b82f6', icon: Beaker };
                    const IconComponent = config.icon;
                    
                    return (
                      <Card key={index} className="border-0 shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <IconComponent className="h-5 w-5 mr-2" style={{ color: config.color }} />
                            {stage.stage}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {config.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>BOD Removal</span>
                                <span className="font-semibold">{stage.BOD_removal.toFixed(1)}%</span>
                              </div>
                              <Progress value={stage.BOD_removal} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>COD Removal</span>
                                <span className="font-semibold">{stage.COD_removal.toFixed(1)}%</span>
                              </div>
                              <Progress value={stage.COD_removal} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>TSS Removal</span>
                                <span className="font-semibold">{stage.TSS_removal.toFixed(1)}%</span>
                              </div>
                              <Progress value={stage.TSS_removal} className="h-2" />
                            </div>
                            
                            <div className="pt-2 border-t text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Energy: {stage.energy_consumption.toFixed(0)} kWh</span>
                                <span>pH: {stage.pH.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Parameters Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Process Parameters Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={processData.slice(1, -1)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="stage" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="BOD Removal" 
                      dataKey="BOD_removal" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3} 
                    />
                    <Radar 
                      name="COD Removal" 
                      dataKey="COD_removal" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3} 
                    />
                    <Radar 
                      name="TSS Removal" 
                      dataKey="TSS_removal" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.3} 
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          {/* Efficiency Trends */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Treatment Efficiency Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis yAxisId="left" domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 150]} />
                    <Tooltip 
                      labelFormatter={(hour) => `${hour}:00`}
                      formatter={(value, name) => [
                        `${value.toFixed(1)}${name.includes('consumption') || name.includes('cost') ? ' units' : '%'}`, 
                        name.replace('_', ' ').toUpperCase()
                      ]}
                    />
                    
                    <Bar 
                      yAxisId="right"
                      dataKey="energy_consumption" 
                      fill="#f59e0b" 
                      fillOpacity={0.3}
                      name="Energy Consumption"
                    />
                    
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      name="Overall Efficiency"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="BOD_removal" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="BOD Removal"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="pathogen_removal" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Pathogen Removal"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost vs Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Cost vs Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="efficiency" name="Efficiency" unit="%" domain={[40, 100]} />
                    <YAxis dataKey="chemical_cost" name="Chemical Cost" unit=" ₹" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [
                        `${value.toFixed(1)}${name.includes('cost') ? ' ₹' : '%'}`, 
                        name === 'efficiency' ? 'Treatment Efficiency' : 'Chemical Cost'
                      ]}
                    />
                    <Scatter dataKey="efficiency" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Recommendations */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                AI-Powered Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    priority: 'High',
                    recommendation: 'Adjust aeration rates in secondary treatment',
                    impact: 'Potential 8% efficiency improvement',
                    savings: '₹45,000/month',
                    implementation: 'Immediate'
                  },
                  {
                    priority: 'Medium',
                    recommendation: 'Optimize chemical dosing in primary clarifiers',
                    impact: 'Reduce chemical costs by 15%',
                    savings: '₹28,000/month',
                    implementation: '1-2 weeks'
                  },
                  {
                    priority: 'Medium',
                    recommendation: 'Implement predictive maintenance for pumps',
                    impact: 'Reduce downtime by 25%',
                    savings: '₹35,000/month',
                    implementation: '1 month'
                  },
                  {
                    priority: 'Low',
                    recommendation: 'Upgrade SCADA system for better monitoring',
                    impact: 'Improve operational visibility',
                    savings: '₹15,000/month',
                    implementation: '3 months'
                  }
                ].map((rec, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {rec.priority} Priority
                        </Badge>
                        <span className="font-semibold">{rec.recommendation}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Implement
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Expected Impact</div>
                        <div className="font-semibold text-green-600">{rec.impact}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Cost Savings</div>
                        <div className="font-semibold text-blue-600">{rec.savings}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Timeline</div>
                        <div className="font-semibold">{rec.implementation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Dashboard */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Environmental Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { parameter: 'BOD Discharge', limit: '30 mg/L', current: '25 mg/L', status: 'compliant' },
                  { parameter: 'COD Discharge', limit: '100 mg/L', current: '85 mg/L', status: 'compliant' },
                  { parameter: 'TSS Discharge', limit: '50 mg/L', current: '45 mg/L', status: 'compliant' },
                  { parameter: 'pH Range', limit: '6.5-8.5', current: '7.2', status: 'compliant' }
                ].map((compliance, index) => (
                  <Card key={index} className="border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-gray-600 mb-1">{compliance.parameter}</div>
                      <div className="text-lg font-bold mb-1">{compliance.current}</div>
                      <div className="text-xs text-gray-500 mb-2">Limit: {compliance.limit}</div>
                      <Badge className={
                        compliance.status === 'compliant' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {compliance.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <div className="font-semibold text-green-800 mb-1">
                  Full Environmental Compliance Achieved
                </div>
                <div className="text-sm text-green-600">
                  All discharge parameters within regulatory limits for the past 30 days
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

WaterTreatmentDashboard.displayName = 'WaterTreatmentDashboard';

export default WaterTreatmentDashboard;