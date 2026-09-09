import { DivisionsExplorer } from "@/components/divisions-explorer";
import { SetupNotice } from "@/components/setup-notice";
import { getDivisions, isSupabaseConfigured } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata = {
  title: "Divisions — Electorate Atlas",
};

export default async function DivisionsPage() {
  const divisions = isSupabaseConfigured ? await getDivisions().catch(() => []) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-comic text-4xl tracking-wide">Divisions</h1>
        <p className="text-muted-foreground">
          All 38 Commonwealth Electoral Divisions in Victoria.
        </p>
      </div>

      {!isSupabaseConfigured || divisions.length === 0 ? (
        <SetupNotice />
      ) : (
        <DivisionsExplorer divisions={divisions} />
      )}
    </div>
  );
}
