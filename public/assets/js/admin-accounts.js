// ============================================
// Admin Accounts JavaScript
// Manage users (Admin only)
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication and admin role
    if (!await auth.requireLogin()) return;
    if (!await auth.requireAdmin()) return;

    // Load user info
    const user = await auth.getCurrentUser();
    if (user) {
        document.getElementById('currentUsername').textContent = user.username;
        document.getElementById('adminMenu').style.display = 'flex';
    }

    loadUsers();
});

/**
 * Load all users
 */
async function loadUsers() {
    try {
        Loading.show();

        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayUsers(users);
        Loading.hide();
    } catch (error) {
        Loading.hide();
        console.error('Error loading users:', error);
        Toast.error('Hindi ma-load ang mga users.');
    }
}

/**
 * Display users in table
 */
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Walang users pa.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${user.username}</strong></td>
            <td>
                <span class="badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}">
                    ${user.role.toUpperCase()}
                </span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>${formatDate(user.updated_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}', '${user.username}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Show user modal
 */
function showUserModal(userId = null) {
    document.getElementById('userModalTitle').textContent = userId ? 'Edit User' : 'Bagong User';
    document.getElementById('userId').value = userId || '';

    if (!userId) {
        clearForm('userForm');
        document.getElementById('passwordGroup').style.display = 'block';
    } else {
        document.getElementById('passwordGroup').style.display = 'none';
    }

    document.getElementById('userModal').classList.add('show');
}

/**
 * Hide user modal
 */
function hideUserModal() {
    document.getElementById('userModal').classList.remove('show');
    clearForm('userForm');
}

/**
 * Edit user
 */
async function editUser(userId) {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        document.getElementById('userId').value = user.id;
        document.getElementById('userUsername').value = user.username;
        document.getElementById('userRole').value = user.role;

        showUserModal(userId);
    } catch (error) {
        console.error('Error loading user:', error);
        Toast.error('May error sa pag-load ng user.');
    }
}

/**
 * Save user
 */
async function saveUser() {
    const userId = document.getElementById('userId').value;
    const username = document.getElementById('userUsername').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;

    if (!username || !role) {
        Toast.error('Kumpletuhin ang lahat ng fields.');
        return;
    }

    if (!userId && !password) {
        Toast.error('Password is required for new users.');
        return;
    }

    try {
        Loading.show();

        if (userId) {
            // Update existing user
            const { error } = await supabase
                .from('users')
                .update({
                    username: username,
                    role: role
                })
                .eq('id', userId);

            if (error) throw error;

            Toast.success('User updated!');
        } else {
            // Create new user via auth.register
            const result = await auth.register(username, password, role);

            if (!result.success) {
                Loading.hide();
                Toast.error(result.message);
                return;
            }

            Toast.success('Bagong user naidagdag!');
        }

        Loading.hide();
        hideUserModal();
        loadUsers();
    } catch (error) {
        Loading.hide();
        console.error('Error saving user:', error);
        Toast.error('May error sa pag-save.');
    }
}

/**
 * Delete user
 */
function deleteUser(userId, username) {
    ConfirmModal.show(
        `Sigurado ka bang gusto mong tanggalin ang user "${username}"?`,
        async () => {
            try {
                Loading.show();

                // Get user's auth_id first
                const { data: user, error: getUserError } = await supabase
                    .from('users')
                    .select('auth_id')
                    .eq('id', userId)
                    .single();

                if (getUserError) throw getUserError;

                // Delete from users table (will cascade delete from auth.users due to FK)
                const { error } = await supabase
                    .from('users')
                    .delete()
                    .eq('id', userId);

                if (error) throw error;

                Loading.hide();
                Toast.success('User tinanggal!');
                loadUsers();
            } catch (error) {
                Loading.hide();
                console.error('Error deleting user:', error);
                Toast.error('Hindi matanggal ang user.');
            }
        }
    );
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await auth.logout();
});
