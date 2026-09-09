import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PartyBadge } from "@/components/party-badge";
import { getDivision, getDivisionMetrics, getDivisions, isSupabaseConfigured } from "@/lib/supabase";
import { METRIC_LABELS } from "@/lib/supabase/types";
import { formatArea, formatCurrency, formatNumber } from "@/lib/format";

export const revalidate = 3600;

export async function generateStaticParams() {
  if (!isSupabaseConfigured) return [];
  const divisions = await getDivisions().catch(() => []);
  return divisions.map((d) => ({ id: d.id }));
}

export default async function DivisionPage({ params }: PageProps<"/divisions/[id]">) {
  const { id } = await params;
  const [division, metrics] = await Promise.all([
    getDivision(id).catch(() => null),
    getDivisionMetrics(id).catch(() => []),
  ]);

  if (!division) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <Link
        href="/divisions"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All divisions
      </Link>

      <div className="mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">{division.name}</h1>
          <PartyBadge party={division.member_party} />
        </div>
        <p className="text-lg text-muted-foreground">
          {division.member_name ?? "Member unknown"} · {division.classification ?? "Unclassified"}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <InfoCard label="Area" value={formatArea(division.area_km2)} />
        <InfoCard label="Enrolled electors" value={formatNumber(division.electors)} />
        <InfoCard label="State" value={division.state} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>2021 Census demographics</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No census metrics loaded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="hidden sm:table-cell">Source</TableHead>
                  <TableHead className="text-right">Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((m) => {
                  const meta = METRIC_LABELS[m.metric_key] ?? { label: m.metric_key };
                  const value =
                    m.metric_value_text ??
                    (meta.format === "currency"
                      ? formatCurrency(m.metric_value)
                      : formatNumber(m.metric_value));
                  return (
                    <TableRow key={m.metric_key}>
                      <TableCell className="font-medium">{meta.label}</TableCell>
                      <TableCell>
                        {value}
                        {m.unit && m.metric_value_text === null && meta.format !== "currency" ? (
                          <span className="ml-1 text-muted-foreground">{m.unit}</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {m.source ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {m.year ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
