// ============================================
// Settings JavaScript
// Manage user settings and system configuration
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    if (!await auth.requireLogin()) return;

    // Load user info
    const user = await auth.getCurrentUser();
    if (user) {
        document.getElementById('currentUsername').textContent = user.username;
        document.getElementById('currentUsernameDisplay').textContent = user.username;

        if (user.role === 'admin') {
            document.getElementById('adminMenu').style.display = 'flex';
        }
    }
});

/**
 * Update username
 */
async function updateUsername() {
    const newUsername = document.getElementById('newUsername').value.trim();

    if (!newUsername) {
        Toast.error('Ilagay ang bagong username.');
        return;
    }

    if (newUsername.length < 3) {
        Toast.error('Username must be at least 3 characters.');
        return;
    }

    try {
        Loading.show();

        const result = await auth.updateUsername(newUsername);

        Loading.hide();

        if (result.success) {
            Toast.success('Username updated successfully!');
            document.getElementById('currentUsernameDisplay').textContent = newUsername;
            document.getElementById('currentUsername').textContent = newUsername;
            document.getElementById('newUsername').value = '';
        } else {
            Toast.error(result.message);
        }
    } catch (error) {
        Loading.hide();
        console.error('Error updating username:', error);
        Toast.error('May error sa pag-update ng username.');
    }
}

/**
 * Update password
 */
async function updatePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!newPassword || !confirmPassword) {
        Toast.error('Kumpletuhin ang lahat ng fields.');
        return;
    }

    if (newPassword.length < 6) {
        Toast.error('Password must be at least 6 characters.');
        return;
    }

    if (newPassword !== confirmPassword) {
        Toast.error('Passwords do not match.');
        return;
    }

    try {
        Loading.show();

        const result = await auth.updatePassword(newPassword);

        Loading.hide();

        if (result.success) {
            Toast.success('Password updated successfully!');
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            Toast.error(result.message);
        }
    } catch (error) {
        Loading.hide();
        console.error('Error updating password:', error);
        Toast.error('May error sa pag-update ng password.');
    }
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await auth.logout();
});
