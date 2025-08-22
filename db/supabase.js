import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const connectSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
};
