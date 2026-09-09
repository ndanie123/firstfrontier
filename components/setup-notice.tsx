import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Connect Supabase to see live data</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Add <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
        <code className="rounded bg-muted px-1 py-0.5">.env.local</code>, run{" "}
        <code className="rounded bg-muted px-1 py-0.5">npm run seed</code> to load the dataset,
        then restart the dev server.
      </CardContent>
    </Card>
  );
}
