import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  LineElement,
  PointElement
);

const COLORS = ["#22c55e", "#facc15", "#f87171", "#60a5fa", "#a78bfa"];

export default function WaterQualityCharts({ data }) {
  // If data is passed, show a dynamic line chart for predictor/regression pages
  if (data) {
    const chartData = {
      labels: ["Temp", "DO", "pH", "TDS", "BOD", "COD"],
      datasets: [
        {
          label: "Input Values",
          data: [
            Number(data.Temp) || 0,
            Number(data.DO) || 0,
            Number(data.pH) || 0,
            Number(data.TDS) || 0,
            Number(data.BOD) || 0,
            Number(data.COD) || 0,
          ],
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14,165,233,0.2)",
          tension: 0.5,
          fill: true,
        },
      ],
    };
    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Water Quality Inputs" },
      },
      animation: {
        duration: 1800,
        easing: "easeInOutQuart",
      },
    };
    return (
      <div className="relative my-8">
        {/* Futuristic animated river background */}
        <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
          <svg className="w-full h-full animate-wave-futuristic" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="riverGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <path fill="url(#riverGradient)" fillOpacity="0.7" d="M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,176C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            <path fill="#38bdf8" fillOpacity="0.5" d="M0,224L60,218.7C120,213,240,203,360,186.7C480,171,600,149,720,154.7C840,160,960,192,1080,186.7C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-blue-100 p-4">
          <Bar data={chartData} options={options} />
        </div>
        <style>{`
          .animate-wave-futuristic { animation: waveFuturistic 6s linear infinite; }
          @keyframes waveFuturistic {
            0% { transform: translateX(0); }
            100% { transform: translateX(-120px); }
          }
        `}</style>
      </div>
    );
  }
}
