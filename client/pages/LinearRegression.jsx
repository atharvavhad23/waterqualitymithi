import React, { useState } from "react";
import WaterQualityCharts from "../components/WaterQualityCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { regressionModels } from "@/lib/modelOptions";

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-300 animate-fade-in">{title}</h2>
      {children}
    </section>
  );
}

export default function LinearRegression() {
  // Form state for basic parameters
  const [formData, setFormData] = useState({
    year: "",
    location: "",
    temp: "",
    do: "",
    ph: ""
  });

  // Results states
  const [predictorResult, setPredictorResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("ml_linear_regression");

  // Available locations for Mithi River
  const locations = ["Bandra", "Mahim", "Powai", "Kurla", "Saki Naka"];

  // Parameter information for better UX
  const parameterInfo = {
    year: { label: "Year", unit: "", range: "2005-2025", icon: "📅" },
    location: { label: "Location", unit: "", range: "Mithi River Areas", icon: "📍" },
    temp: { label: "Temperature", unit: "°C", range: "15-40", icon: "🌡️" },
    do: { label: "Dissolved Oxygen", unit: "mg/L", range: "0-15", icon: "💨" },
    ph: { label: "pH Level", unit: "", range: "0-14", icon: "⚗️" }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form data
  const validateForm = () => {
    const requiredFields = ["year", "location", "temp", "do", "ph"];
    
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in ${parameterInfo[field].label}`);
        return false;
      }
    }
    return true;
  };

  // Predictor handler (Linear Regression)
  const runPredictor = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setShowResults(false);
    
    try {
      console.log('Sending data:', formData); // Debug log
      
      const response = await fetch('/api/ml/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: parseInt(formData.year),
          location: formData.location,
          temp: parseFloat(formData.temp),
          do: parseFloat(formData.do),
          ph: parseFloat(formData.ph),
          model: selectedModel
        }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (response.ok && data.success) {
        setPredictorResult(data.predictions);
        setShowResults(true);
      } else {
        console.error('API Error:', data);
        alert(`Prediction failed: ${data.error || 'Unknown error'}`);
        setPredictorResult({ error: data.error || 'Unknown error' });
        setShowResults(true);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`Network error: ${error.message}`);
      setPredictorResult({ error: error.message });
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fill sample data for testing
  const fillSampleData = () => {
    setFormData({
      year: "2024",
      location: "Bandra",
      temp: "28.5",
      do: "5.2",
      ph: "7.1"
    });
  };

  // Animated river background
  const riverBg = (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
      <svg className="w-full h-full animate-wave" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#3b82f6" fillOpacity="0.5" d="M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,176C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        <path fill="#1d4ed8" fillOpacity="0.7" d="M0,224L60,218.7C120,213,240,203,360,186.7C480,171,600,149,720,154.7C840,160,960,192,1080,186.7C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
      </svg>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50">
      {riverBg}
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-blue-900 mb-4 drop-shadow-lg">
            🔮 Mithi River Linear Regression Predictor
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Advanced linear regression models to predict pollutant concentrations (TDS, BOD, COD) 
            based on basic water quality parameters. Perfect for environmental monitoring and analysis.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-2xl border-2 border-white/50 bg-white/90 backdrop-blur-xl animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">
                🔬 Predict Water Quality & Pollutants
              </CardTitle>
              <p className="text-center text-white/90 mt-2">
                Enter basic parameters to predict WQI, TDS, BOD & COD levels
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={runPredictor} className="space-y-6">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <label htmlFor="regression-model" className="mb-2 block text-sm font-semibold text-blue-900">
                    Prediction model
                  </label>
                  <select
                    id="regression-model"
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full rounded-lg border-2 border-blue-200 bg-white p-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                  >
                    {regressionModels.map(model => (
                      <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                  </select>
                </div>
                {/* Input Parameters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📊 Input Parameters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Year */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {parameterInfo.year.icon} {parameterInfo.year.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{parameterInfo.year.range}</Badge>
                      </label>
                      <input 
                        type="number" 
                        value={formData.year} 
                        onChange={e => handleInputChange("year", e.target.value)}
                        placeholder="e.g., 2024"
                        min="2005"
                        max="2025"
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                        required
                      />
                    </div>
                    
                    {/* Location */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {parameterInfo.location.icon} {parameterInfo.location.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{parameterInfo.location.range}</Badge>
                      </label>
                      <select 
                        value={formData.location} 
                        onChange={e => handleInputChange("location", e.target.value)}
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                        required
                      >
                        <option value="">Select Mithi River Location</option>
                        {locations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Temperature */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {parameterInfo.temp.icon} {parameterInfo.temp.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{parameterInfo.temp.range} {parameterInfo.temp.unit}</Badge>
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.temp} 
                        onChange={e => handleInputChange("temp", e.target.value)}
                        placeholder="e.g., 28.5"
                        min="15"
                        max="40"
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                        required
                      />
                    </div>
                    
                    {/* Dissolved Oxygen */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {parameterInfo.do.icon} {parameterInfo.do.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{parameterInfo.do.range} {parameterInfo.do.unit}</Badge>
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.do} 
                        onChange={e => handleInputChange("do", e.target.value)}
                        placeholder="e.g., 5.2"
                        min="0"
                        max="15"
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                        required
                      />
                    </div>
                    
                    {/* pH */}
                    <div className="md:col-span-2">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {parameterInfo.ph.icon} {parameterInfo.ph.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{parameterInfo.ph.range}</Badge>
                      </label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={formData.ph} 
                        onChange={e => handleInputChange("ph", e.target.value)}
                        placeholder="e.g., 7.1"
                        min="0"
                        max="14"
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300" 
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Prediction Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                  <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center">
                    🎯 What will be predicted:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                      <div className="flex items-center mb-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                        <h5 className="font-bold text-green-700 text-lg">WQI</h5>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Water Quality Index</p>
                      <p className="text-xs text-gray-500 mt-1">Overall water quality assessment score (0-100)</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
                      <div className="flex items-center mb-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        <h5 className="font-bold text-blue-700 text-lg">TDS</h5>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total Dissolved Solids</p>
                      <p className="text-xs text-gray-500 mt-1">Concentration of dissolved substances (mg/L)</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
                      <div className="flex items-center mb-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                        <h5 className="font-bold text-orange-700 text-lg">BOD</h5>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Biochemical Oxygen Demand</p>
                      <p className="text-xs text-gray-500 mt-1">Oxygen required by microorganisms (mg/L)</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
                      <div className="flex items-center mb-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                        <h5 className="font-bold text-red-700 text-lg">COD</h5>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Chemical Oxygen Demand</p>
                      <p className="text-xs text-gray-500 mt-1">Oxygen needed to oxidize organic matter (mg/L)</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    onClick={fillSampleData}
                    variant="outline"
                    className="flex-1 py-3 border-2 hover:bg-gray-50 transition-all duration-300"
                  >
                    📝 Fill Sample Data
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-2 py-3 shadow-lg hover:scale-105 transition-transform duration-300 font-semibold bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  >
                    {isLoading ? (
                      <>⏳ Processing...</>
                    ) : (
                      <>🔬 Predict WQI & Pollutants</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results and Visualization */}
          <div className="space-y-6">
            {/* Real-time Charts */}
            <Card className="shadow-xl border-2 border-white/50 bg-white/90 backdrop-blur-xl animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold text-center">📈 Input Parameter Visualization</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <WaterQualityCharts data={{
                  Temp: formData.temp || 0,
                  DO: formData.do || 0,
                  pH: formData.ph || 0,
                  TDS: 0, // These will be predicted
                  BOD: 0,
                  COD: 0
                }} />
              </CardContent>
            </Card>

            {/* Results Display */}
            {showResults && (
              <Card className="shadow-2xl border-2 border-white/50 bg-white/95 backdrop-blur-xl animate-pop">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="text-xl font-bold text-center">
                    🔬 Prediction Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {predictorResult && !predictorResult.error ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-blue-800 mb-4">
                          📊 Predicted Water Quality & Pollutant Levels for {formData.location}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* WQI Prediction Card */}
                        <div className="text-center bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border-2 border-green-200">
                          <div className="text-3xl mb-2">🌊</div>
                          <div className="text-sm font-medium text-gray-600 mb-2">Water Quality Index</div>
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {predictorResult.WQI ? predictorResult.WQI.toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Index Score</div>
                          <div className="mt-2 text-xs text-gray-500">
                            {predictorResult.WQI ? (
                              predictorResult.WQI >= 90 ? 'Excellent Quality' :
                              predictorResult.WQI >= 70 ? 'Good Quality' :
                              predictorResult.WQI >= 50 ? 'Moderate Quality' :
                              predictorResult.WQI >= 25 ? 'Poor Quality' : 'Very Poor Quality'
                            ) : 'Not Available'}
                          </div>
                        </div>
                        
                        <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border-2 border-blue-200">
                          <div className="text-3xl mb-2">💧</div>
                          <div className="text-sm font-medium text-gray-600 mb-2">Total Dissolved Solids</div>
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {predictorResult.TDS?.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">mg/L</div>
                          <div className="mt-2 text-xs text-gray-500">
                            {predictorResult.TDS > 2000 ? 'High concentration' : 
                             predictorResult.TDS > 1000 ? 'Moderate concentration' : 'Low concentration'}
                          </div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-lg border-2 border-orange-200">
                          <div className="text-3xl mb-2">🦠</div>
                          <div className="text-sm font-medium text-gray-600 mb-2">Biochemical Oxygen Demand</div>
                          <div className="text-3xl font-bold text-orange-600 mb-1">
                            {predictorResult.BOD?.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">mg/L</div>
                          <div className="mt-2 text-xs text-gray-500">
                            {predictorResult.BOD > 15 ? 'High pollution' : 
                             predictorResult.BOD > 8 ? 'Moderate pollution' : 'Low pollution'}
                          </div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg border-2 border-red-200">
                          <div className="text-3xl mb-2">⚛️</div>
                          <div className="text-sm font-medium text-gray-600 mb-2">Chemical Oxygen Demand</div>
                          <div className="text-3xl font-bold text-red-600 mb-1">
                            {predictorResult.COD?.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">mg/L</div>
                          <div className="mt-2 text-xs text-gray-500">
                            {predictorResult.COD > 100 ? 'High pollution' : 
                             predictorResult.COD > 50 ? 'Moderate pollution' : 'Low pollution'}
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                        <strong>Input Parameters:</strong> Year: {formData.year} | Location: {formData.location} | 
                        Temperature: {formData.temp}°C | DO: {formData.do} mg/L | pH: {formData.ph}
                      </div>

                      {/* Environmental Impact Assessment */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-3">🌱 Environmental Impact Assessment:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {/* WQI Overall Assessment */}
                          <div className={`p-3 rounded-lg ${
                            predictorResult.WQI >= 90 ? 'bg-green-100 text-green-700' :
                            predictorResult.WQI >= 70 ? 'bg-blue-100 text-blue-700' :
                            predictorResult.WQI >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            predictorResult.WQI >= 25 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <strong>WQI Overall:</strong><br/>
                            {predictorResult.WQI >= 90 ? 'Excellent water quality' :
                             predictorResult.WQI >= 70 ? 'Good water quality' :
                             predictorResult.WQI >= 50 ? 'Moderate water quality' :
                             predictorResult.WQI >= 25 ? 'Poor water quality' : 'Very poor water quality'}
                          </div>
                          
                          <div className={`p-3 rounded-lg ${
                            predictorResult.TDS > 2000 ? 'bg-red-100 text-red-700' : 
                            predictorResult.TDS > 1000 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            <strong>TDS Impact:</strong><br/>
                            {predictorResult.TDS > 2000 ? 'Poor water quality, high salinity' : 
                             predictorResult.TDS > 1000 ? 'Moderate quality, acceptable for some uses' : 'Good quality, low salinity'}
                          </div>
                          <div className={`p-3 rounded-lg ${
                            predictorResult.BOD > 15 ? 'bg-red-100 text-red-700' : 
                            predictorResult.BOD > 8 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            <strong>BOD Impact:</strong><br/>
                            {predictorResult.BOD > 15 ? 'Severe organic pollution' : 
                             predictorResult.BOD > 8 ? 'Moderate organic pollution' : 'Low organic pollution'}
                          </div>
                          <div className={`p-3 rounded-lg ${
                            predictorResult.COD > 100 ? 'bg-red-100 text-red-700' : 
                            predictorResult.COD > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            <strong>COD Impact:</strong><br/>
                            {predictorResult.COD > 100 ? 'High chemical pollution' : 
                             predictorResult.COD > 50 ? 'Moderate chemical pollution' : 'Low chemical pollution'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-red-600 text-lg font-semibold mb-2">
                        ⚠️ Prediction Error
                      </div>
                      <div className="text-gray-600">
                        {predictorResult?.error || 'Unknown error occurred'}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated river effect styles */}
      <style>{`
        .animate-wave { animation: waveMove 8s linear infinite; }
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }
        .animate-fade-in { animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pop { animation: popIn 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.7); }
          80% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}