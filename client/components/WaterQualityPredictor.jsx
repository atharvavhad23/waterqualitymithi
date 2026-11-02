import React, { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const defaultForm = {
  Year: new Date().getFullYear(),
  Location: "Bandra",
  Temp: 25,
  DO: 7,
  pH: 7,
  TDS: 500,
  BOD: 5,
  COD: 20,
};

export default function WaterQualityPredictor() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
  const response = await fetch("http://localhost:8000/api/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          Year: Number(form.Year),
          Temp: Number(form.Temp),
          DO: Number(form.DO),
          pH: Number(form.pH),
          TDS: Number(form.TDS),
          BOD: Number(form.BOD),
          COD: Number(form.COD),
        }),
      });
      const data = await response.json();
      if (response.ok) setResult(data.predicted_WQI);
      else setError(data.error || "Prediction failed");
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  // Helper for badge color and icon
  const getBadge = (wqi) => {
    if (!wqi) return null;
    let color = "bg-gray-300 text-gray-800";
    let icon = <CheckCircle className="inline w-5 h-5 mr-1" />;
    let text = "";
    if (wqi.toLowerCase() === "good") {
      color = "bg-green-200 text-green-800 animate-pulse";
      icon = <CheckCircle className="inline w-5 h-5 mr-1" />;
      text = "Water is clean and safe.";
    } else if (wqi.toLowerCase() === "moderate") {
      color = "bg-yellow-100 text-yellow-800 animate-pulse";
      icon = <AlertTriangle className="inline w-5 h-5 mr-1" />;
      text = "Water quality is moderate. Caution advised.";
    } else if (wqi.toLowerCase() === "poor") {
      color = "bg-red-200 text-red-800 animate-pulse";
      icon = <XCircle className="inline w-5 h-5 mr-1" />;
      text = "Water is polluted. Not safe for use.";
    }
    return (
      <div className={`flex items-center gap-2 mt-2 p-3 rounded shadow ${color} transition-all duration-500`}>
        {icon}
        <span className="font-semibold text-lg">{wqi}</span>
        <span className="ml-2 italic text-sm">{text}</span>
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200">
      <h2 className="text-2xl font-extrabold mb-4 text-blue-800 tracking-tight">Water Quality Prediction</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {Object.keys(defaultForm).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="font-medium mb-1 text-blue-700">{key}</label>
            <input
              className="border border-blue-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
              name={key}
              value={form[key]}
              onChange={handleChange}
              required
              type={key === "Location" ? "text" : "number"}
              step="any"
            />
          </div>
        ))}
        <button
          type="submit"
          className="col-span-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded mt-2 font-semibold shadow hover:from-blue-700 hover:to-blue-500 transition-all"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Predicting...</span>
          ) : "Predict WQI"}
        </button>
      </form>
      {result && (
        <div className="mt-6">
          <div className="text-center text-lg font-bold mb-2">Prediction Result</div>
          {getBadge(result)}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded flex items-center">
          <XCircle className="inline w-5 h-5 mr-2" />
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
