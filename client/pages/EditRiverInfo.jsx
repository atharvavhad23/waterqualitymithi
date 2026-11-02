import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { getRivers, upsertRiver } from "@/lib/rivers";

function isAdmin() {
  try {
    return localStorage.getItem("role") === "admin";
  } catch (e) {
    return false;
  }
}

export default function EditRiverInfo() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const rivers = useMemo(() => getRivers(), []);
  const existing = rivers.find((r) => r.slug === slug);

  const [error, setError] = useState("");
  const [form, setForm] = useState(() => {
    const info = existing?.info || {};
    const toLines = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
    return {
      overview: info.overview || "",
      biodiversity: info.biodiversity || "",
      cultural_note: info.cultural_note || "",
      best_time_to_visit: info.best_time_to_visit || "",
      highlights: toLines(info.highlights),
      nearby_attractions: toLines(info.nearby_attractions),
      local_tips: toLines(info.local_tips),
    };
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  if (!existing) {
    return (
      <div className="p-6">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Not found</CardTitle>
            <CardDescription>
              The river whose info you are trying to edit does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parseLines = (text) =>
    String(text || "")
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const info = {
      overview: form.overview.trim(),
      biodiversity: form.biodiversity.trim(),
      cultural_note: form.cultural_note.trim(),
      best_time_to_visit: form.best_time_to_visit.trim(),
      highlights: parseLines(form.highlights),
      nearby_attractions: parseLines(form.nearby_attractions),
      local_tips: parseLines(form.local_tips),
    };

    upsertRiver({ slug: existing.slug, info }, slug);
    navigate("/dashboard");
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Info</CardTitle>
          <CardDescription>
            Add interesting details for{" "}
            <span className="font-medium">{existing.location}</span>
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
              <Label htmlFor="overview">Overview</Label>
              <textarea
                id="overview"
                name="overview"
                value={form.overview}
                onChange={handleChange}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="best_time_to_visit">Best time to visit</Label>
                <Input
                  id="best_time_to_visit"
                  name="best_time_to_visit"
                  value={form.best_time_to_visit}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cultural_note">Cultural note</Label>
                <Input
                  id="cultural_note"
                  name="cultural_note"
                  value={form.cultural_note}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biodiversity">Biodiversity</Label>
              <textarea
                id="biodiversity"
                name="biodiversity"
                value={form.biodiversity}
                onChange={handleChange}
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="highlights">Highlights (one per line)</Label>
                <textarea
                  id="highlights"
                  name="highlights"
                  value={form.highlights}
                  onChange={handleChange}
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="nearby_attractions">
                  Nearby attractions (one per line)
                </Label>
                <textarea
                  id="nearby_attractions"
                  name="nearby_attractions"
                  value={form.nearby_attractions}
                  onChange={handleChange}
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="local_tips">Local tips (one per line)</Label>
                <textarea
                  id="local_tips"
                  name="local_tips"
                  value={form.local_tips}
                  onChange={handleChange}
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Info</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
