// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eoduegpeoxvtgjcuztkr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZHVlZ3Blb3h2dGdqY3V6dGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDgzNTIsImV4cCI6MjA2NTQ4NDM1Mn0.OI5MHiQWRD8RxADH8MLxxE1qV4sggViINXzsJ0j7rw4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);