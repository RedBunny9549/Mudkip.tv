import { createClient } from '@supabase/supabase-js';

// Direct keys to prevent "supabaseUrl is required" errors
const supabaseUrl = 'https://zwmbhqbuxyoqbejjwjnv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bWJocWJ1eHlvcWJlamp3am52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzkzNzYsImV4cCI6MjA5MTMxNTM3Nn0.Qa-FsAn1ZupO9wJ69VcLd08lhwrH98N3IqfJQHhWspc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);