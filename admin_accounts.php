<?php
require_once __DIR__ . '/includes/auth.php';
requireAdmin(); // Only admins can access

$pageTitle = 'Admin Accounts - Karinderya Management System';
include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
?>

<main class="main-content">
    <div class="page-header">
        <div class="flex-between">
            <div>
                <h1>Admin Accounts</h1>
                <p>Pamahalaan ang mga Users</p>
            </div>
            <button class="btn btn-primary" onclick="showUserModal()">+ Bagong User</button>
        </div>
    </div>
    
    <!-- Users Table -->
    <div class="card">
        <div class="card-header">
            <h3>Mga Users</h3>
        </div>
        <div class="card-body">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        <tr>
                            <td colspan="4" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<!-- User Modal -->
<div class="modal" id="userModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="userModalTitle">Bagong User</h3>
        </div>
        <div class="modal-body">
            <form id="userForm">
                <input type="hidden" id="userId" name="user_id">
                
                <div class="form-group">
                    <label for="username">Username *</label>
                    <input type="text" id="username" name="username" class="form-control" required>
                </div>
                
                <div class="form-group" id="passwordGroup">
                    <label for="password">Password *</label>
                    <input type="password" id="password" name="password" class="form-control">
                    <small style="color: var(--text-secondary);">Minimum 6 characters</small>
                </div>
                
                <div class="form-group">
                    <label for="role">Role *</label>
                    <select id="role" name="role" class="form-control" required>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="hideUserModal()">Kanselahin</button>
            <button class="btn btn-primary" onclick="saveUser()">I-save</button>
        </div>
    </div>
</div>

<!-- Reset Password Modal -->
<div class="modal" id="resetPasswordModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Reset Password</h3>
        </div>
        <div class="modal-body">
            <form id="resetPasswordForm">
                <input type="hidden" id="resetUserId">
                
                <div class="form-group">
                    <label for="newPassword">Bagong Password *</label>
                    <input type="password" id="newPassword" class="form-control" required>
                    <small style="color: var(--text-secondary);">Minimum 6 characters</small>
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">Kumpirmahin ang Password *</label>
                    <input type="password" id="confirmPassword" class="form-control" required>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="hideResetPasswordModal()">Kanselahin</button>
            <button class="btn btn-primary" onclick="resetPassword()">I-reset</button>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
const currentUserId = <?php echo $_SESSION['user_id']; ?>;

document.addEventListener('DOMContentLoaded', loadUsers);

async function loadUsers() {
    try {
        const response = await fetch('/Cinventory/api/user_operations.php?action=list');
        const data = await response.json();
        
        if (data.success) {
            displayUsers(data.users);
        } else {
            Toast.error('Hindi ma-load ang mga users.');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        Toast.error('May error sa pag-load ng users.');
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    tbody.innerHTML = users.map(user => {
        const isCurrentUser = user.id == currentUserId;
        const createdDate = new Date(user.created_at).toLocaleDateString('en-PH');
        
        return `
            <tr>
                <td>
                    <strong>${user.username}</strong>
                    ${isCurrentUser ? '<span class="badge badge-info" style="margin-left: 0.5rem;">You</span>' : ''}
                </td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'badge-success' : 'badge-info'}">
                        ${user.role.toUpperCase()}
                    </span>
                </td>
                <td>${createdDate}</td>
                <td>
                    ${!isCurrentUser ? `
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">Edit</button>
                            <button class="btn btn-sm btn-secondary" onclick="showResetPasswordModal(${user.id}, '${user.username}')">Reset Password</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id}, '${user.username}')">Delete</button>
                        </div>
                    ` : '<em style="color: var(--text-secondary);">-</em>'}
                </td>
            </tr>
        `;
    }).join('');
}

function showUserModal(userId = null) {
    document.getElementById('userModalTitle').textContent = userId ? 'Edit User' : 'Bagong User';
    document.getElementById('userId').value = userId || '';
    
    if (userId) {
        document.getElementById('passwordGroup').style.display = 'none';
        document.getElementById('password').removeAttribute('required');
    } else {
        document.getElementById('passwordGroup').style.display = 'block';
        document.getElementById('password').setAttribute('required', 'required');
        clearForm('userForm');
    }
    
    document.getElementById('userModal').classList.add('show');
}

function hideUserModal() {
    document.getElementById('userModal').classList.remove('show');
    clearForm('userForm');
}

async function editUser(userId) {
    try {
        const response = await fetch(`/Cinventory/api/user_operations.php?action=get&id=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            const user = data.user;
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('role').value = user.role;
            
            showUserModal(userId);
        }
    } catch (error) {
        console.error('Error loading user:', error);
        Toast.error('May error sa pag-load ng user.');
    }
}

async function saveUser() {
    const userId = document.getElementById('userId').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    if (!username || !role) {
        Toast.error('Kumpletuhin ang lahat ng fields.');
        return;
    }
    
    if (!userId && (!password || password.length < 6)) {
        Toast.error('Password dapat minimum 6 characters.');
        return;
    }
    
    try {
        const response = await fetch('/Cinventory/api/user_operations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: userId ? 'update' : 'create',
                user_id: userId || undefined,
                username: username,
                password: password || undefined,
                role: role
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            Toast.success(userId ? 'User updated!' : 'Bagong user naidagdag!');
            hideUserModal();
            loadUsers();
        } else {
            Toast.error(data.message || 'May error sa pag-save.');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        Toast.error('May error sa pag-save.');
    }
}

function deleteUser(userId, username) {
    ConfirmModal.show(
        `Sigurado ka bang gusto mong tanggalin si "${username}"?`,
        'Tanggalin ang User',
        async () => {
            try {
                const response = await fetch('/Cinventory/api/user_operations.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'delete',
                        user_id: userId
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Toast.success('User tinanggal!');
                    loadUsers();
                } else {
                    Toast.error(data.message || 'Hindi matanggal ang user.');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                Toast.error('May error sa pagtanggal.');
            }
        }
    );
}

function showResetPasswordModal(userId, username) {
    document.getElementById('resetUserId').value = userId;
    document.getElementById('resetPasswordModal').classList.add('show');
    clearForm('resetPasswordForm');
}

function hideResetPasswordModal() {
    document.getElementById('resetPasswordModal').classList.remove('show');
    clearForm('resetPasswordForm');
}

async function resetPassword() {
    const userId = document.getElementById('resetUserId').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || newPassword.length < 6) {
        Toast.error('Password dapat minimum 6 characters.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        Toast.error('Passwords hindi tugma.');
        return;
    }
    
    try {
        const response = await fetch('/Cinventory/api/user_operations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'reset_password',
                user_id: userId,
                new_password: newPassword
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            Toast.success('Password na-reset na!');
            hideResetPasswordModal();
        } else {
            Toast.error(data.message || 'May error sa pag-reset.');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        Toast.error('May error sa pag-reset.');
    }
}
</script>
