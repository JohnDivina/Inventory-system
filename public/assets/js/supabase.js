// ============================================
// Supabase Client Initialization (Browser / Vercel)
// ============================================

// ============================================
// Supabase Client Initialization
// ============================================

// Validate config exists (loaded from config.js)
if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
    console.error('❌ Supabase config is missing or incomplete');
    throw new Error('Supabase configuration error');
}

// Access the global supabase object from CDN
// Assuming the Supabase CDN script has already loaded and exposed `supabase` globally.
// For example, by including <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> in your HTML.
if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient === 'undefined') {
    console.error('❌ Supabase global object or createClient function not found. Ensure the Supabase CDN script is loaded.');
    throw new Error('Supabase CDN script not loaded');
}
const { createClient } = window.supabase;

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

// Export globally for use in other scripts
if (typeof window !== 'undefined') {
    window.supabase = supabaseClient;
}
