import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.https://agbphtpxvcrihpfgfwwx.supabase.co/rest/v1/
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYnBodHB4dmNyaWhwZmdmd3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzY3MTcsImV4cCI6MjEwMDkxMjcxN30.UhKjhmXv6D4ARSt5y4Xj8NiMCq1uJEZbu4WH93VcOeo

export const supabase = createClient(supabaseUrl, supabaseAnonKey)