"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  classificationColor,
  makeSequentialScale,
  partyColor,
  CLASSIFICATION_LEGEND,
  PARTY_LEGEND,
} from "@/lib/map-colors";
import { formatArea, formatCurrency, formatNumber } from "@/lib/format";
import { METRIC_LABELS } from "@/lib/supabase/types";

type DivisionRow = {
  id: string;
  name: string;
  member_party: string | null;
  classification: string | null;
  electors: number | null;
  area_km2: number | null;
  metrics: Record<string, number | null>;
};

const NUMERIC_FIELDS = [
  { key: "electors", label: "Enrolled electors", format: "number" as const },
  { key: "area_km2", label: "Area (km²)", format: "number" as const },
  ...Object.entries(METRIC_LABELS).map(([key, meta]) => ({
    key,
    label: meta.label,
    format: meta.format ?? "number",
  })),
];

const COLOR_OPTIONS = [
  { key: "member_party", label: "Party" },
  { key: "classification", label: "Classification" },
  ...NUMERIC_FIELDS.map((f) => ({ key: f.key, label: f.label })),
];

function valueFor(d: DivisionRow, key: string): number | null {
  if (key === "electors") return d.electors;
  if (key === "area_km2") return d.area_km2;
  return d.metrics[key] ?? null;
}

function formatValue(key: string, value: number | null): string {
  if (value === null) return "No data";
  const field = NUMERIC_FIELDS.find((f) => f.key === key);
  if (field?.format === "currency") return formatCurrency(value);
  if (key === "area_km2") return formatArea(value);
  return formatNumber(value);
}

export function ElectorateMap({ divisions }: { divisions: DivisionRow[] }) {
  const router = useRouter();
  const [geojson, setGeojson] = useState<FeatureCollection<Geometry> | null>(null);
  const [colorBy, setColorBy] = useState("member_party");
  const [hovered, setHovered] = useState<{ id: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // public/data/vic-divisions.geojson has its ring winding reversed from
    // the RFC 7946 CCW convention the ABS export used. d3-geo's fitSize
    // (spherical geoBounds) needs the opposite winding for polygons at this
    // longitude/latitude, otherwise it measures the ring's complement and
    // computes a ~600x-too-small scale (every division collapses to a
    // speck). If this file is ever regenerated from source, reverse every
    // ring's point order again before shipping it.
    fetch("/data/vic-divisions.geojson")
      .then((r) => r.json())
      .then(setGeojson)
      .catch(() => setGeojson(null));
  }, []);

  const byId = useMemo(() => new Map(divisions.map((d) => [d.id, d])), [divisions]);

  const idFor = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

  const width = 760;
  const height = 560;

  const pathFor = useMemo(() => {
    if (!geojson) return null;
    const projection = geoMercator().fitSize([width, height], geojson);
    return geoPath(projection);
  }, [geojson]);

  const isNumeric = colorBy === "electors" || colorBy === "area_km2" || colorBy in METRIC_LABELS;

  const scale = useMemo(() => {
    if (!isNumeric) return null;
    const values = divisions.map((d) => valueFor(d, colorBy)).filter((v): v is number => v !== null);
    if (values.length === 0) return null;
    return makeSequentialScale(Math.min(...values), Math.max(...values), "light");
  }, [divisions, colorBy, isNumeric]);

  function colorForDivision(id: string): string {
    const d = byId.get(id);
    if (!d) return "#e1e0d9";
    if (colorBy === "member_party") return partyColor(d.member_party, "light");
    if (colorBy === "classification") return classificationColor(d.classification, "light");
    const v = valueFor(d, colorBy);
    if (v === null || !scale) return "#e1e0d9";
    return scale(v);
  }

  const hoveredDivision = hovered ? byId.get(hovered.id) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Colour divisions by</p>
        <Select value={colorBy} onValueChange={(v) => v && setColorBy(v)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLOR_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border border-border bg-card"
      >
        {!geojson || !pathFor ? (
          <div className="flex h-[480px] items-center justify-center text-sm text-muted-foreground">
            Loading map…
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            role="img"
            aria-label="Map of Victoria's federal electoral divisions"
          >
            {geojson.features.map((f, i) => {
              const name = (f.properties as { name?: string })?.name ?? "";
              const id = idFor(name);
              const d = pathFor(f) ?? "";
              return (
                <path
                  key={id || i}
                  d={d}
                  fill={colorForDivision(id)}
                  style={{ stroke: "var(--card)", strokeWidth: 0.75 }}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setHovered({ id, x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => router.push(`/divisions/${id}`)}
                />
              );
            })}
          </svg>
        )}

        {hoveredDivision && hovered && (
          <div
            className="pointer-events-none absolute z-10 max-w-56 rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
            style={{ left: hovered.x + 12, top: hovered.y + 12 }}
          >
            <p className="font-medium">{hoveredDivision.name}</p>
            <p className="text-muted-foreground">
              {colorBy === "member_party"
                ? hoveredDivision.member_party ?? "Unknown"
                : colorBy === "classification"
                  ? hoveredDivision.classification ?? "Unknown"
                  : formatValue(colorBy, valueFor(hoveredDivision, colorBy))}
            </p>
          </div>
        )}
      </div>

      <Legend colorBy={colorBy} scale={scale} divisions={divisions} />
    </div>
  );
}

function Legend({
  colorBy,
  scale,
  divisions,
}: {
  colorBy: string;
  scale: ((v: number) => string) | null;
  divisions: DivisionRow[];
}) {
  if (colorBy === "member_party") {
    return (
      <div className="flex flex-wrap gap-4 text-sm">
        {PARTY_LEGEND.map(({ party, color }) => (
          <div key={party} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm border border-border/50"
              style={{ backgroundColor: color.light }}
            />
            <span className="text-muted-foreground">{party}</span>
          </div>
        ))}
      </div>
    );
  }

  if (colorBy === "classification") {
    return (
      <div className="flex flex-wrap gap-4 text-sm">
        {CLASSIFICATION_LEGEND.map(({ classification, color }) => (
          <div key={classification} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm border border-border/50"
              style={{ backgroundColor: color.light }}
            />
            <span className="text-muted-foreground">{classification}</span>
          </div>
        ))}
      </div>
    );
  }

  if (!scale) {
    return <p className="text-sm text-muted-foreground">No data loaded for this metric.</p>;
  }

  const values = divisions.map((d) => valueFor(d, colorBy)).filter((v): v is number => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const stops = Array.from({ length: 20 }, (_, i) => scale(min + ((max - min) * i) / 19));

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{formatValue(colorBy, min)}</span>
      <div
        className="h-3 flex-1 rounded-full"
        style={{ background: `linear-gradient(to right, ${stops.join(",")})` }}
      />
      <span className="text-muted-foreground">{formatValue(colorBy, max)}</span>
    </div>
  );
}
