<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pageTitle = 'Settings - Karinderya Management System';
$currentUser = getCurrentUser();

// Handle form submission
$success = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'change_username') {
        $newUsername = trim($_POST['new_username'] ?? '');
        
        if (empty($newUsername)) {
            $error = 'Username ay required.';
        } else {
            try {
                // Check if username already exists
                $checkSql = "SELECT COUNT(*) as count FROM users WHERE username = ? AND id != ?";
                $result = fetchOne($checkSql, [$newUsername, $currentUser['id']]);
                
                if ($result['count'] > 0) {
                    $error = 'Username ay ginagamit na.';
                } else {
                    $sql = "UPDATE users SET username = ? WHERE id = ?";
                    executeQuery($sql, [$newUsername, $currentUser['id']]);
                    
                    $_SESSION['username'] = $newUsername;
                    $currentUser['username'] = $newUsername;
                    $success = 'Username successfully updated!';
                }
            } catch (Exception $e) {
                error_log("Error updating username: " . $e->getMessage());
                $error = 'May error sa pag-update.';
            }
        }
    }
    elseif ($action === 'change_password') {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        
        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            $error = 'Lahat ng password fields ay required.';
        } elseif (strlen($newPassword) < 6) {
            $error = 'Bagong password dapat minimum 6 characters.';
        } elseif ($newPassword !== $confirmPassword) {
            $error = 'Bagong password at confirmation hindi tugma.';
        } else {
            try {
                // Verify current password
                $sql = "SELECT password FROM users WHERE id = ?";
                $user = fetchOne($sql, [$currentUser['id']]);
                
                if (!password_verify($currentPassword, $user['password'])) {
                    $error = 'Kasalukuyang password ay mali.';
                } else {
                    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                    $updateSql = "UPDATE users SET password = ? WHERE id = ?";
                    executeQuery($updateSql, [$hashedPassword, $currentUser['id']]);
                    
                    $success = 'Password successfully updated!';
                }
            } catch (Exception $e) {
                error_log("Error updating password: " . $e->getMessage());
                $error = 'May error sa pag-update.';
            }
        }
    }
}

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
?>

<main class="main-content">
    <div class="page-header">
        <h1>Settings</h1>
        <p>Manage Account and System Settings</p>
    </div>
    
    <?php if ($success): ?>
        <div class="alert alert-success">
            <?php echo htmlspecialchars($success); ?>
        </div>
    <?php endif; ?>
    
    <?php if ($error): ?>
        <div class="alert alert-error">
            <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <!-- Change Username -->
        <div class="card">
            <div class="card-header">
                <h3>Change Username</h3>
            </div>
            <div class="card-body">
                <form method="POST" action="">
                    <input type="hidden" name="action" value="change_username">
                    
                    <div class="form-group">
                        <label>Current Username</label>
                        <input type="text" class="form-control" value="<?php echo htmlspecialchars($currentUser['username']); ?>" disabled>
                    </div>
                    
                    <div class="form-group">
                        <label for="new_username">New Username *</label>
                        <input type="text" id="new_username" name="new_username" class="form-control" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Update Username</button>
                </form>
            </div>
        </div>
        
        <!-- Change Password -->
        <div class="card">
            <div class="card-header">
                <h3>Change Password</h3>
            </div>
            <div class="card-body">
                <form method="POST" action="">
                    <input type="hidden" name="action" value="change_password">
                    
                    <div class="form-group">
                        <label for="current_password">Current Password *</label>
                        <input type="password" id="current_password" name="current_password" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="new_password">New Password *</label>
                        <input type="password" id="new_password" name="new_password" class="form-control" required>
                        <small style="color: var(--text-secondary);">Minimum 6 characters</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm_password">Confirm Password *</label>
                        <input type="password" id="confirm_password" name="confirm_password" class="form-control" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Update Password</button>
                </form>
            </div>
        </div>
    </div>
    
    <!-- System Information -->
    <div class="card">
        <div class="card-header">
            <h3>System Information</h3>
        </div>
        <div class="card-body">
            <table class="table">
                <tbody>
                    <tr>
                        <td><strong>System Name</strong></td>
                        <td>Inventory & Sales Management System</td>
                    </tr>
                    <tr>
                        <td><strong>Version</strong></td>
                        <td>1.0.0 MVP</td>
                    </tr>
                    <tr>
                        <td><strong>Currency</strong></td>
                        <td>Philippine Peso (₱)</td>
                    </tr>
                    <tr>
                        <td><strong>Low Stock Threshold</strong></td>
                        <td>10 units</td>
                    </tr>
                    <tr>
                        <td><strong>Your Role</strong></td>
                        <td>
                            <span class="badge <?php echo $currentUser['role'] === 'admin' ? 'badge-success' : 'badge-info'; ?>">
                                <?php echo strtoupper($currentUser['role']); ?>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
