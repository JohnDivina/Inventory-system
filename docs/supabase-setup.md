# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Karinderya Inventory System.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account or log in
3. Click "New Project"
4. Fill in the project details:
   - **Name**: Karinderya Inventory
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient
5. Click "Create new project"
6. Wait 2-3 minutes for provisioning

## Step 2: Get API Credentials

1. In your Supabase project dashboard, click "Settings" (gear icon)
2. Click "API" in the sidebar
3. Copy the following:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
4. Save these credentials - you'll need them later

## Step 3: Run Database Schema

1. In Supabase dashboard, click "SQL Editor" in the sidebar
2. Click "New query"
3. Open `supabase/schema.sql` from the project
4. Copy the entire contents and paste into the SQL Editor
5. Click "Run" or press `Ctrl+Enter`
6. Wait for success message: "Success. No rows returned"

### What This Does:
- Creates all tables (users, ulams, ingredients, etc.)
- Sets up indexes for performance
- Creates stored procedures for sales operations
- Adds triggers for automatic timestamp updates

## Step 4: Set Up Row Level Security (RLS)

1. In SQL Editor, click "New query"
2. Open `supabase/policies.sql` from the project
3. Copy and paste the entire contents
4. Click "Run"
5. Wait for success message

### What This Does:
- Enables RLS on all tables
- Creates policies for role-based access control
- Ensures admins can manage users
- Allows authenticated users to manage inventory and sales

## Step 5: Insert Sample Data (Optional)

1. In SQL Editor, click "New query"
2. Open `supabase/seed.sql` from the project
3. Copy and paste the entire contents
4. Click "Run"

### What This Does:
- Adds sample ingredients (meat, vegetables, rice, etc.)
- Creates sample ulams with recipes
- Inserts sample sales data for the last 7 days
- Sets default system settings

## Step 6: Create Admin User

Since authentication is handled by Supabase Auth, you need to create users through the Auth system:

### Option A: Via Supabase Dashboard

1. Go to "Authentication" > "Users" in the sidebar
2. Click "Add user" > "Create new user"
3. Fill in:
   - **Email**: `admin@karinderya.local`
   - **Password**: Choose a strong password
   - **Auto Confirm User**: Enable this
4. Click "Create user"
5. Copy the user's UUID (shown in the users table)
6. Go back to SQL Editor and run:
   ```sql
   INSERT INTO users (auth_id, username, role)
   VALUES ('PASTE_UUID_HERE', 'admin', 'admin');
   ```

### Option B: Via Application

1. Complete the configuration step below first
2. Open the application and go to the registration page
3. Register with username `admin` and a password
4. Go to Supabase Dashboard > SQL Editor
5. Run:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'admin';
   ```

## Step 7: Configure Application

1. Open `public/assets/js/config.js` in your project
2. Replace the placeholders:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://xxxxxxxxxxxxx.supabase.co', // Your Project URL
       anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Your anon key
   };
   ```
3. Save the file

## Step 8: Test the Connection

1. Open `public/index.html` in a web browser
2. Try logging in with your admin credentials
3. If successful, you should see the dashboard
4. If you get errors, check the browser console (F12)

## Common Issues

### "Invalid API key" Error
- Double-check that you copied the correct anon key
- Ensure there are no extra spaces or quotes
- Verify the URL ends with `.supabase.co`

### "User not found" Error
- Verify the user exists in Authentication > Users
- Check that the `users` table has a matching record
- Ensure `auth_id` in `users` table matches the UUID in Auth

### "Permission denied" Error
- Verify RLS policies were created successfully
- Check that the user's role is set correctly
- Ensure you're logged in

### SQL Errors
- Make sure you ran `schema.sql` before `policies.sql`
- Check for any error messages in the SQL Editor
- Verify all tables were created (check Database > Tables)

## Verification Checklist

After setup, verify the following:

- [ ] All tables exist in Database > Tables
- [ ] RLS is enabled on all tables (green shield icon)
- [ ] At least one user exists in Authentication > Users
- [ ] Matching record exists in `users` table
- [ ] Sample data loaded (if you ran seed.sql)
- [ ] Application can connect (no console errors)
- [ ] Can log in successfully
- [ ] Dashboard loads with data

## Next Steps

Once setup is complete:

1. Test all features (inventory, sales, admin accounts)
2. Create additional staff users via the application
3. Customize settings as needed
4. Deploy to Vercel (see main README)

## Security Recommendations

1. **Change Default Passwords**: If you used seed data, change all passwords
2. **Enable 2FA**: Enable two-factor authentication on your Supabase account
3. **Backup Database**: Set up automated backups in Supabase settings
4. **Monitor Usage**: Check Supabase dashboard for unusual activity
5. **Update RLS Policies**: Customize policies based on your needs

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs (Logs & Monitoring)
3. Verify all SQL scripts ran successfully
4. Check the main README troubleshooting section
