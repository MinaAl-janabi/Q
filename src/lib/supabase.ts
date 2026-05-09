import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qhxijafiwefnljpkmdhc.supabase.co"; // ضع URL هنا
const supabaseAnonKey = "sb_publishable_Q5DafueKTGGOqU7-mApbmQ_KAqSARp3";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);