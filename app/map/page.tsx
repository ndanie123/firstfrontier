import { ElectorateMap } from "@/components/electorate-map";
import { SetupNotice } from "@/components/setup-notice";
import { getAllMetrics, getDivisions, isSupabaseConfigured } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata = {
  title: "Map — Electorate Atlas",
};

export default async function MapPage() {
  const [divisions, metrics] = isSupabaseConfigured
    ? await Promise.all([getDivisions().catch(() => []), getAllMetrics().catch(() => [])])
    : [[], []];

  const metricsByDivision = new Map<string, Record<string, number | null>>();
  for (const m of metrics) {
    const bucket = metricsByDivision.get(m.division_id) ?? {};
    bucket[m.metric_key] = m.metric_value;
    metricsByDivision.set(m.division_id, bucket);
  }

  const rows = divisions.map((d) => ({
    id: d.id,
    name: d.name,
    member_party: d.member_party,
    classification: d.classification,
    electors: d.electors,
    area_km2: d.area_km2,
    metrics: metricsByDivision.get(d.id) ?? {},
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-comic text-4xl tracking-wide">Map</h1>
        <p className="text-muted-foreground">
          Victoria&rsquo;s 38 federal electoral divisions. Hover a division for details,
          click to see its full profile.
        </p>
      </div>

      {!isSupabaseConfigured || rows.length === 0 ? (
        <SetupNotice />
      ) : (
        <ElectorateMap divisions={rows} />
      )}
    </div>
  );
}
