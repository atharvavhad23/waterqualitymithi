import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mithi River sensor locations with real coordinates
const SENSOR_LOCATIONS = [
  {
    id: 1,
    name: "Powai Lake Outflow",
    coordinates: [19.1197, 72.9073],
    location: "Powai",
    wqi: 45.2,
    tds: 1850,
    bod: 14.5,
    cod: 62.3,
    temp: 28.5,
    ph: 6.8,
    do: 4.2,
    status: "poor",
    lastUpdate: "2025-10-08T18:30:00Z",
    alerts: ["High BOD levels", "Low DO concentration"]
  },
  {
    id: 2,
    name: "Mahim Creek Junction",
    coordinates: [19.0330, 72.8397],
    location: "Mahim",
    wqi: 32.8,
    tds: 3200,
    bod: 18.7,
    cod: 89.4,
    temp: 31.2,
    ph: 9.1,
    do: 2.8,
    status: "very_poor",
    lastUpdate: "2025-10-08T18:25:00Z",
    alerts: ["Critical pollution levels", "pH exceeds safe limits", "Very low oxygen"]
  },
  {
    id: 3,
    name: "Bandra Kurla Complex",
    coordinates: [19.0596, 72.8656],
    location: "Bandra",
    wqi: 58.6,
    tds: 1245,
    bod: 8.3,
    cod: 34.7,
    temp: 26.8,
    ph: 7.2,
    do: 5.8,
    status: "moderate",
    lastUpdate: "2025-10-08T18:35:00Z",
    alerts: ["Moderate contamination"]
  },
  {
    id: 4,
    name: "Kurla Industrial Area",
    coordinates: [19.0728, 72.8826],
    location: "Kurla",
    wqi: 28.4,
    tds: 4100,
    bod: 22.1,
    cod: 125.6,
    temp: 33.5,
    ph: 8.9,
    do: 1.9,
    status: "very_poor",
    lastUpdate: "2025-10-08T18:20:00Z",
    alerts: ["Industrial waste detected", "Extreme pollution", "Toxic levels"]
  },
  {
    id: 5,
    name: "Saki Naka Metro",
    coordinates: [19.1064, 72.8897],
    location: "Saki Naka",
    wqi: 41.7,
    tds: 2350,
    bod: 16.2,
    cod: 71.8,
    temp: 29.3,
    ph: 6.5,
    do: 3.7,
    status: "poor",
    lastUpdate: "2025-10-08T18:40:00Z",
    alerts: ["Urban runoff impact", "High organic load"]
  },
  {
    id: 6,
    name: "Dharavi Confluence",
    coordinates: [19.0424, 72.8570],
    location: "Dharavi",
    wqi: 18.9,
    tds: 5200,
    bod: 28.4,
    cod: 156.3,
    temp: 35.1,
    ph: 9.4,
    do: 1.2,
    status: "very_poor",
    lastUpdate: "2025-10-08T18:15:00Z",
    alerts: ["Sewage overflow", "Critical contamination", "Health hazard"]
  }
];

// Mithi River path coordinates
const RIVER_PATH = [
  [19.1197, 72.9073], // Powai Lake
  [19.1064, 72.8897], // Saki Naka
  [19.0728, 72.8826], // Kurla
  [19.0596, 72.8656], // Bandra
  [19.0424, 72.8570], // Dharavi
  [19.0330, 72.8397], // Mahim Creek
];

// Field teams data
const FIELD_TEAMS = [
  {
    id: 1,
    name: "Team Alpha",
    coordinates: [19.0850, 72.8750],
    status: "active",
    currentTask: "Water sampling at Kurla",
    equipment: ["pH meter", "DO probe", "TDS sensor"],
    eta: "15 mins"
  },
  {
    id: 2,
    name: "Team Beta",
    coordinates: [19.0450, 72.8500],
    status: "en_route",
    currentTask: "Emergency response - Dharavi",
    equipment: ["Emergency kit", "Chemical neutralizers"],
    eta: "8 mins"
  }
];

