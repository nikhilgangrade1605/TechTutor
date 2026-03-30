import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
export const supabase = createClient(
  "https://vpswmofzkntzqepxfxou.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc3dtb2Z6a250enFlcHhmeG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzA2NzYsImV4cCI6MjA4NjMwNjY3Nn0.AySSmGodVXYeUBg364v0bxLfLNrxR5pqj4XTNI5N2No"
);

// API Base URL
export const API_BASE_URL = "http://localhost:5000";

