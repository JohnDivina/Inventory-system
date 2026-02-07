// ============================================
// Supabase Configuration
// ============================================

// IMPORTANT: Replace these with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxxxxxxxxxx.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Your anon/public key
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}
