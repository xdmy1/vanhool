import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ManufacturerOption = {
  id: string;
  name: string;
  slug: string;
};

export type VehicleMakeOption = {
  id: string;
  name: string;
  slug: string;
};

export async function adminListManufacturers(): Promise<ManufacturerOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("manufacturers")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return (data ?? []) as ManufacturerOption[];
}

export async function adminListVehicleMakes(): Promise<VehicleMakeOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_makes")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as VehicleMakeOption[];
}

/** Pre-loaded n:n links for a product — used to populate the form. */
export async function adminGetProductVehicleMakeIds(
  productId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_vehicle_makes")
    .select("vehicle_make_id")
    .eq("product_id", productId);
  return (data ?? []).map((r) => r.vehicle_make_id as string);
}
