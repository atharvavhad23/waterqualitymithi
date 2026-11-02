import { useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Droplets, Thermometer, AlertTriangle, Zap, ArrowLeft } from "lucide-react";

const RIVER_DATA = [
  {
    slug: "mithi",
    name: "Mithi River",
    description: "An urban river in Mumbai facing industrial and domestic pollution challenges.",
    wqi: 48,
    status: "Moderate",
    ph: 7.1,
    oxygen: 4.5,
    temperature: 27,
    turbidity: 62,
    trend: "down",
    locations: ["Bandra Kurla Complex", "Andheri", "Kurla"]
  },
  {
    slug: "godavari",
    name: "Godavari",
    description: "One of India's longest rivers, crucial for irrigation and drinking water across multiple states.",
    wqi: 72,
    status: "Good",
    ph: 7.4,
    oxygen: 7.9,
    temperature: 25,
    turbidity: 30,
    trend: "up",
    locations: ["Nashik", "Nanded", "Rajahmundry"]
  },
  {
    slug: "krishna",
    name: "Krishna",
    description: "A major river in southern India supporting agriculture and hydropower.",
    wqi: 66,
    status: "Moderate",
    ph: 7.0,
    oxygen: 6.2,
    temperature: 24,
    turbidity: 40,
    trend: "up",
    locations: ["Sangli", "Vijayawada", "Mahabaleshwar"]
  },
  {
    slug: "tapi",
    name: "Tapi",
    description: "Flows through central India with seasonal variations impacting water quality.",
    wqi: 58,
    status: "Moderate",
    ph: 7.3,
    oxygen: 5.6,
    temperature: 26,
    turbidity: 50,
    trend: "down",
    locations: ["Surat", "Burhanpur", "Bhussawal"]
  }
];

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "excellent":
      return "bg-green-500";
    case "good":
      return "bg-nature-500";
    case "moderate":
      return "bg-yellow-500";
    case "poor":
      return "bg-orange-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

// Simple synthetic dataset generator for Mithi River
function genMithiSampleCSV(days = 90) {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const randn = () => {
    // Box–Muller
    const u = 1 - Math.random();
    const v = 1 - Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };
  const rows = [];
  const today = new Date();
  rows.push(["date","ph","do_mg_l","temperature_c","turbidity_ntu","bod_mg_l","nitrates_mg_l","phosphates_mg_l","wqi"].join(","));
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - i));
    const ph = clamp(7.1 + 0.15 * Math.sin(i/7) + 0.2 * randn(), 6.5, 8.2);
    const dox = clamp(4.5 + 0.6 * Math.sin(i/5 + 1) + 1.0 * randn(), 2.0, 8.5);
    const temp = clamp(26 + 0.5 * Math.sin(i/10) + 1.0 * randn(), 22, 33);
    const turb = clamp(60 + 8 * Math.sin(i/6) + 20 * Math.random() + 10 * randn(), 15, 200);
    const bod = clamp(6 + 1.2 * Math.sin(i/9) + 2.0 * randn(), 2, 15);
    const no3 = clamp(1.8 + 0.6 * Math.sin(i/8) + 0.8 * randn(), 0.1, 8);
    const po4 = clamp(0.6 + 0.25 * Math.sin(i/11) + 0.4 * randn(), 0.01, 3);
    // Crude WQI heuristic (0-100); higher is better
    let wqi = 100;
    wqi -= Math.abs(ph - 7) * 6;
    wqi -= Math.max(0, 6 - dox) * 10;
    wqi -= turb * 0.2;
    wqi -= bod * 2.5;
    wqi -= no3 * 2;
    wqi -= po4 * 6;
    wqi -= Math.max(0, temp - 25) * 0.7;
    wqi = Math.round(clamp(wqi, 5, 95));
    rows.push([
      d.toISOString().slice(0,10),
      ph.toFixed(2),
      dox.toFixed(2),
      temp.toFixed(1),
      turb.toFixed(1),
      bod.toFixed(2),
      no3.toFixed(2),
      po4.toFixed(2),
      wqi
    ].join(","));
  }
  return rows.join("\n");
}

