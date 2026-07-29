import { createClient } from '@supabase/supabase-js'

const rawUrl = 'https://agbphtpxvcrihpfgfwwx.supabase.co'

// Clean up the URL to prevent "Invalid path specified in request URL" errors
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYnBodHB4dmNyaWhwZmdmd3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzY3MTcsImV4cCI6MjEwMDkxMjcxN30.UhKjhmXv6D4ARSt5y4Xj8NiMCq1uJEZbu4WH93VcOeo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)