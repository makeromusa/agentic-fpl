import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mdfouypgqmdkkneagxso.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_dQkQDxHFf3ZXk7I62m9adw_WbXWQREh";

export const supabase = createClient(supabaseUrl, supabaseKey);
