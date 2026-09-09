import { supabase } from "./client";
import type { Division, DivisionMetric } from "./types";

export async function getDivisions(): Promise<Division[]> {
  const { data, error } = await supabase.from("divisions").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getDivision(id: string): Promise<Division | null> {
  const { data, error } = await supabase.from("divisions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getDivisionMetrics(id: string): Promise<DivisionMetric[]> {
  const { data, error } = await supabase
    .from("division_metrics")
    .select("*")
    .eq("division_id", id);
  if (error) throw error;
  return data ?? [];
}

export async function getAllMetrics(): Promise<DivisionMetric[]> {
  const { data, error } = await supabase.from("division_metrics").select("*");
  if (error) throw error;
  return data ?? [];
}
