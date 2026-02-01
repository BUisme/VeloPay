// ============================================================
// config.js - Supabase Configuration
// ============================================================
// วิธีใช้งาน:
//  1. ไปที่ https://supabase.com → Sign Up → สร้าง Project ใหม่
//  2. ไปที่ Settings > API
//  3. Copy "Project URL"        → แล้วใส่ใน SUPABASE_URL ด้านล่าง
//  4. Copy "anon" key           → แล้วใส่ใน SUPABASE_ANON_KEY ด้านล่าง
// ============================================================

const SUPABASE_URL     = 'YOUR_SUPABASE_URL_HERE';       // ← ใส่ URL จาก Supabase
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // ← ใส่ anon key จาก Supabase

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
