import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROWS = Number(process.argv[2] || 40000);
const outPath = path.resolve(__dirname, "../client/public/mithi_water_quality.csv");

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function randn() {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generate(rows = 40000) {
  const header = "date,ph,do_mg_l,temperature_c,turbidity_ntu,bod_mg_l,nitrates_mg_l,phosphates_mg_l,wqi";
  const out = [header];

  // Start from ~rows days ago up to today (1 row per day)
  const start = new Date();
  start.setDate(start.getDate() - rows);

  for (let i = 0; i < rows; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    // Synthetic signal with seasonal/weekly variation + noise
    const ph = clamp(7.1 + 0.15 * Math.sin(i / 7) + 0.2 * randn(), 6.5, 8.2);
    const dox = clamp(4.5 + 0.6 * Math.sin(i / 5 + 1) + 1.0 * randn(), 2.0, 9.5);
    const temp = clamp(26 + 0.5 * Math.sin(i / 10) + 1.0 * randn(), 18, 36);
    const turb = clamp(60 + 8 * Math.sin(i / 6) + 20 * Math.random() + 10 * randn(), 5, 500);
    const bod = clamp(6 + 1.2 * Math.sin(i / 9) + 2.0 * randn(), 1, 30);
    const no3 = clamp(1.8 + 0.6 * Math.sin(i / 8) + 0.8 * randn(), 0.01, 20);
    const po4 = clamp(0.6 + 0.25 * Math.sin(i / 11) + 0.4 * randn(), 0.005, 6);

    // WQI heuristic (0-100)
    let wqi = 100;
    wqi -= Math.abs(ph - 7) * 6;
    wqi -= Math.max(0, 6 - dox) * 10;
    wqi -= turb * 0.15;
    wqi -= bod * 2.2;
    wqi -= no3 * 1.8;
    wqi -= po4 * 5.5;
    wqi -= Math.max(0, temp - 25) * 0.6;
    wqi = Math.round(clamp(wqi, 1, 99));

    out.push([
      d.toISOString().slice(0, 10),
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

  return out.join("\n");
}

console.time("gen-csv");
const csv = generate(ROWS);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, csv, "utf8");
console.timeEnd("gen-csv");
console.log(`Wrote ${ROWS} rows to: ${outPath}`);
