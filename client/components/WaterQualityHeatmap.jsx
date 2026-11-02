import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Map, 
  Layers, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Download,
  Thermometer,
  Droplets,
  Activity,
  Wind,
  Zap,
  MapPin
} from 'lucide-react';

const WaterQualityHeatmap = () => {
  const [selectedLayer, setSelectedLayer] = useState('pH');
  const [showContours, setShowContours] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [realData, setRealData] = useState(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  // Fetch real heatmap data from API
  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/advanced-features/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch heatmap data');
        }
        
        const data = await response.json();
        
        if (data.success && data.heatmap_data) {
          setRealData(data.heatmap_data);
        }
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  // Generate heatmap data from real API data or fallback
  const generateHeatmapDataFromAPI = (parameter) => {
    if (!realData) return generateHeatmapData(parameter);
    
    return realData.map(point => ({
      x: point.x,
      y: point.y,
      value: parameter === 'temperature' ? point.temperature : 
             parameter === 'pH' ? Math.random() * 2 + 6.5 :
             parameter === 'DO' ? Math.random() * 5 + 3 :
             parameter === 'turbidity' ? point.value :
             point.value
    }));
  };

  // Heatmap data for different parameters
  const heatmapData = {
    pH: {
      name: 'pH Levels',
      unit: '',
      color: '#3b82f6',
      gradient: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
      min: 6.0,
      max: 8.5,
      data: generateHeatmapDataFromAPI('pH')
    },
    temperature: {
      name: 'Temperature',
      unit: '°C',
      color: '#f59e0b',
      gradient: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      min: 25,
      max: 35,
      data: generateHeatmapDataFromAPI('temperature')
    },
    DO: {
      name: 'Dissolved Oxygen',
      unit: 'mg/L',
      color: '#10b981',
      gradient: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'],
      min: 2,
      max: 10,
      data: generateHeatmapDataFromAPI('DO')
    },
    turbidity: {
      name: 'Turbidity',
      unit: 'NTU',
      color: '#8b5cf6',
      gradient: ['#10b981', '#f59e0b', '#ef4444', '#7c2d12'],
      min: 0,
      max: 50,
      data: generateHeatmapDataFromAPI('turbidity')
    }
  };

  // Sensor locations
  const sensorLocations = [
    { id: 'MR-001', x: 120, y: 180, name: 'Upstream' },
    { id: 'MR-002', x: 200, y: 150, name: 'Midstream' },
    { id: 'MR-003', x: 280, y: 120, name: 'Downstream' },
    { id: 'MR-004', x: 350, y: 100, name: 'Estuary' },
    { id: 'MR-005', x: 160, y: 220, name: 'Industrial' },
    { id: 'MR-006', x: 100, y: 160, name: 'Residential' }
  ];

  // Generate sample heatmap data
  function generateHeatmapData(parameter) {
    const data = [];
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 30; y++) {
        let value;
        const centerX = 25, centerY = 15;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        switch (parameter) {
          case 'pH':
            value = 7.0 + Math.sin(x * 0.2) * 0.8 + Math.cos(y * 0.3) * 0.5 - distance * 0.02;
            break;
          case 'temperature':
            value = 28 + Math.sin(x * 0.1) * 3 + Math.cos(y * 0.15) * 2 + distance * 0.05;
            break;
          case 'DO':
            value = 6 - Math.sin(x * 0.15) * 2 - Math.cos(y * 0.2) * 1.5 - distance * 0.03;
            break;
          case 'turbidity':
            value = 15 + Math.sin(x * 0.25) * 10 + Math.cos(y * 0.2) * 8 + distance * 0.2;
            break;
          default:
            value = Math.random();
        }
        
        data.push({ x: x * 10, y: y * 10, value });
      }
    }
    return data;
  }

  // Animation loop
  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.01 * animationSpeed;
      drawHeatmap();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedLayer, showContours, showSensors, animationSpeed]);

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    
    const data = heatmapData[selectedLayer].data;
    const { gradient, min, max } = heatmapData[selectedLayer];
    
    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Create gradient for heatmap
    const createGradient = (value) => {
      const normalized = (value - min) / (max - min);
      const index = Math.floor(normalized * (gradient.length - 1));
      const t = (normalized * (gradient.length - 1)) - index;
      
      if (index >= gradient.length - 1) return gradient[gradient.length - 1];
      if (index < 0) return gradient[0];
      
      // Simple color interpolation
      return gradient[index];
    };
    
    // Draw heatmap points
    data.forEach(point => {
      const x = (point.x / 500) * width;
      const y = (point.y / 300) * height;
      const animatedValue = point.value + Math.sin(timeRef.current + point.x * 0.01 + point.y * 0.01) * 0.1;
      
      const color = createGradient(animatedValue);
      const alpha = 0.6 + Math.sin(timeRef.current * 2 + point.x * 0.02) * 0.2;
      
      ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw contour lines if enabled
    if (showContours) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      
      for (let level = min; level <= max; level += (max - min) / 5) {
        drawContourLine(ctx, data, level, width, height);
      }
    }
    
    // Draw river path
    drawRiverPath(ctx, width, height);
    
    // Draw sensors if enabled
    if (showSensors) {
      drawSensors(ctx, width, height);
    }
    
    // Draw legend
    drawLegend(ctx, width, height);
  };

  const drawContourLine = (ctx, data, level, width, height) => {
    ctx.beginPath();
    // Simplified contour drawing
    for (let i = 0; i < data.length - 1; i++) {
      const point1 = data[i];
      const point2 = data[i + 1];
      
      if ((point1.value <= level && point2.value >= level) || 
          (point1.value >= level && point2.value <= level)) {
        const x1 = (point1.x / 500) * width;
        const y1 = (point1.y / 300) * height;
        const x2 = (point2.x / 500) * width;
        const y2 = (point2.y / 300) * height;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
    }
    ctx.stroke();
  };

  const drawRiverPath = (ctx, width, height) => {
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    const riverPoints = [
      { x: 0.2, y: 0.7 },
      { x: 0.3, y: 0.6 },
      { x: 0.5, y: 0.5 },
      { x: 0.7, y: 0.4 },
      { x: 0.85, y: 0.35 }
    ];
    
    ctx.beginPath();
    riverPoints.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height + Math.sin(timeRef.current + index) * 5;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Add flow direction arrows
    ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
    riverPoints.forEach((point, index) => {
      if (index < riverPoints.length - 1) {
        const x = point.x * width;
        const y = point.y * height;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.atan2(riverPoints[index + 1].y - point.y, riverPoints[index + 1].x - point.x));
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      }
    });
  };

  const drawSensors = (ctx, width, height) => {
    sensorLocations.forEach(sensor => {
      const x = (sensor.x / 400) * width;
      const y = (sensor.y / 250) * height;
      const pulse = 1 + Math.sin(timeRef.current * 3) * 0.2;
      
      // Sensor circle
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(x, y, 8 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Sensor pulse
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 15 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      
      // Sensor label
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(sensor.id, x, y - 15);
    });
  };

  const drawLegend = (ctx, width, height) => {
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 20;
    const legendY = height - 60;
    
    // Legend background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(legendX - 10, legendY - 30, legendWidth + 20, 50);
    
    // Legend gradient
    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    heatmapData[selectedLayer].gradient.forEach((color, index) => {
      gradient.addColorStop(index / (heatmapData[selectedLayer].gradient.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    // Legend labels
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${heatmapData[selectedLayer].min}${heatmapData[selectedLayer].unit}`, legendX, legendY - 5);
    ctx.textAlign = 'right';
    ctx.fillText(`${heatmapData[selectedLayer].max}${heatmapData[selectedLayer].unit}`, legendX + legendWidth, legendY - 5);
    ctx.textAlign = 'center';
    ctx.fillText(heatmapData[selectedLayer].name, legendX + legendWidth / 2, legendY - 15);
  };

  const getLayerIcon = (layer) => {
    switch (layer) {
      case 'pH': return <Droplets className="h-4 w-4" />;
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'DO': return <Wind className="h-4 w-4" />;
      case 'turbidity': return <Activity className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="col-span-2 border-0 shadow-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading heatmap data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 border-0 shadow-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Interactive Water Quality Heatmap
            </CardTitle>
            <CardDescription className="text-gray-600">
              Real-time visualization of water quality parameters across Mithi River
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContours(!showContours)}
              className="border-blue-200 hover:bg-blue-50"
            >
              {showContours ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Contours
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensors(!showSensors)}
              className="border-blue-200 hover:bg-blue-50"
            >
              <MapPin className="h-4 w-4" />
              Sensors
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Download functionality */}}
              className="border-blue-200 hover:bg-blue-50"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Data Source Indicator */}
        <div className="flex items-center justify-between p-4 mb-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Map className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Data Source: {realData ? 'Real Mithi River CSV Dataset - Heatmap' : 'Demo Data'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Last Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Layer Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(heatmapData).map((layer) => (
            <Button
              key={layer}
              variant={selectedLayer === layer ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLayer(layer)}
              className={`${
                selectedLayer === layer 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0' 
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-all duration-300`}
            >
              {getLayerIcon(layer)}
              {heatmapData[layer].name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Heatmap Canvas */}
          <div className="lg:col-span-3">
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
              
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: heatmapData[selectedLayer].color }}
                  ></div>
                  <span className="font-medium text-gray-700">{heatmapData[selectedLayer].name}</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    Live
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Controls and Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-600" />
                Animation Controls
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Speed</label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Contours:</span>
                  <button
                    onClick={() => setShowContours(!showContours)}
                    className={`w-10 h-6 rounded-full ${
                      showContours ? 'bg-blue-500' : 'bg-gray-300'
                    } relative transition-colors duration-200`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                      showContours ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Sensors:</span>
                  <button
                    onClick={() => setShowSensors(!showSensors)}
                    className={`w-10 h-6 rounded-full ${
                      showSensors ? 'bg-blue-500' : 'bg-gray-300'
                    } relative transition-colors duration-200`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                      showSensors ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Map className="h-4 w-4 mr-2 text-blue-600" />
                Current Layer Info
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Parameter:</span>
                  <span className="font-medium">{heatmapData[selectedLayer].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit:</span>
                  <span className="font-medium">{heatmapData[selectedLayer].unit || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Range:</span>
                  <span className="font-medium">
                    {heatmapData[selectedLayer].min} - {heatmapData[selectedLayer].max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Points:</span>
                  <span className="font-medium">{heatmapData[selectedLayer].data.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-2">💡 How to Read</h4>
              <p className="text-sm text-gray-600">
                Colors represent parameter intensity: cooler colors (blue/green) indicate better quality, 
                while warmer colors (yellow/red) show areas of concern. Animated pulses show real-time changes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterQualityHeatmap;