"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyBadge } from "@/components/party-badge";
import { formatArea, formatNumber } from "@/lib/format";
import type { Division } from "@/lib/supabase/types";

const ALL = "all";

export function DivisionsExplorer({ divisions }: { divisions: Division[] }) {
  const [query, setQuery] = useState("");
  const [classification, setClassification] = useState(ALL);
  const [party, setParty] = useState(ALL);

  const classifications = useMemo(
    () => [...new Set(divisions.map((d) => d.classification).filter(Boolean))] as string[],
    [divisions]
  );
  const parties = useMemo(
    () => [...new Set(divisions.map((d) => d.member_party).filter(Boolean))] as string[],
    [divisions]
  );

  const filtered = divisions.filter((d) => {
    const matchesQuery =
      query.trim().length === 0 ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      (d.member_name ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesClassification = classification === ALL || d.classification === classification;
    const matchesParty = party === ALL || d.member_party === party;
    return matchesQuery && matchesClassification && matchesParty;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by division or member name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={classification} onValueChange={(v) => setClassification(v ?? ALL)}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All classifications</SelectItem>
            {classifications.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={party} onValueChange={(v) => setParty(v ?? ALL)}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Party" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All parties</SelectItem>
            {parties.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {divisions.length} divisions
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => (
          <Link key={d.id} href={`/divisions/${d.id}`}>
            <Card className="h-full transition-colors hover:border-foreground/30">
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <CardTitle>{d.name}</CardTitle>
                <PartyBadge party={d.member_party} />
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>{d.member_name ?? "Member unknown"}</p>
                <p>{d.classification ?? "Unclassified"}</p>
                <div className="mt-2 flex justify-between text-xs">
                  <span>{formatArea(d.area_km2)}</span>
                  <span>{formatNumber(d.electors)} electors</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No divisions match your filters.
        </p>
      )}
    </div>
  );
}
