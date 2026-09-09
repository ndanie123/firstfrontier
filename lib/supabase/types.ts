export type Division = {
  id: string;
  name: string;
  state: string;
  area_km2: number | null;
  classification: string | null;
  member_name: string | null;
  member_party: string | null;
  electors: number | null;
};

export type DivisionMetric = {
  division_id: string;
  metric_key: string;
  metric_value: number | null;
  metric_value_text: string | null;
  unit: string | null;
  source: string | null;
  year: number | null;
};

export const METRIC_LABELS: Record<string, { label: string; format?: "currency" | "number" | "text" }> = {
  population: { label: "Population", format: "number" },
  median_age: { label: "Median age", format: "number" },
  median_personal_income_weekly: { label: "Median personal income", format: "currency" },
  median_household_income_weekly: { label: "Median household income", format: "currency" },
  median_rent_weekly: { label: "Median weekly rent", format: "currency" },
  median_mortgage_monthly: { label: "Median monthly mortgage", format: "currency" },
  avg_household_size: { label: "Avg. household size", format: "number" },
};
