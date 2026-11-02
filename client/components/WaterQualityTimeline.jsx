import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  Filter,
  RotateCcw,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, ScatterChart, Scatter } from 'recharts';

const WaterQualityTimeline = React.memo(() => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [selectedParameters, setSelectedParameters] = useState(['pH', 'DO', 'temperature']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Memoized data generation for better performance
  const generateTimelineData = useCallback((months = 1) => {
    const data = [];
    const now = new Date();
    const daysToShow = months * 30;
    
    for (let i = daysToShow; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      
      // Seasonal patterns
      const seasonalPH = 7.0 + Math.sin((dayOfYear / 365) * 2 * Math.PI) * 0.5;
      const seasonalTemp = 25 + Math.sin((dayOfYear / 365) * 2 * Math.PI + Math.PI) * 8;
      const seasonalDO = 7.5 - Math.sin((dayOfYear / 365) * 2 * Math.PI) * 2;
      
      // Add pollution events
      const pollutionEvent = Math.random() < 0.05 ? 1 : 0; // 5% chance of pollution
      const rainEffect = Math.sin(dayOfYear * 0.1) > 0.8 ? 1 : 0; // Rain events
      
      data.push({
        date: date.toISOString().split('T')[0],
        fullDate: date,
        pH: seasonalPH + (Math.random() - 0.5) * 0.3 - pollutionEvent * 0.8,
        DO: seasonalDO + (Math.random() - 0.5) * 1.0 - pollutionEvent * 2.0 + rainEffect * 1.5,
        temperature: seasonalTemp + (Math.random() - 0.5) * 2.0,
        BOD: 15 + Math.random() * 10 + pollutionEvent * 25,
        COD: 35 + Math.random() * 20 + pollutionEvent * 50,
        turbidity: 12 + Math.random() * 8 + pollutionEvent * 30 + rainEffect * 15,
        TDS: 280 + Math.random() * 50 + pollutionEvent * 100,
        WQI: Math.max(20, Math.min(100, 75 - pollutionEvent * 30 + rainEffect * 10 + Math.random() * 10)),
        pollutionEvent,
        rainEvent: rainEffect,
        monsoon: Math.sin((dayOfYear / 365) * 2 * Math.PI + Math.PI * 0.5) > 0.3 ? 1 : 0
      });
    }
    
    return data;
  }, []);

  // Memoized timeline data generation
  const timelineData = useMemo(() => {
    const months = selectedTimeframe === '1W' ? 0.25 : 
                   selectedTimeframe === '1M' ? 1 : 
                   selectedTimeframe === '3M' ? 3 : 
                   selectedTimeframe === '6M' ? 6 : 12;
    return generateTimelineData(months);
  }, [selectedTimeframe, generateTimelineData]);

  // Reset current index when timeframe changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedTimeframe]);

  // Animation for timeline playback
  useEffect(() => {
    let interval;
    if (isPlaying && currentIndex < timelineData.length - 1) {
      // Reduced frequency for better performance: 200ms -> 500ms
      interval = setInterval(() => {
        setCurrentIndex(prev => prev + 1);
      }, 500);
    } else if (currentIndex >= timelineData.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, timelineData.length]);

  const parameterConfig = {
    pH: { color: '#3b82f6', unit: '', icon: Droplets, range: [6, 9] },
    DO: { color: '#10b981', unit: 'mg/L', icon: Wind, range: [0, 15] },
    temperature: { color: '#f59e0b', unit: '°C', icon: Thermometer, range: [15, 40] },
    BOD: { color: '#ef4444', unit: 'mg/L', icon: Activity, range: [0, 50] },
    COD: { color: '#8b5cf6', unit: 'mg/L', icon: Activity, range: [0, 100] },
    turbidity: { color: '#f97316', unit: 'NTU', icon: Activity, range: [0, 100] },
    WQI: { color: '#06b6d4', unit: '', icon: Activity, range: [0, 100] }
  };

  const toggleParameter = (param) => {
    setSelectedParameters(prev => 
      prev.includes(param) 
        ? prev.filter(p => p !== param)
        : [...prev, param]
    );
  };

  const getParameterStatus = (value, param) => {
    const config = parameterConfig[param];
    if (!config) return 'normal';
    
    if (param === 'pH') {
      return value >= 6.5 && value <= 8.5 ? 'good' : 'warning';
    } else if (param === 'DO') {
      return value >= 5 ? 'good' : 'critical';
    } else if (param === 'WQI') {
      return value >= 70 ? 'good' : value >= 50 ? 'warning' : 'critical';
    } else {
      return value <= config.range[1] * 0.7 ? 'good' : 'warning';
    }
  };

  const getEventColor = (dataPoint) => {
    if (dataPoint.pollutionEvent) return '#ef4444';
    if (dataPoint.rainEvent) return '#06b6d4';
    if (dataPoint.monsoon) return '#10b981';
    return 'transparent';
  };

  const currentData = timelineData[currentIndex] || timelineData[0];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Water Quality Timeline & Historical Analysis
              </CardTitle>
              <CardDescription className="text-gray-600">
                Comprehensive temporal analysis of Mithi River water quality with event tracking
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="border-purple-200 hover:bg-purple-50"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'} Timeline
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(0)}
                className="border-purple-200 hover:bg-purple-50"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-200 hover:bg-purple-50"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeframe & Parameter Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Time Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['1W', '1M', '3M', '6M', '1Y'].map(period => (
                <Button
                  key={period}
                  variant={selectedTimeframe === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(period)}
                  className={selectedTimeframe === period ? 'bg-purple-500 text-white' : ''}
                >
                  {period === '1W' ? 'Last Week' :
                   period === '1M' ? 'Last Month' :
                   period === '3M' ? 'Last 3 Months' :
                   period === '6M' ? 'Last 6 Months' : 'Last Year'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.keys(parameterConfig).map(param => {
                const config = parameterConfig[param];
                const IconComponent = config.icon;
                return (
                  <Button
                    key={param}
                    variant={selectedParameters.includes(param) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleParameter(param)}
                    className={selectedParameters.includes(param) ? 'text-white' : ''}
                    style={{ 
                      backgroundColor: selectedParameters.includes(param) ? config.color : 'transparent',
                      borderColor: config.color
                    }}
                  >
                    <IconComponent className="h-3 w-3 mr-1" />
                    {param.toUpperCase()}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Timeline Chart */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Multi-Parameter Timeline</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 10))}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {currentIndex + 1} / {timelineData.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(Math.min(timelineData.length - 1, currentIndex + 10))}
                disabled={currentIndex >= timelineData.length - 1}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timelineData.slice(0, currentIndex + 1)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={10}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                
                {selectedParameters.map(param => (
                  <Line
                    key={param}
                    type="monotone"
                    dataKey={param}
                    stroke={parameterConfig[param].color}
                    strokeWidth={2}
                    dot={{ fill: parameterConfig[param].color, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: parameterConfig[param].color }}
                    connectNulls={false}
                  />
                ))}
                
                {/* Event markers */}
                <Bar 
                  dataKey="pollutionEvent" 
                  fill="rgba(239, 68, 68, 0.3)"
                  yAxisId="events"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Current Status & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Readings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Current Readings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedParameters.slice(0, 4).map(param => {
                const value = currentData[param];
                const config = parameterConfig[param];
                const status = getParameterStatus(value, param);
                return (
                  <div key={param} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <config.icon className="h-4 w-4" style={{ color: config.color }} />
                      <span className="font-medium">{param.toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: config.color }}>
                        {value?.toFixed(1)}{config.unit}
                      </div>
                      <Badge className={
                        status === 'good' ? 'bg-green-100 text-green-800' :
                        status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Event Timeline */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timelineData.slice(-5).reverse().map((dataPoint, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getEventColor(dataPoint) }}
                  ></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {dataPoint.pollutionEvent ? '⚠️ Pollution Detected' :
                       dataPoint.rainEvent ? '🌧️ Heavy Rain Event' :
                       dataPoint.monsoon ? '🌊 Monsoon Period' : '✅ Normal Conditions'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(dataPoint.fullDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Timeline Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {timelineData.filter(d => d.pollutionEvent).length}
                </div>
                <div className="text-sm text-gray-600">Pollution Events</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(timelineData.reduce((acc, d) => acc + d.WQI, 0) / timelineData.length)}
                </div>
                <div className="text-sm text-gray-600">Average WQI</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((timelineData.filter(d => d.WQI >= 70).length / timelineData.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Good Quality Days</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {timelineData.filter(d => d.rainEvent || d.monsoon).length}
                </div>
                <div className="text-sm text-gray-600">Rain Events</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

WaterQualityTimeline.displayName = 'WaterQualityTimeline';

export default WaterQualityTimeline;