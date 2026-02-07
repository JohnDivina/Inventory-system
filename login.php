<?php
/**
 * Login Page
 * Modern authentication with tsParticles animated background
 */

require_once __DIR__ . '/includes/auth.php';

// Redirect if already logged in
if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'Please enter both username and password.';
    } else {
        if (authenticateUser($username, $password)) {
            // Success - redirect to dashboard
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Invalid username or password.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Karinderya Management System</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="auth-page">
    <!-- tsParticles Background -->
    <div id="tsparticles"></div>
    
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>🍲 TC Eatery</h1>
                <p>Inventory & Sales Management</p>
            </div>
            
            <?php if ($error): ?>
                <div class="alert alert-error" role="alert">
                    <?php echo htmlspecialchars($error); ?>
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
                        value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>"
                    >
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-control" 
                        required
                        autocomplete="current-password"
                    >
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    Sign In
                </button>
            </form>
            
            <div class="auth-footer">
                <p>Don't have an account? <a href="register.php">Create an account</a></p>
            </div>
        </div>
    </div>
    
    <!-- tsParticles Library -->
    <script src="assets/js/tsparticles.min.js"></script>
    <!-- Particle Configuration -->
    <script src="assets/js/particles-config.js"></script>
</body>
</html>