export default function RiverDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const river = useMemo(() => RIVER_DATA.find(r => r.slug === slug), [slug]);

  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState([]); // preview parsed rows (array of objects)

  const parseCSV = useCallback((text) => {
    const norm = text.replace(/^\uFEFF/, ""); // strip BOM if present
    const lines = norm.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const cols = line.split(",").map(c => c.trim());
      const obj = {};
      headers.forEach((h, i) => {
        const v = cols[i];
        const num = Number(v);
        obj[h] = Number.isFinite(num) && h !== "date" ? num : v;
      });
      return obj;
    });
  }, []);

  // quick stats for preview
  const computeStats = useCallback((data) => {
    if (!data.length) return null;
    const wqiVals = data.map(r => Number(r.wqi)).filter(Number.isFinite);
    const wqiMean = wqiVals.length ? (wqiVals.reduce((a,b)=>a+b,0) / wqiVals.length) : undefined;
    const ds = data.map(r => new Date(r.date)).filter(d => !isNaN(+d));
    const minD = ds.length ? new Date(Math.min(...ds)) : undefined;
    const maxD = ds.length ? new Date(Math.max(...ds)) : undefined;
    return {
      wqiMean: wqiMean !== undefined ? Number(wqiMean.toFixed(1)) : undefined,
      dateFrom: minD ? minD.toISOString().slice(0,10) : undefined,
      dateTo: maxD ? maxD.toISOString().slice(0,10) : undefined,
    };
  }, []);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setCsvText(text);
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
  }, [parseCSV]);

  const handleGenerate = useCallback(() => {
    const text = genMithiSampleCSV(90);
    setCsvText(text);
    setRows(parseCSV(text));
  }, [parseCSV]);

  const handlePaste = useCallback(() => {
    try {
      const parsed = parseCSV(csvText);
      setRows(parsed);
    } catch (e) {
      console.error(e);
      alert("Failed to parse CSV");
    }
  }, [csvText, parseCSV]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(csvText);
      alert("CSV copied");
    } catch {
      alert("Copy failed");
    }
  }, [csvText]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mithi_water_quality.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [csvText]);

  const handleLoadSample = useCallback(async () => {
    try {
      const text = await fetch("/mithi_water_quality.csv").then((r) => r.text());
      setCsvText(text);
      setRows(parseCSV(text));
    } catch (e) {
      console.error(e);
      alert("Failed to load sample CSV");
    }
  }, [parseCSV]);

  if (!river) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>River not found</CardTitle>
            <CardDescription>The requested river does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{river.name} - Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Water Quality Overview</CardTitle>
            <Badge className={`${getStatusColor(river.status)} text-white`}>{river.status}</Badge>
          </div>
          <CardDescription>Water Quality Index: {(river.wqiText || river.wqi)}/100</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">{river.description}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>WQI Score</span>
              <span>{(river.wqiText || river.wqi)}/100</span>
            </div>
            <Progress value={river.wqi} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-muted-foreground">pH Level</div>
                <div className="font-medium">{river.phText || river.ph}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-muted-foreground">Oxygen (mg/L)</div>
                <div className="font-medium">{river.oxygenText || river.oxygen}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-muted-foreground">Temperature (°C)</div>
                <div className="font-medium">{river.temperatureText || river.temperature}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-muted-foreground">Turbidity (NTU)</div>
                <div className="font-medium">{river.turbidityText || river.turbidity}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Common Monitoring Locations</div>
            <div className="flex flex-wrap gap-2">
              {river.locations.map((loc) => (
                <span key={loc} className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dataset section (only for Mithi) */}
      {river.slug === "mithi" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dataset (Mithi River)</CardTitle>
            <CardDescription>
              Generate, upload, or paste CSV data to prepare for ML analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hidden file input + label button improves reliability */}
            <input id="csvUpload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <label htmlFor="csvUpload" className="cursor-pointer">Upload CSV</label>
              </Button>
              <Button variant="outline" onClick={handleGenerate}>Generate sample CSV</Button>
              <Button variant="outline" onClick={handleLoadSample}>Load sample CSV</Button>
              <Button variant="outline" onClick={() => { setCsvText(""); setRows([]); }}>Clear</Button>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={handleCopy} disabled={!csvText}>Copy CSV</Button>
                <Button onClick={handleDownload} disabled={!csvText}>Download CSV</Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Paste CSV</div>
              <textarea
                className="w-full h-40 p-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="date,ph,do_mg_l,temperature_c,turbidity_ntu,bod_mg_l,nitrates_mg_l,phosphates_mg_l,wqi"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
              <div>
                <Button variant="outline" onClick={handlePaste}>Parse</Button>
              </div>
            </div>

            {rows.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Preview ({rows.length} rows)
                </div>
                <div className="overflow-auto rounded border border-gray-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        {Object.keys(rows[0]).map((h) => (
                          <th key={h} className="px-2 py-1 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 5).map((r, i) => (
                        <tr key={i} className="border-t">
                          {Object.keys(rows[0]).map((h) => (
                            <td key={h} className="px-2 py-1">{String(r[h])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Stats (quick glance) */}
                <div className="text-xs text-muted-foreground">
                  Columns: {Object.keys(rows[0]).join(", ")}
                  {(() => {
                    const s = computeStats(rows);
                    return s ? ` • Date range: ${s.dateFrom || "-"} → ${s.dateTo || "-"} • Mean WQI: ${s.wqiMean ?? "-"}` : null;
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
