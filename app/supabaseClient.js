import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yjppbzzkkeglvtpqohnw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcHBienpra2VnbHZ0cHFvaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI0NzYsImV4cCI6MjA4ODkwODQ3Nn0.fboW37-dvR30MUlKB5ccI-GEGQFoHx9v6gdhxlwWOT0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);