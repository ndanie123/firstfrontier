import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyBadge } from "@/components/party-badge";
import { SetupNotice } from "@/components/setup-notice";
import { getDivisions, isSupabaseConfigured } from "@/lib/supabase";
import { formatArea, formatNumber } from "@/lib/format";

export const revalidate = 3600;

export default async function Home() {
  const divisions = isSupabaseConfigured ? await getDivisions().catch(() => []) : [];

  const totalElectors = divisions.reduce((sum, d) => sum + (d.electors ?? 0), 0);
  const totalArea = divisions.reduce((sum, d) => sum + (d.area_km2 ?? 0), 0);

  const partyCounts = new Map<string, number>();
  for (const d of divisions) {
    const key = d.member_party ?? "Unknown";
    partyCounts.set(key, (partyCounts.get(key) ?? 0) + 1);
  }
  const partyBreakdown = [...partyCounts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <section className="flex flex-col gap-6 py-20 sm:py-28">
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          38 divisions · 1 state
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Every federal electorate in Victoria, in one place.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Members, boundaries, and 2021 Census demographics for all 38 Commonwealth Electoral
          Divisions in Victoria — sourced from the AEC and ABS.
        </p>
        <div className="flex gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/divisions" />}>
            Browse divisions
          </Button>
        </div>
      </section>

      {!isSupabaseConfigured || divisions.length === 0 ? (
        <div className="pb-20">
          <SetupNotice />
        </div>
      ) : (
        <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Divisions" value={formatNumber(divisions.length)} />
          <StatCard label="Enrolled electors" value={formatNumber(totalElectors)} />
          <StatCard label="Total area" value={formatArea(totalArea)} />
          <StatCard
            label="Independents"
            value={formatNumber(partyCounts.get("Independent") ?? 0)}
          />

          <Card className="sm:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Seats by party</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {partyBreakdown.map(([party, count]) => (
                  <div
                    key={party}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <PartyBadge party={party === "Unknown" ? null : party} />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
