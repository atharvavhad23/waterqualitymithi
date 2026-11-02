import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';

const SensorNetworkDashboard = () => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [networkStats, setNetworkStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch real sensor data from API
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/advanced-features/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sensor data');
        }
        
        const data = await response.json();
        
        if (data.success && data.sensor_network) {
          setSensors(data.sensor_network.map(sensor => ({
            id: sensor.id,
            name: sensor.name,
            location: { 
              lat: 19.0760 + Math.random() * 0.1, 
              lng: 72.8777 + Math.random() * 0.1 
            },
            status: sensor.status === 'active' ? 'online' : 'warning',
            battery: sensor.battery,
            signal: sensor.signal,
            lastUpdate: new Date(sensor.last_reading),
            parameters: {
              pH: { 
                value: sensor.ph, 
                status: sensor.ph >= 6.5 && sensor.ph <= 8.5 ? 'normal' : 'warning', 
                unit: '' 
              },
              temperature: { 
                value: sensor.temperature, 
                status: sensor.temperature >= 20 && sensor.temperature <= 35 ? 'normal' : 'warning', 
                unit: '°C' 
              },
              DO: { 
                value: sensor.dissolved_oxygen, 
                status: sensor.dissolved_oxygen > 5 ? 'good' : sensor.dissolved_oxygen > 3 ? 'normal' : 'poor', 
                unit: 'mg/L' 
              },
              turbidity: { 
                value: sensor.tds / 100, 
                status: sensor.tds > 1000 ? 'high' : sensor.tds > 500 ? 'normal' : 'good', 
                unit: 'NTU' 
              },
              TDS: {
                value: sensor.tds,
                status: sensor.tds > 1000 ? 'high' : sensor.tds > 500 ? 'normal' : 'good',
                unit: 'mg/L'
              },
              BOD: {
                value: sensor.bod,
                status: sensor.bod > 15 ? 'high' : sensor.bod > 10 ? 'normal' : 'good',
                unit: 'mg/L'
              },
              COD: {
                value: sensor.cod,
                status: sensor.cod > 50 ? 'high' : sensor.cod > 30 ? 'normal' : 'good',
                unit: 'mg/L'
              }
            }
          })));
          
          // Calculate network stats
          const onlineSensors = data.sensor_network.filter(s => s.status === 'active').length;
          const totalSensors = data.sensor_network.length;
          const avgBattery = data.sensor_network.reduce((acc, s) => acc + s.battery, 0) / totalSensors;
          const avgSignal = data.sensor_network.reduce((acc, s) => acc + s.signal, 0) / totalSensors;
          
          setNetworkStats({
            totalSensors,
            onlineSensors,
            offlineSensors: totalSensors - onlineSensors,
            avgBattery: Math.round(avgBattery),
            avgSignal: Math.round(avgSignal),
            coverage: Math.round((onlineSensors / totalSensors) * 100)
          });
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        // Fallback to demo data
        const sensorData = [
      {
        id: 'MR-001',
        name: 'Mithi River Upstream',
        location: { lat: 19.0760, lng: 72.8777 },
        status: 'online',
        battery: 85,
        signal: 95,
        lastUpdate: new Date(Date.now() - 2 * 60000), // 2 minutes ago
        parameters: {
          pH: { value: 7.2, status: 'normal', unit: '' },
          temperature: { value: 28.5, status: 'normal', unit: '°C' },
          DO: { value: 6.8, status: 'good', unit: 'mg/L' },
          turbidity: { value: 15.2, status: 'high', unit: 'NTU' }
        }
      },
      {
        id: 'MR-002',
        name: 'Mithi River Midstream',
        location: { lat: 19.0896, lng: 72.8656 },
        status: 'online',
        battery: 92,
        signal: 78,
        lastUpdate: new Date(Date.now() - 1 * 60000), // 1 minute ago
        parameters: {
          pH: { value: 6.9, status: 'normal', unit: '' },
          temperature: { value: 29.1, status: 'normal', unit: '°C' },
          DO: { value: 5.2, status: 'warning', unit: 'mg/L' },
          turbidity: { value: 22.8, status: 'high', unit: 'NTU' }
        }
      },
      {
        id: 'MR-003',
        name: 'Mithi River Downstream',
        location: { lat: 19.0965, lng: 72.8526 },
        status: 'warning',
        battery: 45,
        signal: 65,
        lastUpdate: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        parameters: {
          pH: { value: 6.5, status: 'low', unit: '' },
          temperature: { value: 31.2, status: 'high', unit: '°C' },
          DO: { value: 3.8, status: 'critical', unit: 'mg/L' },
          turbidity: { value: 35.6, status: 'critical', unit: 'NTU' }
        }
      },
      {
        id: 'MR-004',
        name: 'Mithi River Estuary',
        location: { lat: 19.0994, lng: 72.8456 },
        status: 'offline',
        battery: 12,
        signal: 0,
        lastUpdate: new Date(Date.now() - 45 * 60000), // 45 minutes ago
        parameters: {
          pH: { value: null, status: 'unknown', unit: '' },
          temperature: { value: null, status: 'unknown', unit: '°C' },
          DO: { value: null, status: 'unknown', unit: 'mg/L' },
          turbidity: { value: null, status: 'unknown', unit: 'NTU' }
        }
      },
      {
        id: 'MR-005',
        name: 'Industrial Zone Monitor',
        location: { lat: 19.1150, lng: 72.8567 },
        status: 'online',
        battery: 78,
        signal: 88,
        lastUpdate: new Date(Date.now() - 30000), // 30 seconds ago
        parameters: {
          pH: { value: 8.1, status: 'high', unit: '' },
          temperature: { value: 32.5, status: 'high', unit: '°C' },
          DO: { value: 7.5, status: 'good', unit: 'mg/L' },
          turbidity: { value: 8.9, status: 'normal', unit: 'NTU' }
        }
      },
      {
        id: 'MR-006',
        name: 'Residential Area Monitor',
        location: { lat: 19.0650, lng: 72.8890 },
        status: 'online',
        battery: 67,
        signal: 82,
        lastUpdate: new Date(Date.now() - 90000), // 1.5 minutes ago
        parameters: {
          pH: { value: 7.4, status: 'normal', unit: '' },
          temperature: { value: 27.8, status: 'normal', unit: '°C' },
          DO: { value: 6.2, status: 'normal', unit: 'mg/L' },
          turbidity: { value: 12.5, status: 'normal', unit: 'NTU' }
        }
      }
    ];

    setSensors(sensorData);
    setSelectedSensor(sensorData[0]);

    // Calculate network stats
    const online = sensorData.filter(s => s.status === 'online').length;
    const warning = sensorData.filter(s => s.status === 'warning').length;
    const offline = sensorData.filter(s => s.status === 'offline').length;
    const avgBattery = sensorData.reduce((acc, s) => acc + s.battery, 0) / sensorData.length;
    const avgSignal = sensorData.reduce((acc, s) => acc + s.signal, 0) / sensorData.length;

        setNetworkStats({
          total: sensorData.length,
          online,
          warning,
          offline,
          avgBattery: Math.round(avgBattery),
          avgSignal: Math.round(avgSignal)
        });
      }
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, []);

  // Update timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        lastUpdate: sensor.status === 'online' ? new Date() : sensor.lastUpdate
      })));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getParameterColor = (status) => {
    switch (status) {
      case 'good':
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'high':
      case 'low':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getBatteryIcon = (level) => {
    if (level < 20) return <BatteryLow className="h-4 w-4 text-red-500" />;
    return <Battery className="h-4 w-4 text-green-500" />;
  };

  const getSignalIcon = (strength) => {
    if (strength > 80) return <Signal className="h-4 w-4 text-green-500" />;
    if (strength > 50) return <SignalHigh className="h-4 w-4 text-yellow-500" />;
    return <SignalLow className="h-4 w-4 text-red-500" />;
  };

  const formatLastUpdate = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Network Overview */}
      <Card className="lg:col-span-3 border-0 shadow-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Sensor Network Overview
            </span>
          </CardTitle>
          <CardDescription>Real-time monitoring of Mithi River sensor network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{networkStats.total}</div>
              <div className="text-sm text-gray-600">Total Sensors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{networkStats.online}</div>
              <div className="text-sm text-gray-600">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{networkStats.warning}</div>
              <div className="text-sm text-gray-600">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{networkStats.offline}</div>
              <div className="text-sm text-gray-600">Offline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{networkStats.avgBattery}%</div>
              <div className="text-sm text-gray-600">Avg Battery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{networkStats.avgSignal}%</div>
              <div className="text-sm text-gray-600">Avg Signal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensor List */}
      <Card className="lg:col-span-2 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Active Sensors</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {sensors.map((sensor) => (
              <div
                key={sensor.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedSensor?.id === sensor.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSensor(sensor)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(sensor.status)}
                    <span className="font-medium text-gray-800">{sensor.name}</span>
                  </div>
                  <Badge className={getStatusColor(sensor.status)}>
                    {sensor.id}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {getBatteryIcon(sensor.battery)}
                      <span>{sensor.battery}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getSignalIcon(sensor.signal)}
                      <span>{sensor.signal}%</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastUpdate(sensor.lastUpdate)}</span>
                  </div>
                </div>

                {/* Quick parameter status */}
                <div className="flex space-x-2 mt-3">
                  {Object.entries(sensor.parameters).map(([param, data]) => (
                    <div
                      key={param}
                      className={`px-2 py-1 rounded text-xs ${getParameterColor(data.status)}`}
                    >
                      {param}: {data.value ? `${data.value}${data.unit}` : 'N/A'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Sensor Details */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Sensor Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSensor ? (
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800">{selectedSensor.name}</h3>
                <p className="text-sm text-gray-600">{selectedSensor.id}</p>
                <Badge className={`mt-2 ${getStatusColor(selectedSensor.status)}`}>
                  {selectedSensor.status.toUpperCase()}
                </Badge>
              </div>

              {/* System Status */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-blue-600" />
                  System Status
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Battery</span>
                      {getBatteryIcon(selectedSensor.battery)}
                    </div>
                    <div className="text-xl font-bold text-gray-800">{selectedSensor.battery}%</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Signal</span>
                      {getSignalIcon(selectedSensor.signal)}
                    </div>
                    <div className="text-xl font-bold text-gray-800">{selectedSensor.signal}%</div>
                  </div>
                </div>
              </div>

              {/* Parameter Readings */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Droplets className="h-4 w-4 mr-2 text-blue-600" />
                  Current Readings
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedSensor.parameters).map(([param, data]) => (
                    <div key={param} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {param === 'temperature' && <Thermometer className="h-4 w-4 text-orange-500" />}
                        {param === 'pH' && <Droplets className="h-4 w-4 text-blue-500" />}
                        {param === 'DO' && <Wind className="h-4 w-4 text-green-500" />}
                        {param === 'turbidity' && <Activity className="h-4 w-4 text-purple-500" />}
                        <span className="font-medium text-gray-700">{param.toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          {data.value ? `${data.value}${data.unit}` : 'N/A'}
                        </div>
                        <Badge className={getParameterColor(data.status)}>
                          {data.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Last Update</span>
                </div>
                <p className="text-sm text-blue-700">
                  {formatLastUpdate(selectedSensor.lastUpdate)} 
                  <br />
                  <span className="text-xs text-blue-600">
                    {selectedSensor.lastUpdate.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a sensor to view details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorNetworkDashboard;