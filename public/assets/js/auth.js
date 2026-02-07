// ============================================
// Authentication Utilities
// Supabase Auth Integration
// ============================================

/**
 * Check if user is logged in
 * @returns {Promise<boolean>}
 */
async function isLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
}

/**
 * Get current user
 * @returns {Promise<Object|null>}
 */
async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Get user details from users table
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }

    return user;
}

/**
 * Check if current user is admin
 * @returns {Promise<boolean>}
 */
async function isAdmin() {
    const user = await getCurrentUser();
    return user && user.role === 'admin';
}

/**
 * Require login - redirect to login if not authenticated
 */
async function requireLogin() {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

/**
 * Require admin - redirect to dashboard if not admin
 */
async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        window.location.href = '/dashboard.html';
        return false;
    }
    return true;
}

/**
 * Login user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} { success, message, user }
 */
async function login(username, password) {
    try {
        // First, get the user's email from username
        // We'll use username as email for Supabase Auth
        const email = `${username}@karinderya.local`;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            return {
                success: false,
                message: 'Mali ang username o password.'
            };
        }

        // Get user details
        const user = await getCurrentUser();

        return {
            success: true,
            message: 'Login successful',
            user: user
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'May error sa pag-login. Subukan ulit.'
        };
    }
}

/**
 * Register new user
 * @param {string} username
 * @param {string} password
 * @param {string} role - 'admin' or 'staff'
 * @returns {Promise<Object>} { success, message, user }
 */
async function register(username, password, role = 'staff') {
    try {
        // Use username as email for Supabase Auth
        const email = `${username}@karinderya.local`;

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (authError) {
            return {
                success: false,
                message: 'Hindi makapag-register. Subukan ang ibang username.'
            };
        }

        // Create user record in users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([
                {
                    auth_id: authData.user.id,
                    username: username,
                    role: role
                }
            ])
            .select()
            .single();

        if (userError) {
            console.error('Error creating user record:', userError);
            return {
                success: false,
                message: 'May error sa pag-create ng user record.'
            };
        }

        return {
            success: true,
            message: 'Registration successful',
            user: userData
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'May error sa pag-register. Subukan ulit.'
        };
    }
}

/**
 * Logout user
 */
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout error:', error);
    }
    window.location.href = '/index.html';
}

/**
 * Update user password
 * @param {string} newPassword
 * @returns {Promise<Object>} { success, message }
 */
async function updatePassword(newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return {
                success: false,
                message: 'Hindi ma-update ang password.'
            };
        }

        return {
            success: true,
            message: 'Password updated successfully'
        };
    } catch (error) {
        console.error('Password update error:', error);
        return {
            success: false,
            message: 'May error sa pag-update ng password.'
        };
    }
}

/**
 * Update username
 * @param {string} newUsername
 * @returns {Promise<Object>} { success, message }
 */
async function updateUsername(newUsername) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Update username in users table
        const { error } = await supabase
            .from('users')
            .update({ username: newUsername })
            .eq('id', user.id);

        if (error) {
            return {
                success: false,
                message: 'Hindi ma-update ang username.'
            };
        }

        // Update email in auth
        const newEmail = `${newUsername}@karinderya.local`;
        const { error: authError } = await supabase.auth.updateUser({
            email: newEmail
        });

        if (authError) {
            console.error('Auth email update error:', authError);
        }

        return {
            success: true,
            message: 'Username updated successfully'
        };
    } catch (error) {
        console.error('Username update error:', error);
        return {
            success: false,
            message: 'May error sa pag-update ng username.'
        };
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.auth = {
        isLoggedIn,
        getCurrentUser,
        isAdmin,
        requireLogin,
        requireAdmin,
        login,
        register,
        logout,
        updatePassword,
        updateUsername
    };
}
