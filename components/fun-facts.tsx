import { Mountain, TrendingUp, Users, Waves, Compass, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FACTS = [
  {
    icon: Users,
    fact: "About 7.12 million people call Victoria home (ABS, Dec 2025) — Australia's second most populous state, behind only New South Wales.",
  },
  {
    icon: TrendingUp,
    fact: "Victoria's population grew 1.7% in the year to December 2025, among the fastest growth rates of any Australian state.",
  },
  {
    icon: Compass,
    fact: "At 227,496 km², Victoria is the smallest mainland state by area — yet packs in more people per square kilometre than any other.",
  },
  {
    icon: Landmark,
    fact: "Around 77% of Victorians live in Greater Melbourne, making it one of the most metro-concentrated states in the country.",
  },
  {
    icon: Mountain,
    fact: "The state's highest point is Mount Bogong, rising 1,986 metres in the Victorian Alps.",
  },
  {
    icon: Waves,
    fact: "Wilsons Promontory — \"The Prom\" — is the southernmost point of mainland Australia.",
  },
];

export function FunFacts() {
  return (
    <section className="pb-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-comic text-3xl tracking-wide sm:text-4xl">
          Fun facts about Victoria
        </h2>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Geography &amp; population
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FACTS.map(({ icon: Icon, fact }, i) => (
          <Card key={i} className="h-full">
            <CardContent className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-secondary">
                <Icon className="size-4.5" />
              </span>
              <p className="text-sm leading-relaxed">{fact}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
