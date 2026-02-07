// ============================================
// Supabase Configuration
// ============================================

// IMPORTANT: Replace these with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

const SUPABASE_CONFIG = {
    url: 'https://yrhrgeservvztgmroyjp.supabase.co', // e.g., 'https://yrhrgeservvztgmroyjp.supabase.co'
    anonKey: 'sb_publishable_3njw44SkolW2yJZ2MMO6cQ_2DAzI8JG' // Your anon/public key
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}
