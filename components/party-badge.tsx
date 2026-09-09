import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PARTY_STYLES: Record<string, string> = {
  Labor: "bg-red-600/10 text-red-700 border-red-600/20 dark:text-red-400",
  Liberal: "bg-blue-600/10 text-blue-700 border-blue-600/20 dark:text-blue-400",
  Nationals: "bg-green-700/10 text-green-800 border-green-700/20 dark:text-green-400",
  Independent: "bg-violet-600/10 text-violet-700 border-violet-600/20 dark:text-violet-400",
};

export function PartyBadge({ party }: { party: string | null }) {
  if (!party) return <Badge variant="outline">Unknown</Badge>;
  const style = PARTY_STYLES[party] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("font-medium", style)}>
      {party}
    </Badge>
  );
}
