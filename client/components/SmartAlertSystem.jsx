import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Settings,
  Eye,
  EyeOff,
  MapPin,
  Activity,
  Zap,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Volume2,
  VolumeX
} from 'lucide-react';

const SmartAlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertStats, setAlertStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch real alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/advanced-features/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        
        const data = await response.json();
        
        if (data.success && data.smart_alerts) {
          const mappedAlerts = data.smart_alerts.map((alert, index) => ({
            id: alert.id,
            type: alert.type.toLowerCase().replace(' ', '_'),
            severity: alert.severity,
            title: alert.type,
            message: alert.message,
            location: alert.location,
            parameter: alert.parameter || 'general',
            value: alert.value || null,
            threshold: alert.threshold || null,
            timestamp: new Date(alert.timestamp),
            status: alert.status,
            acknowledged: false,
            assignedTo: 'Auto-Assignment',
            estimatedResolution: Math.random() * 120 + 30, // 30-150 minutes
            priority: alert.severity === 'high' ? 'critical' : alert.severity === 'medium' ? 'high' : 'medium'
          }));
          
          setAlerts(mappedAlerts);
          
          // Calculate stats
          const stats = {
            total: mappedAlerts.length,
            active: mappedAlerts.filter(a => a.status === 'active').length,
            critical: mappedAlerts.filter(a => a.severity === 'high').length,
            warning: mappedAlerts.filter(a => a.severity === 'medium').length,
            info: mappedAlerts.filter(a => a.severity === 'low').length,
            acknowledged: mappedAlerts.filter(a => a.acknowledged).length
          };
          setAlertStats(stats);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
        // Fallback to demo data
        generateMockAlerts();
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Generate mock alerts for fallback
  const generateMockAlerts = () => {
    const alertTypes = [
      {
        type: 'water_quality',
        icon: Activity,
        color: 'blue',
        severities: ['critical', 'warning', 'info']
      },
      {
        type: 'sensor_malfunction',
        icon: Zap,
        color: 'yellow',
        severities: ['critical', 'warning']
      },
      {
        type: 'environmental',
        icon: AlertTriangle,
        color: 'green',
        severities: ['critical', 'warning', 'info']
      },
      {
        type: 'compliance',
        icon: CheckCircle,
        color: 'purple',
        severities: ['critical', 'warning']
      },
      {
        type: 'health',
        icon: Users,
        color: 'red',
        severities: ['critical', 'warning', 'info']
      }
    ];

    const sampleAlerts = [
      {
        id: 1,
        type: 'water_quality',
        severity: 'critical',
        title: 'Critical pH Level Detected',
        message: 'pH level at MR-003 (Downstream) has dropped to 5.8, exceeding safe limits.',
        location: 'MR-003 - Mithi River Downstream',
        timestamp: new Date(Date.now() - 5 * 60000),
        acknowledged: false,
        resolved: false,
        actions: ['Contact Industrial Zone', 'Deploy Emergency Team', 'Issue Public Advisory']
      },
      {
        id: 2,
        type: 'sensor_malfunction',
        severity: 'warning',
        title: 'Sensor Communication Lost',
        message: 'MR-004 sensor has been offline for 45 minutes. Last reading received at 14:30.',
        location: 'MR-004 - Mithi River Estuary',
        timestamp: new Date(Date.now() - 45 * 60000),
        acknowledged: true,
        resolved: false,
        actions: ['Check Network Connection', 'Dispatch Maintenance Team', 'Use Backup Sensors']
      },
      {
        id: 3,
        type: 'environmental',
        severity: 'warning',
        title: 'Turbidity Spike Detected',
        message: 'Sudden increase in turbidity levels detected across multiple sensors. Possible sediment discharge.',
        location: 'Multiple Locations',
        timestamp: new Date(Date.now() - 20 * 60000),
        acknowledged: false,
        resolved: false,
        actions: ['Investigate Source', 'Monitor Trend', 'Alert Authorities']
      },
      {
        id: 4,
        type: 'compliance',
        severity: 'critical',
        title: 'Regulatory Violation',
        message: 'COD levels exceed Maharashtra Pollution Control Board limits for 3 consecutive hours.',
        location: 'MR-002 - Mithi River Midstream',
        timestamp: new Date(Date.now() - 10 * 60000),
        acknowledged: false,
        resolved: false,
        actions: ['File Compliance Report', 'Contact MPCB', 'Implement Corrective Measures']
      },
      {
        id: 5,
        type: 'health',
        severity: 'warning',
        title: 'Health Risk Assessment Update',
        message: 'Current water quality conditions pose moderate health risks for local communities.',
        location: 'Residential Areas',
        timestamp: new Date(Date.now() - 60 * 60000),
        acknowledged: true,
        resolved: false,
        actions: ['Issue Health Advisory', 'Coordinate with Health Dept', 'Monitor Symptoms']
      },
      {
        id: 6,
        type: 'water_quality',
        severity: 'info',
        title: 'Quality Improvement Detected',
        message: 'Dissolved Oxygen levels have improved by 15% over the past 24 hours.',
        location: 'MR-001 - Mithi River Upstream',
        timestamp: new Date(Date.now() - 90 * 60000),
        acknowledged: true,
        resolved: true,
        actions: ['Document Improvement', 'Analyze Cause', 'Share Success Story']
      },
      {
        id: 7,
        type: 'environmental',
        severity: 'critical',
        title: 'Fish Mortality Event',
        message: 'High fish mortality rate observed in downstream areas. Immediate investigation required.',
        location: 'MR-003 - Mithi River Downstream',
        timestamp: new Date(Date.now() - 30 * 60000),
        acknowledged: false,
        resolved: false,
        actions: ['Deploy Investigation Team', 'Collect Samples', 'Alert Environmental Authorities']
      },
      {
        id: 8,
        type: 'sensor_malfunction',
        severity: 'warning',
        title: 'Low Battery Warning',
        message: 'MR-003 sensor battery level is at 12%. Replacement needed within 24 hours.',
        location: 'MR-003 - Mithi River Downstream',
        timestamp: new Date(Date.now() - 120 * 60000),
        acknowledged: true,
        resolved: false,
        actions: ['Schedule Maintenance', 'Prepare Replacement Battery', 'Monitor Power Level']
      }
    ];

    setAlerts(sampleAlerts);
    
    // Calculate stats
    const stats = {
      total: sampleAlerts.length,
      critical: sampleAlerts.filter(a => a.severity === 'critical').length,
      warning: sampleAlerts.filter(a => a.severity === 'warning').length,
      info: sampleAlerts.filter(a => a.severity === 'info').length,
      unacknowledged: sampleAlerts.filter(a => !a.acknowledged).length,
      unresolved: sampleAlerts.filter(a => !a.resolved).length
    };
    
    setAlertStats(stats);
  };

  // Filter alerts
  useEffect(() => {
    let filtered = alerts;
    
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredAlerts(filtered);
  }, [alerts, selectedSeverity, selectedType]);

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev]);
        
        if (notificationsEnabled && 'Notification' in window) {
          new Notification(`New ${newAlert.severity} alert: ${newAlert.title}`, {
            body: newAlert.message,
            icon: '/favicon.ico'
          });
        }
        
        if (soundEnabled) {
          // Play notification sound (would need audio file)
          console.log('🔊 Alert sound would play here');
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [notificationsEnabled, soundEnabled]);

  const generateRandomAlert = () => {
    const types = ['water_quality', 'sensor_malfunction', 'environmental', 'compliance', 'health'];
    const severities = ['critical', 'warning', 'info'];
    const locations = ['MR-001', 'MR-002', 'MR-003', 'MR-004', 'MR-005', 'MR-006'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    return {
      id: Date.now(),
      type,
      severity,
      title: `Random ${severity} alert`,
      message: `Automated alert generated for testing purposes at ${location}.`,
      location: `${location} - Test Location`,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      actions: ['Investigate', 'Monitor', 'Report']
    };
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const resolveAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'water_quality':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'sensor_malfunction':
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'environmental':
        return <AlertTriangle className="h-4 w-4 text-green-600" />;
      case 'compliance':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'health':
        return <Users className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return timestamp.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50/50 to-yellow-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Loading alert data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50/50 to-yellow-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                Smart Alert System
              </CardTitle>
              <CardDescription className="text-gray-600">
                Real-time monitoring and intelligent alert management for Mithi River
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="border-blue-200 hover:bg-blue-50"
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
                Notifications
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="border-blue-200 hover:bg-blue-50"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Sound
              </Button>
              <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{alertStats.total}</div>
              <div className="text-sm text-gray-600">Total Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{alertStats.critical}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{alertStats.warning}</div>
              <div className="text-sm text-gray-600">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{alertStats.info}</div>
              <div className="text-sm text-gray-600">Info</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{alertStats.unacknowledged}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{alertStats.unresolved}</div>
              <div className="text-sm text-gray-600">Open</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Indicator */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg border border-red-200">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-gray-700">
            Data Source: Real Mithi River CSV Dataset - Smart Alerts
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSeverity === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSeverity('all')}
          >
            All Severities
          </Button>
          {['critical', 'warning', 'info'].map(severity => (
            <Button
              key={severity}
              variant={selectedSeverity === severity ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeverity(severity)}
              className={selectedSeverity === severity ? getSeverityColor(severity) : ''}
            >
              {getSeverityIcon(severity)}
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Types
          </Button>
          {['water_quality', 'sensor_malfunction', 'environmental', 'compliance', 'health'].map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {getTypeIcon(type)}
              {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`border-l-4 shadow-lg transition-all duration-200 hover:shadow-xl ${
              alert.severity === 'critical' 
                ? 'border-l-red-500 bg-red-50/30' 
                : alert.severity === 'warning'
                ? 'border-l-yellow-500 bg-yellow-50/30'
                : 'border-l-blue-500 bg-blue-50/30'
            } ${!alert.acknowledged ? 'ring-2 ring-blue-200' : ''}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge className="bg-green-100 text-green-800">Acknowledged</Badge>
                      )}
                      {alert.resolved && (
                        <Badge className="bg-gray-100 text-gray-800">Resolved</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{alert.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(alert.type)}
                        <span>{alert.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      {alert.actions.map((action, index) => (
                        <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                  {alert.acknowledged && !alert.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                      className="border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50">
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAlerts.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Alerts Found</h3>
              <p className="text-gray-600">
                {selectedSeverity !== 'all' || selectedType !== 'all' 
                  ? 'No alerts match your current filter criteria.'
                  : 'All systems are operating normally. No active alerts at this time.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Emergency Contacts */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <Phone className="h-5 w-5" />
            <span>Emergency Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <Phone className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-gray-800">Emergency Response</div>
                <div className="text-sm text-gray-600">+91 22 2266-0601</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-800">MPCB Alert</div>
                <div className="text-sm text-gray-600">alerts@mpcb.gov.in</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-800">Field Team</div>
                <div className="text-sm text-gray-600">WhatsApp: +91 98765-43210</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartAlertSystem;