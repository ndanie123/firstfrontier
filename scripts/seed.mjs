// Seeds the Supabase `divisions` and `division_metrics` tables from the
// local CSV sources. Run with: npm run seed
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role, not anon)
// in .env.local — the service role key bypasses RLS so this can write.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env.local") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local before seeding."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

function parseCsv(text) {
  const rows = [];
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return rows;
  const headers = splitCsvLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (values.length === 1 && values[0] === "") continue;
    const row = {};
    headers.forEach((h, idx) => (row[h.trim()] = (values[idx] ?? "").trim()));
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function toNumberOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const divisionsCsvPath = path.join(root, "aec_divisions_vic.csv");
  const electorsCsvPath = path.join(root, "data", "electors.csv");
  const metricsCsvPath = path.join(root, "data", "division_metrics.csv");

  const divisionsRaw = parseCsv(readFileSync(divisionsCsvPath, "utf-8"));

  let electorsById = {};
  if (existsSync(electorsCsvPath)) {
    const electorsRaw = parseCsv(readFileSync(electorsCsvPath, "utf-8"));
    for (const row of electorsRaw) {
      electorsById[row.division_id] = toNumberOrNull(row.electors);
    }
  } else {
    console.warn(`No ${electorsCsvPath} found — electors will be null.`);
  }

  const divisions = divisionsRaw.map((row) => ({
    id: row.id,
    name: row.name,
    state: "VIC",
    area_km2: toNumberOrNull(row.area_km2),
    classification: row.classification || null,
    member_name: row.member_name || null,
    member_party: row.member_party || null,
    electors: electorsById[row.id] ?? null,
  }));

  console.log(`Upserting ${divisions.length} divisions...`);
  const { error: divError } = await supabase.from("divisions").upsert(divisions, { onConflict: "id" });
  if (divError) throw divError;

  if (existsSync(metricsCsvPath)) {
    const metricsRaw = parseCsv(readFileSync(metricsCsvPath, "utf-8"));
    const metrics = metricsRaw
      .filter((row) => row.division_id && row.metric_key)
      .map((row) => ({
        division_id: row.division_id,
        metric_key: row.metric_key,
        metric_value: toNumberOrNull(row.metric_value),
        metric_value_text: row.metric_value_text || null,
        unit: row.unit || null,
        source: row.source || null,
        year: toNumberOrNull(row.year),
      }));
    console.log(`Upserting ${metrics.length} division_metrics rows...`);
    const { error: metError } = await supabase
      .from("division_metrics")
      .upsert(metrics, { onConflict: "division_id,metric_key" });
    if (metError) throw metError;
  } else {
    console.warn(`No ${metricsCsvPath} found — skipping division_metrics.`);
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