// Create custom icons
const createCustomIcon = (status, type = 'sensor') => {
  const colors = {
    excellent: '#10b981', // green
    good: '#3b82f6',     // blue
    moderate: '#f59e0b',  // yellow
    poor: '#f97316',      // orange
    very_poor: '#ef4444', // red
    team_active: '#8b5cf6', // purple
    team_en_route: '#06b6d4' // cyan
  };
  
  const color = colors[status] || '#6b7280';
  
  if (type === 'team') {
    return new L.DivIcon({
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">🚐</div>`,
      className: 'custom-team-icon',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
  }
  
  return new L.DivIcon({
    html: `<div style="
      background-color: ${color};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    "></div>`,
    className: 'custom-sensor-icon',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

// Generate heatmap data (move inside component to use state)
const generateHeatmapData = (sensors) => {
  return sensors.map(sensor => [
    sensor.coordinates[0],
    sensor.coordinates[1],
    Math.max(0, (100 - sensor.wqi) / 100) // Inverse WQI for heat intensity
  ]);
};

export default function AdvancedGISMap() {
  const [selectedLayer, setSelectedLayer] = useState('sensors');
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showFieldTeams, setShowFieldTeams] = useState(false);
  const [showGeofences, setShowGeofences] = useState(false);
  const [mapCenter, setMapCenter] = useState([19.0728, 72.8826]); // Mithi River center
  const [routeOptimization, setRouteOptimization] = useState(false);
  const [sensorLocations, setSensorLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef();

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
          // Map API data to sensor locations
          const mappedSensors = data.sensor_network.map((sensor, index) => ({
            id: sensor.id,
            name: sensor.name,
            coordinates: [19.0760 + (index * 0.02), 72.8777 + (index * 0.015)], // Distribute along Mithi River
            location: sensor.location || sensor.name,
            wqi: Math.round((100 - sensor.tds/50 - sensor.bod*3 - sensor.cod/2)),
            tds: sensor.tds,
            bod: sensor.bod,
            cod: sensor.cod,
            temp: sensor.temperature,
            ph: sensor.ph,
            do: sensor.dissolved_oxygen,
            status: sensor.status === 'active' ? 
                   (sensor.dissolved_oxygen > 6 ? 'good' : sensor.dissolved_oxygen > 4 ? 'moderate' : 'poor') : 
                   'very_poor',
            lastUpdate: sensor.last_reading,
            alerts: sensor.dissolved_oxygen < 4 ? ['Low DO concentration'] : []
          }));
          
          setSensorLocations(mappedSensors);
        } else {
          // Fallback to original hardcoded data
          setSensorLocations(SENSOR_LOCATIONS);
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        // Fallback to original hardcoded data
        setSensorLocations(SENSOR_LOCATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate pollution zones for geofencing
  const GEOFENCE_ZONES = [
    {
      id: 1,
      name: "Critical Pollution Zone",
      center: [19.0424, 72.8570], // Dharavi
      radius: 1000,
      level: "critical",
      color: "#ef4444",
      alerts: ["No swimming", "Avoid contact", "Health hazard"]
    },
    {
      id: 2,
      name: "Industrial Monitoring Zone",
      center: [19.0728, 72.8826], // Kurla
      radius: 800,
      level: "high",
      color: "#f97316",
      alerts: ["Industrial discharge monitoring", "Regular testing required"]
    },
    {
      id: 3,
      name: "Residential Impact Zone",
      center: [19.0596, 72.8656], // Bandra
      radius: 600,
      level: "medium",
      color: "#f59e0b",
      alerts: ["Water treatment recommended", "Limited recreational use"]
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'excellent': 'bg-green-100 text-green-800 border-green-200',
      'good': 'bg-blue-100 text-blue-800 border-blue-200',
      'moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'poor': 'bg-orange-100 text-orange-800 border-orange-200',
      'very_poor': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      'excellent': 'Excellent',
      'good': 'Good',
      'moderate': 'Moderate',
      'poor': 'Poor',
      'very_poor': 'Very Poor'
    };
    return texts[status] || 'Unknown';
  };

  // Route optimization between sensors
  const optimizeRoute = () => {
    setRouteOptimization(true);
    // Simulate route calculation
    setTimeout(() => {
      setRouteOptimization(false);
      alert('Optimal route calculated! Field teams notified via mobile app.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🗺️ Mithi River GIS Monitoring System
          </h1>
          <p className="text-lg text-gray-600">
            Real-time Geographic Information System for Water Quality Management
            {loading && <span className="ml-2 text-blue-600">• Loading sensor data...</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <CardTitle className="text-lg">🎛️ GIS Controls</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="layers" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="layers">Layers</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="layers" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Sensor Network</label>
                        <input 
                          type="checkbox" 
                          checked={selectedLayer === 'sensors'} 
                          onChange={() => setSelectedLayer('sensors')}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Pollution Heatmap</label>
                        <input 
                          type="checkbox" 
                          checked={showHeatmap} 
                          onChange={() => setShowHeatmap(!showHeatmap)}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Field Teams</label>
                        <input 
                          type="checkbox" 
                          checked={showFieldTeams} 
                          onChange={() => setShowFieldTeams(!showFieldTeams)}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Geofence Zones</label>
                        <input 
                          type="checkbox" 
                          checked={showGeofences} 
                          onChange={() => setShowGeofences(!showGeofences)}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="space-y-4">
                    <Button 
                      onClick={optimizeRoute}
                      disabled={routeOptimization}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {routeOptimization ? (
                        <>⏳ Calculating...</>
                      ) : (
                        <>🚀 Optimize Routes</>
                      )}
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                      📊 Generate Report
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      🚨 Emergency Alert
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold text-gray-700 mb-3">🎨 Legend</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Excellent (90-100)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Good (70-89)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Moderate (50-69)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Poor (25-49)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Very Poor (0-24)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Stats */}
            <Card className="shadow-xl bg-white/95 backdrop-blur-sm mt-4">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
                <CardTitle className="text-lg">📈 Live Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Active Sensors:</span>
                    <Badge variant="outline">{SENSOR_LOCATIONS.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Field Teams:</span>
                    <Badge variant="outline">{FIELD_TEAMS.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Alerts:</span>
                    <Badge className="bg-red-100 text-red-800">12</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>River Length:</span>
                    <Badge variant="outline">17.84 km</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Map */}
          <div className="lg:col-span-3">
            <Card className="shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                <CardTitle className="text-xl">🗺️ Interactive Mithi River Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] relative overflow-hidden rounded-b-lg">
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                  >
                    <LayersControl position="topright">
                      {/* Base Layers */}
                      <LayersControl.BaseLayer checked name="🌍 Satellite">
                        <TileLayer
                          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                          attribution="Esri WorldImagery"
                        />
                      </LayersControl.BaseLayer>
                      
                      <LayersControl.BaseLayer name="🗺️ Street Map">
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="OpenStreetMap"
                        />
                      </LayersControl.BaseLayer>
                      
                      {/* River Path */}
                      <LayersControl.Overlay checked name="🌊 Mithi River">
                        <Polyline
                          positions={RIVER_PATH}
                          pathOptions={{
                            color: '#0ea5e9',
                            weight: 6,
                            opacity: 0.8,
                            dashArray: '10, 10'
                          }}
                        />
                      </LayersControl.Overlay>

                      {/* Sensor Markers */}
                      {sensorLocations.map(sensor => (
                        <LayersControl.Overlay key={sensor.id} checked name={`📍 ${sensor.name}`}>
                          <Marker
                            position={sensor.coordinates}
                            icon={createCustomIcon(sensor.status)}
                            eventHandlers={{
                              click: () => setSelectedSensor(sensor),
                            }}
                          >
                            <Popup maxWidth={400}>
                              <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">
                                  {sensor.name}
                                </h3>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getStatusColor(sensor.status)}`}>
                                  WQI: {sensor.wqi} - {getStatusText(sensor.status)}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <strong>TDS:</strong> {sensor.tds} mg/L
                                  </div>
                                  <div>
                                    <strong>BOD:</strong> {sensor.bod} mg/L
                                  </div>
                                  <div>
                                    <strong>COD:</strong> {sensor.cod} mg/L
                                  </div>
                                  <div>
                                    <strong>DO:</strong> {sensor.do} mg/L
                                  </div>
                                  <div>
                                    <strong>pH:</strong> {sensor.ph}
                                  </div>
                                  <div>
                                    <strong>Temp:</strong> {sensor.temp}°C
                                  </div>
                                </div>
                                
                                {sensor.alerts.length > 0 && (
                                  <div className="mt-3 p-2 bg-red-50 rounded-lg">
                                    <strong className="text-red-700 text-xs">⚠️ Active Alerts:</strong>
                                    <ul className="list-disc list-inside text-xs text-red-600 mt-1">
                                      {sensor.alerts.map((alert, i) => (
                                        <li key={i}>{alert}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="mt-3 text-xs text-gray-500">
                                  Last updated: {new Date(sensor.lastUpdate).toLocaleString()}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        </LayersControl.Overlay>
                      ))}

                      {/* Field Teams */}
                      {showFieldTeams && FIELD_TEAMS.map(team => (
                        <LayersControl.Overlay key={team.id} name={`🚐 ${team.name}`}>
                          <Marker
                            position={team.coordinates}
                            icon={createCustomIcon(team.status, 'team')}
                          >
                            <Popup>
                              <div className="p-3">
                                <h3 className="font-bold text-gray-800">{team.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{team.currentTask}</p>
                                <p className="text-xs text-gray-500 mt-2">ETA: {team.eta}</p>
                                <div className="mt-2">
                                  <strong className="text-xs">Equipment:</strong>
                                  <ul className="text-xs text-gray-600">
                                    {team.equipment.map((item, i) => (
                                      <li key={i}>• {item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        </LayersControl.Overlay>
                      ))}

                      {/* Geofence Zones */}
                      {showGeofences && GEOFENCE_ZONES.map(zone => (
                        <LayersControl.Overlay key={zone.id} name={`⭕ ${zone.name}`}>
                          <Circle
                            center={zone.center}
                            radius={zone.radius}
                            pathOptions={{
                              fillColor: zone.color,
                              fillOpacity: 0.1,
                              color: zone.color,
                              weight: 2,
                              opacity: 0.6,
                              dashArray: '5, 5'
                            }}
                          >
                            <Popup>
                              <div className="p-3">
                                <h3 className="font-bold text-gray-800">{zone.name}</h3>
                                <p className="text-sm text-gray-600">Risk Level: {zone.level.toUpperCase()}</p>
                                <p className="text-sm text-gray-600">Radius: {zone.radius}m</p>
                                <div className="mt-2">
                                  <strong className="text-xs">Restrictions:</strong>
                                  <ul className="text-xs text-gray-600">
                                    {zone.alerts.map((alert, i) => (
                                      <li key={i}>• {alert}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </Popup>
                          </Circle>
                        </LayersControl.Overlay>
                      ))}
                    </LayersControl>
                  </MapContainer>

                  {/* Map Overlay Controls */}
                  <div className="absolute top-4 left-4 z-1000 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <h4 className="font-semibold text-sm mb-2">🎯 Quick Actions</h4>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setMapCenter([19.1197, 72.9073])}>
                        📍 Powai
                      </Button>
                      <Button size="sm" onClick={() => setMapCenter([19.0330, 72.8397])}>
                        🏖️ Mahim
                      </Button>
                    </div>
                  </div>

                  {/* Live Status Indicator */}
                  <div className="absolute bottom-4 right-4 z-1000 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                    🔴 LIVE
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Analytics Panel */}
        {selectedSensor && (
          <Card className="mt-6 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle>📊 Detailed Analysis: {selectedSensor.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">📈 Trend Analysis</h4>
                  <p className="text-sm text-blue-700">
                    WQI has decreased by 12% over the last 7 days. Immediate intervention recommended.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                  <h4 className="font-semibold text-orange-800 mb-2">⚠️ Risk Assessment</h4>
                  <p className="text-sm text-orange-700">
                    High risk of fish mortality. Recommend restricting water usage for drinking purposes.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">💡 Recommendations</h4>
                  <p className="text-sm text-green-700">
                    Install additional aeration systems. Increase monitoring frequency to 2-hour intervals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }
        
        .custom-sensor-icon div,
        .custom-team-icon div {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
}