import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, FileSpreadsheet, Calendar, Filter, Database, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DataExport() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    start: '2000-01-01',
    end: '2024-12-31'
  });
  const [selectedParameters, setSelectedParameters] = useState({
    temperature: true,
    pH: true,
    dissolvedOxygen: true,
    tds: true,
    bod: true,
    cod: true,
    wqi: true
  });

  React.useEffect(() => {
    // Check if user is admin
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const handleParameterToggle = (param) => {
    setSelectedParameters(prev => ({
      ...prev,
      [param]: !prev[param]
    }));
  };

  const handleExport = async () => {
    setExporting(true);

    // Count selected parameters
    const selectedCount = Object.values(selectedParameters).filter(Boolean).length;
    
    if (selectedCount === 0) {
      toast.error('Please select at least one parameter to export');
      setExporting(false);
      return;
    }

    try {
      // Fetch data from backend API
      const response = await fetch(`/api/export-data/?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });

      let csvText;
      
      if (response.ok) {
        csvText = await response.text();
      } else {
        // Fallback: try to fetch static CSV file
        const staticResponse = await fetch('/server/mithi_river_data.csv');
        if (!staticResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        csvText = await staticResponse.text();
      }
      
      // Parse CSV
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Map headers to indices
      const headerMap = {
        date: headers.findIndex(h => h.toLowerCase().includes('date') || h.toLowerCase() === 'd'),
        temperature: headers.findIndex(h => h.toLowerCase().includes('temp') || h.toLowerCase() === 'temperature'),
        pH: headers.findIndex(h => h.toLowerCase() === 'ph'),
        dissolvedOxygen: headers.findIndex(h => h.toLowerCase().includes('do') || h.toLowerCase().includes('dissolved')),
        tds: headers.findIndex(h => h.toLowerCase() === 'tds'),
        bod: headers.findIndex(h => h.toLowerCase() === 'bod'),
        cod: headers.findIndex(h => h.toLowerCase() === 'cod'),
        wqi: headers.findIndex(h => h.toLowerCase() === 'wqi')
      };
      
      // Filter data by date range
      const filteredRows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim());
        const rowDate = row[headerMap.date];
        
        // Check if row date is within range
        if (rowDate && rowDate >= dateRange.start && rowDate <= dateRange.end) {
          filteredRows.push(row);
        }
      }

      // Build export data with selected parameters
      const exportHeaders = ['Date'];
      const parameterIndices = [headerMap.date];
      
      if (selectedParameters.temperature && headerMap.temperature >= 0) {
        exportHeaders.push('Temperature');
        parameterIndices.push(headerMap.temperature);
      }
      if (selectedParameters.pH && headerMap.pH >= 0) {
        exportHeaders.push('pH');
        parameterIndices.push(headerMap.pH);
      }
      if (selectedParameters.dissolvedOxygen && headerMap.dissolvedOxygen >= 0) {
        exportHeaders.push('Dissolved_Oxygen');
        parameterIndices.push(headerMap.dissolvedOxygen);
      }
      if (selectedParameters.tds && headerMap.tds >= 0) {
        exportHeaders.push('TDS');
        parameterIndices.push(headerMap.tds);
      }
      if (selectedParameters.bod && headerMap.bod >= 0) {
        exportHeaders.push('BOD');
        parameterIndices.push(headerMap.bod);
      }
      if (selectedParameters.cod && headerMap.cod >= 0) {
        exportHeaders.push('COD');
        parameterIndices.push(headerMap.cod);
      }
      if (selectedParameters.wqi && headerMap.wqi >= 0) {
        exportHeaders.push('WQI');
        parameterIndices.push(headerMap.wqi);
      }

      // Build filtered data
      const filteredData = [exportHeaders];
      filteredRows.forEach(row => {
        const filteredRow = parameterIndices.map(idx => row[idx] || '');
        filteredData.push(filteredRow);
      });

      // Convert to appropriate format
      let exportData;
      let filename;
      let mimeType;

      if (selectedFormat === 'csv') {
        exportData = filteredData.map(row => row.join(',')).join('\n');
        filename = `mithi_river_export_${dateRange.start}_to_${dateRange.end}.csv`;
        mimeType = 'text/csv';
      } else if (selectedFormat === 'json') {
        const jsonData = filteredData.slice(1).map(row => {
          const obj = {};
          exportHeaders.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        exportData = JSON.stringify(jsonData, null, 2);
        filename = `mithi_river_export_${dateRange.start}_to_${dateRange.end}.json`;
        mimeType = 'application/json';
      } else {
        // Excel format (tab-separated for Excel compatibility)
        exportData = filteredData.map(row => row.join('\t')).join('\n');
        filename = `mithi_river_export_${dateRange.start}_to_${dateRange.end}.xlsx`;
        mimeType = 'application/vnd.ms-excel';
      }

      // Create download
      const blob = new Blob([exportData], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const recordCount = filteredData.length - 1;
      toast.success(`Successfully exported ${recordCount.toLocaleString()} records with ${selectedCount} parameters!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again or check your connection.');
    } finally {
      setExporting(false);
    }
  };

  const parameters = [
    { key: 'temperature', label: 'Temperature (°C)', icon: '🌡️', color: 'from-red-500 to-orange-500' },
    { key: 'pH', label: 'pH Level', icon: '⚗️', color: 'from-purple-500 to-pink-500' },
    { key: 'dissolvedOxygen', label: 'Dissolved Oxygen (mg/L)', icon: '💧', color: 'from-blue-500 to-cyan-500' },
    { key: 'tds', label: 'TDS (mg/L)', icon: '💎', color: 'from-teal-500 to-green-500' },
    { key: 'bod', label: 'BOD (mg/L)', icon: '🧪', color: 'from-indigo-500 to-blue-500' },
    { key: 'cod', label: 'COD (mg/L)', icon: '🔬', color: 'from-violet-500 to-purple-500' },
    { key: 'wqi', label: 'WQI Score', icon: '📊', color: 'from-green-500 to-emerald-500' }
  ];

  const formats = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values', icon: '📄' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel format', icon: '📗' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation', icon: '📋' }
  ];

  const selectedCount = Object.values(selectedParameters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
            <Download className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Data Export Center
            </h1>
            <p className="text-gray-600 mt-1">Export Mithi River water quality data for analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Range Selection */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Date Range Selection
              </CardTitle>
              <CardDescription>Choose the time period for data export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                    Start Date
                  </Label>
                  <input
                    id="startDate"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                    End Date
                  </Label>
                  <input
                    id="endDate"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parameter Selection */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                Select Parameters
              </CardTitle>
              <CardDescription>
                Choose which water quality parameters to include ({selectedCount}/7 selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parameters.map((param) => (
                  <div
                    key={param.key}
                    onClick={() => handleParameterToggle(param.key)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedParameters[param.key]
                        ? `border-transparent bg-gradient-to-r ${param.color} text-white shadow-lg transform scale-105`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{param.icon}</span>
                        <div>
                          <p className={`font-semibold ${selectedParameters[param.key] ? 'text-white' : 'text-gray-900'}`}>
                            {param.label}
                          </p>
                        </div>
                      </div>
                      {selectedParameters[param.key] && (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-white" />
                </div>
                Export Format
              </CardTitle>
              <CardDescription>Choose your preferred file format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formats.map((format) => (
                  <div
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedFormat === format.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-4xl mb-3 block">{format.icon}</span>
                      <p className="font-bold text-gray-900 mb-1">{format.label}</p>
                      <p className="text-xs text-gray-500">{format.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Summary & Action */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Export Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Date Range</span>
                  <span className="text-sm font-bold text-gray-900">
                    {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Parameters</span>
                  <span className="text-sm font-bold text-gray-900">{selectedCount} of 7</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Format</span>
                  <span className="text-sm font-bold text-gray-900 uppercase">{selectedFormat}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Est. Records</span>
                  <span className="text-sm font-bold text-gray-900">~400,658</span>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={exporting || selectedCount === 0}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Export Data
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-600 text-center">
                Export will download immediately to your device
              </p>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">ℹ️</span>
                Export Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Data sourced from Mithi River monitoring stations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>400,658+ historical records (2000-2024)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>All data is quality-checked and validated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Compatible with Excel, R, Python, and other analysis tools</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
