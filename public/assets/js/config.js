// IMPORTANT: Replace these with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/yrhrgeservvztgmroyjp/settings/api

// 🚨 CRITICAL: The anonKey below is INVALID and must be replaced!
// Valid Supabase anon keys are JWT tokens (200+ characters starting with "eyJ...")
// Go to: https://app.supabase.com/project/yrhrgeservvztgmroyjp/settings/api
// Copy the "anon public" key and paste it below

const SUPABASE_CONFIG = {
    url: 'https://yrhrgeservvztgmroyjp.supabase.co',
    anonKey: 'REPLACE_WITH_YOUR_ACTUAL_ANON_KEY_FROM_SUPABASE_DASHBOARD' // Must be 200+ char JWT token
};

// Export for browser use
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
