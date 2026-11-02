import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Sparkles,
  Brain,
  LineChart,
  FileCheck
} from 'lucide-react';

export default function ModelPerformance() {
  const [performanceData, setPerformanceData] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
    fetchFeatureImportance();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ml/performance/');
      const data = await response.json();
      
      if (data.success) {
        setPerformanceData(data.performance_report);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch performance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatureImportance = async () => {
    try {
      const response = await fetch('/api/ml/feature-importance/');
      const data = await response.json();
      
      if (data.success) {
        setFeatureImportance(data.feature_importance);
      }
    } catch (err) {
      console.error('Failed to fetch feature importance:', err);
    }
  };

  const downloadReport = () => {
    if (!performanceData) return;
    
    const reportContent = JSON.stringify(performanceData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mithi_river_model_performance_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Moderate': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Performance Metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!performanceData) return null;

  const { classification_model, regression_models, professional_summary, dataset_info } = performanceData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Brain className="w-10 h-10" />
                ML Model Performance Report
              </h1>
              <p className="text-blue-100 text-lg">
                Mithi River Water Quality Prediction System
              </p>
              <div className="mt-4 flex gap-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Production Ready
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <FileCheck className="w-4 h-4 mr-1" />
                  Validated on {dataset_info.total_samples} Samples
                </Badge>
              </div>
            </div>
            <Button 
              onClick={downloadReport}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm">Total Samples</p>
              <p className="text-3xl font-bold">{dataset_info.total_samples}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm">Training Set</p>
              <p className="text-3xl font-bold">{dataset_info.training_samples}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm">Testing Set</p>
              <p className="text-3xl font-bold">{dataset_info.testing_samples}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-blue-100 text-sm">Locations</p>
              <p className="text-3xl font-bold">{dataset_info.locations.length}</p>
            </div>
          </div>
        </div>

        {/* Professional Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Classification Summary */}
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Target className="w-6 h-6" />
                Classification Model
              </CardTitle>
              <CardDescription className="text-green-700">
                {professional_summary.classification.model}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="text-2xl font-bold text-green-600">
                    {professional_summary.classification.accuracy}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">F1 Score</span>
                  <span className="text-2xl font-bold text-green-600">
                    {professional_summary.classification.f1_score}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge className={getStatusColor(professional_summary.classification.status)}>
                    {professional_summary.classification.status}
                  </Badge>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    {professional_summary.classification.recommendation}
                  </p>
                </div>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Use Case</p>
                  <p className="text-sm text-blue-700">
                    {professional_summary.classification.use_case}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regression Summary */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <LineChart className="w-6 h-6" />
                Regression Models
              </CardTitle>
              <CardDescription className="text-blue-700">
                {professional_summary.regression.model}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Accuracy</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {professional_summary.regression.average_accuracy}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average R² Score</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {professional_summary.regression.average_r2}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge className={getStatusColor(professional_summary.regression.status)}>
                    {professional_summary.regression.status}
                  </Badge>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    {professional_summary.regression.recommendation}
                  </p>
                </div>
                <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs font-semibold text-purple-800 mb-1">Use Case</p>
                  <p className="text-sm text-purple-700">
                    {professional_summary.regression.use_case}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Tabs */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Detailed Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classification" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="classification">Classification</TabsTrigger>
                <TabsTrigger value="regression">Regression</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>

              <TabsContent value="classification" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard 
                    label="Accuracy"
                    value={`${classification_model.performance_metrics.accuracy_percentage}%`}
                    icon={<Target className="w-5 h-5" />}
                    color="blue"
                  />
                  <MetricCard 
                    label="F1 Score (Weighted)"
                    value={classification_model.performance_metrics.f1_score_weighted}
                    icon={<Activity className="w-5 h-5" />}
                    color="green"
                  />
                  <MetricCard 
                    label="F1 Score (Macro)"
                    value={classification_model.performance_metrics.f1_score_macro}
                    icon={<Activity className="w-5 h-5" />}
                    color="purple"
                  />
                </div>

                {/* Classification Report */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Classification Report by Class
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Class</th>
                          <th className="px-4 py-3 text-left font-semibold">Precision</th>
                          <th className="px-4 py-3 text-left font-semibold">Recall</th>
                          <th className="px-4 py-3 text-left font-semibold">F1-Score</th>
                          <th className="px-4 py-3 text-left font-semibold">Support</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(classification_model.classification_report).map(([cls, metrics]) => (
                          <tr key={cls} className="border-b hover:bg-gray-100">
                            <td className="px-4 py-3 font-semibold">{cls}</td>
                            <td className="px-4 py-3">{metrics.precision}</td>
                            <td className="px-4 py-3">{metrics.recall}</td>
                            <td className="px-4 py-3">{metrics.f1_score}</td>
                            <td className="px-4 py-3">{metrics.support}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Confusion Matrix */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Confusion Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center">
                      <thead>
                        <tr>
                          <th className="px-4 py-2"></th>
                          {classification_model.classes.map(cls => (
                            <th key={cls} className="px-4 py-2 font-semibold">{cls}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {classification_model.confusion_matrix.map((row, i) => (
                          <tr key={i}>
                            <th className="px-4 py-2 font-semibold">{classification_model.classes[i]}</th>
                            {row.map((val, j) => (
                              <td 
                                key={j} 
                                className={`px-4 py-2 ${i === j ? 'bg-green-100 font-bold' : 'bg-red-50'}`}
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="regression" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(regression_models.performance_by_target).map(([target, metrics]) => (
                    <Card key={target} className="border-2">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                        <CardTitle className="text-lg">{target} Prediction</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">R² Score</span>
                            <span className="font-bold text-blue-600">{metrics.r2_score}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Accuracy</span>
                            <span className="font-bold text-green-600">{metrics.accuracy_percentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">RMSE</span>
                            <span className="font-bold">{metrics.rmse}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">MAE</span>
                            <span className="font-bold">{metrics.mae}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">MAPE</span>
                            <span className="font-bold">{metrics.mape}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Overall Regression Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Average R² Score</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {regression_models.overall_performance.average_r2_score}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Average Accuracy</p>
                      <p className="text-3xl font-bold text-green-600">
                        {regression_models.overall_performance.average_accuracy}%
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Average RMSE</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {regression_models.overall_performance.average_rmse}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                {featureImportance && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-lg mb-4">Classification Feature Importance</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {featureImportance.classification.interpretation}
                      </p>
                      <div className="space-y-3">
                        {Object.entries(featureImportance.classification.features).map(([feature, importance]) => (
                          <div key={feature} className="flex items-center gap-3">
                            <span className="w-24 text-sm font-semibold">{feature}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-6">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${importance * 100}%` }}
                              >
                                <span className="text-xs text-white font-bold">{importance}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-lg mb-4">Regression Features Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {regression_models.features_used.map(feature => (
                          <Badge key={feature} variant="outline" className="text-sm">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Model Information */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle>Model Architecture</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Classification Model</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {classification_model.model_type}</p>
                  <p><strong>N Estimators:</strong> {classification_model.n_estimators}</p>
                  <p><strong>Max Depth:</strong> {classification_model.max_depth}</p>
                  <p><strong>Classes:</strong> {classification_model.classes.join(', ')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Regression Models</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {regression_models.model_type}</p>
                  <p><strong>Targets:</strong> {regression_models.targets.join(', ')}</p>
                  <p><strong>Features:</strong> {regression_models.features_used.length} features</p>
                  <p><strong>Split:</strong> {dataset_info.train_test_split}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`rounded-lg p-4 border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
