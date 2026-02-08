// IMPORTANT: Replace these with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/yrhrgeservvztgmroyjp/settings/api

// 🚨 CRITICAL: The anonKey below is INVALID and must be replaced!
// Valid Supabase anon keys are JWT tokens (200+ characters starting with "eyJ...")
// Go to: https://app.supabase.com/project/yrhrgeservvztgmroyjp/settings/api
// Copy the "anon public" key and paste it below

const SUPABASE_CONFIG = {
    url: 'https://yrhrgeservvztgmroyjp.supabase.co',
    anonKey: 'sb_publishable_3njw44SkolW2yJZ2MMO6cQ_2DAzI8JG' // Supabase publishable key
};

// Export for browser use
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
