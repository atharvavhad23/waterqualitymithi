import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WaterQualityCharts from "@/components/WaterQualityCharts";


export default function MLRegression() {
  // Regression states
  const [regTemp, setRegTemp] = useState("");
  const [regDO, setRegDO] = useState("");
  const [regPH, setRegPH] = useState("");
  const [regTDS, setRegTDS] = useState("");
  const [regBOD, setRegBOD] = useState("");
  const [regCOD, setRegCOD] = useState("");
  const [regressionResult, setRegressionResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Regression handler
  const runRegression = async (e) => {
    e.preventDefault();
    const payload = {
      Temp: regTemp,
      DO: regDO,
      pH: regPH,
      TDS: regTDS,
      BOD: regBOD,
      COD: regCOD,
    };
    try {
      const response = await fetch("/api/predict-wqi-linear/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setRegressionResult(data.predicted_wqi || data.error || "Error");
      setShowResult(true);
    } catch (err) {
      setRegressionResult("Error");
      setShowResult(true);
    }
  };

  // Animated river background
  const riverBg = (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
      <svg className="w-full h-full animate-wave" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#60a5fa" fillOpacity="0.5" d="M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,176C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        <path fill="#3b82f6" fillOpacity="0.7" d="M0,224L60,218.7C120,213,240,203,360,186.7C480,171,600,149,720,154.7C840,160,960,192,1080,186.7C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
      </svg>
    </div>
  );

  return (
    <div className="relative p-4 max-w-2xl mx-auto space-y-8 min-h-[80vh] flex flex-col justify-center items-center">
      {riverBg}
      <Section title="Linear Regression WQI Predictor">
        <Card className="shadow-xl border-2 border-blue-200 bg-white/80 backdrop-blur-lg animate-fade-in">
          <CardContent>
            <form onSubmit={runRegression} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={regTemp} onChange={e => setRegTemp(e.target.value)} placeholder="Temp" className="border p-2 rounded focus:ring-2 focus:ring-blue-400 transition-all duration-300" />
                <input type="text" value={regDO} onChange={e => setRegDO(e.target.value)} placeholder="DO" className="border p-2 rounded focus:ring-2 focus:ring-blue-400 transition-all duration-300" />
                <input type="text" value={regPH} onChange={e => setRegPH(e.target.value)} placeholder="pH" className="border p-2 rounded focus:ring-2 focus:ring-blue-400 transition-all duration-300" />
                <input type="text" value={regTDS} onChange={e => setRegTDS(e.target.value)} placeholder="TDS" className="border p-2 rounded focus:ring-2 focus:ring-blue-400 transition-all duration-300" />
                <input type="text" value={regBOD} onChange={e => setRegBOD(e.target.value)} placeholder="BOD" className="border p-2 rounded focus:ring-2 focus:ring-blue-400 transition-all duration-300" />
                <input type="text" value={regCOD} onChange={e => setRegCOD(e.target.value)} placeholder="COD" className="border p-2 rounded focus:ring-2 focus:ring-blue-400 transition-all duration-300" />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded shadow-lg hover:scale-105 transition-transform duration-300">Predict WQI</Button>
            </form>
            <WaterQualityCharts data={{ Temp: regTemp, DO: regDO, pH: regPH, TDS: regTDS, BOD: regBOD, COD: regCOD }} />
            {showResult && (
              <div className="mt-4 animate-pop text-center">
                <span className="text-lg font-bold text-blue-700">Predicted WQI:</span>
                <span className="ml-2 text-2xl font-extrabold text-green-600 drop-shadow-lg">{regressionResult}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </Section>
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

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-300 animate-fade-in">{title}</h2>
      {children}
    </section>
  );
}
