import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addRiver, generateSlug } from "@/lib/rivers";

function isAdmin() {
  try {
    return localStorage.getItem("role") === "admin";
  } catch (e) {
    return false;
  }
}

export default function AddRiver() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    wqi: "",
    status: "Moderate",
    ph: "",
    oxygen: "",
    temperature: "",
    turbidity: "",
    trend: "up",
    locations: "",
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const normalizePh = (val) => {
    const raw = String(val ?? "").trim();
    if (!raw) return { numeric: 7, text: "" };
    const m = raw.match(/(-?\d+(?:\.\d+)?)(?:\s*[-–—]\s*(-?\d+(?:\.\d+)?))?/);
    if (m) {
      const a = parseFloat(m[1]);
      const b = m[2] != null ? parseFloat(m[2]) : NaN;
      const hasRange = /[-–—]/.test(raw) && !isNaN(a) && !isNaN(b);
      const numeric = hasRange ? (a + b) / 2 : a;
      const text = hasRange ? raw : "";
      return { numeric: isNaN(numeric) ? 7 : numeric, text };
    }
    return { numeric: 7, text: raw };
  };

  const normalizeRangeOrNumber = (val, fallback) => {
    const raw = String(val ?? "").trim();
    if (!raw) return { numeric: fallback, text: "" };
    const m = raw.match(/(-?\d+(?:\.\d+)?)(?:\s*[-–—]\s*(-?\d+(?:\.\d+)?))?/);
    if (m) {
      const a = parseFloat(m[1]);
      const b = m[2] != null ? parseFloat(m[2]) : NaN;
      const hasRange = /[-–—]/.test(raw) && !isNaN(a) && !isNaN(b);
      const numeric = hasRange ? (a + b) / 2 : a;
      const text = hasRange ? raw : "";
      return { numeric: isNaN(numeric) ? fallback : numeric, text };
    }
    const onlyNum = parseFloat(raw);
    if (!isNaN(onlyNum)) return { numeric: onlyNum, text: "" };
    return { numeric: fallback, text: raw };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name) return setError("Name is required");
    if (!form.wqi) return setError("WQI is required");

    const river = {
      slug: generateSlug(form.name),
      location: form.name,
      ...(function(){ const { numeric, text } = normalizeRangeOrNumber(form.wqi, 50); return { wqi: Number(numeric), wqiText: text }; })(),
      status: form.status,
      ...(function(){ const { numeric, text } = normalizeRangeOrNumber(form.ph, 7); return { ph: Number(numeric), phText: text }; })(),
      ...(function(){ const { numeric, text } = normalizeRangeOrNumber(form.oxygen, 5); return { oxygen: Number(numeric), oxygenText: text }; })(),
      ...(function(){ const { numeric, text } = normalizeRangeOrNumber(form.temperature, 25); return { temperature: Number(numeric), temperatureText: text }; })(),
      ...(function(){ const { numeric, text } = normalizeRangeOrNumber(form.turbidity, 40); return { turbidity: Number(numeric), turbidityText: text }; })(),
      trend: form.trend,
    };

    addRiver(river);
    navigate("/dashboard");
  };

  return (
    <div className="p-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Add River</CardTitle>
          <CardDescription>
            Enter river details. Only admins can add rivers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wqi">WQI</Label>
                <Input
                  id="wqi"
                  name="wqi"
                  type="text"
                  placeholder="e.g. 72 or 65-80"
                  value={form.wqi}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Moderate</option>
                  <option>Poor</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ph">pH</Label>
                <Input
                  id="ph"
                  name="ph"
                  type="text"
                  placeholder="e.g. 7.2 or 6.5-8.0"
                  value={form.ph}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygen">Oxygen (mg/L)</Label>
                <Input
                  id="oxygen"
                  name="oxygen"
                  type="text"
                  placeholder="e.g. 7.5 or 6.5-8.0"
                  value={form.oxygen}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="text"
                  placeholder="e.g. 25 or 24-28"
                  value={form.temperature}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turbidity">Turbidity (NTU)</Label>
                <Input
                  id="turbidity"
                  name="turbidity"
                  type="text"
                  placeholder="e.g. 40 or 30-50"
                  value={form.turbidity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trend">Trend</Label>
              <select
                id="trend"
                name="trend"
                value={form.trend}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit">Add River</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
