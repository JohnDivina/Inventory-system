// ============================================
// Supabase Client Initialization (Browser / Vercel)
// ============================================

// Validate config exists (loaded from config.js)
if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
    console.error('❌ Supabase config is missing or incomplete');
    throw new Error('Supabase configuration error');
}

// Store reference to Supabase library from CDN before we overwrite window.supabase
if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient === 'undefined') {
    console.error('❌ Supabase library not loaded. Ensure the CDN script is loaded first.');
    throw new Error('Supabase CDN script not loaded');
}

// Get createClient from the Supabase library
const supabaseLib = window.supabase;
const { createClient } = supabaseLib;

// Initialize Supabase client
const supabaseClient = createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
);

// Verify client was created
if (!supabaseClient) {
    console.error('❌ Failed to create Supabase client');
    throw new Error('Supabase client initialization failed');
}

console.log('✅ Supabase client initialized successfully');

// Export client globally (this overwrites the library object, which is fine)
window.supabase = supabaseClient;

