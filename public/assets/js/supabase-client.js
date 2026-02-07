// ============================================
// Supabase Client Initialization
// ============================================

// Initialize Supabase client
const supabase = supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.supabase = supabase;
}
