<?php
/**
 * Registration Page
 * Create new user accounts (staff role by default)
 */

require_once __DIR__ . '/includes/auth.php';

// Redirect if already logged in
if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
$success = '';

// Handle registration form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    // Validation
    if (empty($username) || empty($password) || empty($confirmPassword)) {
        $error = 'All fields are required.';
    } elseif (strlen($username) < 3) {
        $error = 'Username must be at least 3 characters long.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } elseif ($password !== $confirmPassword) {
        $error = 'Passwords do not match.';
    } else {
        try {
            // Check if username already exists
            $sql = "SELECT id FROM users WHERE username = ?";
            $existingUser = fetchOne($sql, [$username]);
            
            if ($existingUser) {
                $error = 'Username already exists. Please choose another.';
            } else {
                // Hash password and create user
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $insertSql = "INSERT INTO users (username, password, role) VALUES (?, ?, 'staff')";
                executeQuery($insertSql, [$username, $hashedPassword]);
                
                $success = 'Account created successfully! You can now log in.';
                
                // Auto-login after registration
                authenticateUser($username, $password);
                header('Location: dashboard.php');
                exit;
            }
        } catch (Exception $e) {
            error_log("Registration Error: " . $e->getMessage());
            $error = 'An error occurred during registration. Please try again.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - Karinderya Management System</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>🍲 Karinderya</h1>
                <p>Create Your Account</p>
            </div>
            
            <?php if ($error): ?>
                <div class="alert alert-error" role="alert">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert alert-success" role="alert">
                    <?php echo htmlspecialchars($success); ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" action="" class="auth-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        class="form-control" 
                        required 
                        autofocus
                        autocomplete="username"
                        minlength="3"
                        value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>"
                    >
                    <small class="form-text">At least 3 characters</small>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-control" 
                        required
                        autocomplete="new-password"
                        minlength="6"
                    >
                    <small class="form-text">At least 6 characters</small>
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirm_password" 
                        name="confirm_password" 
                        class="form-control" 
                        required
                        autocomplete="new-password"
                        minlength="6"
                    >
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    Create Account
                </button>
            </form>
            
            <div class="auth-footer">
                <p>Already have an account? <a href="login.php">Sign in</a></p>
            </div>
        </div>
    </div>
</body>
</html>
