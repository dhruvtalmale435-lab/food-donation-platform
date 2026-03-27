const SUPABASE_URL = "https://ezukbghxcererfqiynrs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6dWtiZ2h4Y2VyZXJmcWl5bnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODEwNjIsImV4cCI6MjA4OTg1NzA2Mn0.k_6xw2ekIeS9YlfXKuVru770rU33sQkEmdWNDzHhI_o";

// Use supabasejs global from CDN (window.supabase is the library, db is our client)
const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
