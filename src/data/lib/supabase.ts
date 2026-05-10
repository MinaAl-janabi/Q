import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qhxijafiwefnljpkmdhc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoeGlqYWZpd2VmbmxqcGttZGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzI4NjIsImV4cCI6MjA5Mzc0ODg2Mn0.0DZVx2fX_4HoAuDacml7Gb-oOieA5nyqo3dCftvIaaY"; // ← الكامل من Dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey);