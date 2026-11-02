import React, { useState } from "react";
import WaterQualityCharts from "../components/WaterQualityCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { classificationModels } from "@/lib/modelOptions";

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-300 animate-fade-in">{title}</h2>
      {children}
    </section>
  );
}

export default function WQIClassifier() {
  // Form state for all parameters
  const [formData, setFormData] = useState({
    year: "",
    location: "",
    temp: "",
    do: "",
    ph: "",
    tds: "",
    bod: "",
    cod: ""
  });

  // Results states
  const [classifierResult, setClassifierResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("ml_random_forest");

  // Available locations for Mithi River
  const locations = ["Bandra", "Mahim", "Powai", "Kurla", "Saki Naka"];

  // Parameter information for better UX
  const parameterInfo = {
    year: { label: "Year", unit: "", range: "2005-2025", icon: "📅" },
    location: { label: "Location", unit: "", range: "Mithi River Areas", icon: "📍" },
    temp: { label: "Temperature", unit: "°C", range: "15-40", icon: "🌡️" },
    do: { label: "Dissolved Oxygen", unit: "mg/L", range: "0-15", icon: "💨" },
    ph: { label: "pH Level", unit: "", range: "0-14", icon: "⚗️" },
    tds: { label: "Total Dissolved Solids", unit: "mg/L", range: "0-5000", icon: "💧" },
    bod: { label: "Biochemical Oxygen Demand", unit: "mg/L", range: "0-30", icon: "🦠" },
    cod: { label: "Chemical Oxygen Demand", unit: "mg/L", range: "0-200", icon: "⚛️" }
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
    const requiredFields = ["year", "location", "temp", "do", "ph", "tds", "bod", "cod"];
    
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in ${parameterInfo[field].label}`);
        return false;
      }
    }
    return true;
  };

  // Classifier handler
  const runClassifier = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setShowResults(false);
    
    try {
      console.log('Sending data:', formData); // Debug log
      
      const response = await fetch("/api/ml/classify/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: parseInt(formData.year),
          location: formData.location,
          temp: parseFloat(formData.temp),
          do: parseFloat(formData.do),
          ph: parseFloat(formData.ph),
          tds: parseFloat(formData.tds),
          bod: parseFloat(formData.bod),
          cod: parseFloat(formData.cod),
          model: selectedModel
        }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (response.ok && data.success) {
        setClassifierResult(data.prediction);
        setShowResults(true);
      } else {
        console.error('API Error:', data);
        alert(`Classification failed: ${data.error || 'Unknown error'}`);
        setClassifierResult(`Error: ${data.error || 'Unknown error'}`);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`Network error: ${error.message}`);
      setClassifierResult(`Network Error: ${error.message}`);
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
      ph: "7.1",
      tds: "2500",
      bod: "12.5",
      cod: "45.2"
    });
  };

  // Animated river background
  const riverBg = (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
      <svg className="w-full h-full animate-wave" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#10b981" fillOpacity="0.5" d="M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,176C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        <path fill="#059669" fillOpacity="0.7" d="M0,224L60,218.7C120,213,240,203,360,186.7C480,171,600,149,720,154.7C840,160,960,192,1080,186.7C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
      </svg>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {riverBg}
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-green-900 mb-4 drop-shadow-lg">
            🏷️ Mithi River WQI Classifier
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Random Forest Classification model to assess overall water quality. 
            Enter all water quality parameters to get WQI classification (Excellent/Good/Moderate/Poor/Very Poor).
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-2xl border-2 border-white/50 bg-white/90 backdrop-blur-xl animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">
                🌊 Water Quality Classification
              </CardTitle>
              <p className="text-center text-white/90 mt-2">
                Enter all parameters to classify overall water quality
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={runClassifier} className="space-y-6">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <label htmlFor="classification-model" className="mb-2 block text-sm font-semibold text-green-900">
                    Prediction model
                  </label>
                  <select
                    id="classification-model"
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full rounded-lg border-2 border-green-200 bg-white p-3 focus:border-green-400 focus:ring-2 focus:ring-green-400"
                  >
                    {classificationModels.map(model => (
                      <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                  </select>
                </div>
                {/* Basic Parameters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">📊 Basic Parameters</h3>
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
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300" 
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
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
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
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300" 
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
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300" 
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
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300" 
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Parameters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">⚗️ Pollutant Parameters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* TDS */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {parameterInfo.tds.icon} {parameterInfo.tds.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{parameterInfo.tds.range} {parameterInfo.tds.unit}</Badge>
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.tds} 
                        onChange={e => handleInputChange("tds", e.target.value)}
                        placeholder="e.g., 2500"
                        min="0"
                        max="5000"
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300" 
                        required
                      />
                    </div>
                    
                    {/* BOD */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {parameterInfo.bod.icon} {parameterInfo.bod.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{parameterInfo.bod.range} {parameterInfo.bod.unit}</Badge>
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.bod} 
                        onChange={e => handleInputChange("bod", e.target.value)}
                        placeholder="e.g., 12.5"
                        min="0"
                        max="30"
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300" 
                        required
                      />
                    </div>
                    
                    {/* COD */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        {parameterInfo.cod.icon} {parameterInfo.cod.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{parameterInfo.cod.range} {parameterInfo.cod.unit}</Badge>
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.cod} 
                        onChange={e => handleInputChange("cod", e.target.value)}
                        placeholder="e.g., 45.2"
                        min="0"
                        max="200"
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300" 
                        required
                      />
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
                    className="flex-2 py-3 shadow-lg hover:scale-105 transition-transform duration-300 font-semibold bg-gradient-to-r from-green-500 to-green-700 text-white"
                  >
                    {isLoading ? (
                      <>⏳ Processing...</>
                    ) : (
                      <>🌊 Classify Water Quality</>
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
                <CardTitle className="text-xl font-bold text-center">📈 Real-time Parameter Visualization</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <WaterQualityCharts data={{
                  Temp: formData.temp || 0,
                  DO: formData.do || 0,
                  pH: formData.ph || 0,
                  TDS: formData.tds || 0,
                  BOD: formData.bod || 0,
                  COD: formData.cod || 0
                }} />
              </CardContent>
            </Card>

            {/* Results Display */}
            {showResults && (
              <Card className="shadow-2xl border-2 border-white/50 bg-white/95 backdrop-blur-xl animate-pop">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-t-lg">
                  <CardTitle className="text-xl font-bold text-center">
                    🌊 Water Quality Classification Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {classifierResult && !classifierResult.includes('Error') ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-green-800 mb-6">
                          🌊 Water Quality Index Classification
                        </h3>
                        <div className={`inline-block px-8 py-4 rounded-2xl shadow-xl text-4xl font-bold border-4 ${
                          classifierResult === 'Excellent' ? 'bg-green-100 text-green-700 border-green-300' :
                          classifierResult === 'Good' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                          classifierResult === 'Moderate' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                          classifierResult === 'Poor' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                          classifierResult === 'Very Poor' ? 'bg-red-100 text-red-700 border-red-300' :
                          'bg-gray-100 text-gray-700 border-gray-300'
                        }`}>
                          {classifierResult}
                        </div>
                        <div className="mt-4 text-lg text-gray-600">
                          Water Quality Status for <strong>{formData.location}</strong>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-xl border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">📊 Analysis Parameters:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div><strong>Year:</strong> {formData.year}</div>
                          <div><strong>Location:</strong> {formData.location}</div>
                          <div><strong>Temperature:</strong> {formData.temp}°C</div>
                          <div><strong>DO:</strong> {formData.do} mg/L</div>
                          <div><strong>pH:</strong> {formData.ph}</div>
                          <div><strong>TDS:</strong> {formData.tds} mg/L</div>
                          <div><strong>BOD:</strong> {formData.bod} mg/L</div>
                          <div><strong>COD:</strong> {formData.cod} mg/L</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-red-600 text-lg font-semibold mb-2">
                        ⚠️ Classification Error
                      </div>
                      <div className="text-gray-600">
                        {classifierResult || 'Unknown error occurred'}
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