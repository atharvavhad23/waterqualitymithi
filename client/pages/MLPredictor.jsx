import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MLPredictor() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🌊 Mithi River Water Quality AI
          </h1>
          <p className="text-xl text-gray-700">
            Choose your preferred ML analysis method
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-xl bg-white/95 hover:scale-105 transition-all">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white">
              <CardTitle className="text-2xl text-center">
                🏷️ WQI Classifier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌊</div>
                  <h3 className="text-xl font-bold mb-2">Water Quality Classification</h3>
                  <p className="text-gray-600 text-sm">
                    Classify water quality: Excellent, Good, Moderate, Poor, Very Poor
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">📊 Inputs:</h4>
                  <div className="text-sm text-green-700">
                    Year, Location, Temperature, DO, pH, TDS, BOD, COD
                  </div>
                </div>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link to="/dashboard/wqi-classifier">
                    🚀 Launch Classifier
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/95 hover:scale-105 transition-all">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <CardTitle className="text-2xl text-center">
                🔮 Linear Regression
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔬</div>
                  <h3 className="text-xl font-bold mb-2">Water Quality Prediction</h3>
                  <p className="text-gray-600 text-sm">
                    Predict WQI, TDS, BOD, and COD values
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📊 Inputs:</h4>
                  <div className="text-sm text-blue-700">
                    Year, Location, Temperature, DO, pH
                  </div>
                </div>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/dashboard/linear-regression">
                    🚀 Launch Predictor
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl bg-white/95">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
            <CardTitle className="text-2xl text-center">
              ⚖️ Model Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4 text-green-700">🏷️ Classifier</th>
                    <th className="text-center py-3 px-4 text-blue-700">🔮 Regression</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Parameters</td>
                    <td className="py-3 px-4 text-center">8</td>
                    <td className="py-3 px-4 text-center">5</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Output</td>
                    <td className="py-3 px-4 text-center">WQI Category</td>
                    <td className="py-3 px-4 text-center">WQI + TDS, BOD, COD</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Accuracy</td>
                    <td className="py-3 px-4 text-center">99.85%</td>
                    <td className="py-3 px-4 text-center">99%+</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Best For</td>
                    <td className="py-3 px-4 text-center">Policy Decisions</td>
                    <td className="py-3 px-4 text-center">Research</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}