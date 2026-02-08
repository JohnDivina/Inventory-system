<?php
/**
 * User Operations API
 * Handles user management (admin only)
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/database.php';

// Require admin
if (!isAdmin()) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Admin only']);
    exit;
}

$pdo = getDBConnection();

// Handle GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'list') {
        // List all users
        try {
            $sql = "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC";
            $users = fetchAll($sql);
            
            echo json_encode(['success' => true, 'users' => $users]);
        } catch (Exception $e) {
            error_log("Error listing users: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error loading users']);
        }
    }
    elseif ($action === 'get') {
        // Get single user
        $id = $_GET['id'] ?? 0;
        
        try {
            $sql = "SELECT id, username, role, created_at FROM users WHERE id = ?";
            $user = fetchOne($sql, [$id]);
            
            if ($user) {
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                echo json_encode(['success' => false, 'message' => 'User not found']);
            }
        } catch (Exception $e) {
            error_log("Error getting user: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error loading user']);
        }
    }
    exit;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'create') {
        // Create new user
        try {
            // Check if username already exists
            $checkSql = "SELECT COUNT(*) as count FROM users WHERE username = ?";
            $result = fetchOne($checkSql, [$input['username']]);
            
            if ($result['count'] > 0) {
                echo json_encode(['success' => false, 'message' => 'Username already exists']);
                exit;
            }
            
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            
            $sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
            executeQuery($sql, [$input['username'], $hashedPassword, $input['role']]);
            
            echo json_encode(['success' => true, 'user_id' => getLastInsertId()]);
        } catch (Exception $e) {
            error_log("Error creating user: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error creating user']);
        }
    }
    elseif ($action === 'update') {
        // Update user
        try {
            // Check if username already exists (excluding current user)
            $checkSql = "SELECT COUNT(*) as count FROM users WHERE username = ? AND id != ?";
            $result = fetchOne($checkSql, [$input['username'], $input['user_id']]);
            
            if ($result['count'] > 0) {
                echo json_encode(['success' => false, 'message' => 'Username already exists']);
                exit;
            }
            
            $sql = "UPDATE users SET username = ?, role = ? WHERE id = ?";
            executeQuery($sql, [$input['username'], $input['role'], $input['user_id']]);
            
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Error updating user: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error updating user']);
        }
    }
    elseif ($action === 'delete') {
        // Delete user
        try {
            $currentUserId = $_SESSION['user_id'];
            
            // Prevent deleting own account
            if ($input['user_id'] == $currentUserId) {
                echo json_encode(['success' => false, 'message' => 'Hindi pwedeng tanggalin ang sariling account']);
                exit;
            }
            
            $sql = "DELETE FROM users WHERE id = ?";
            executeQuery($sql, [$input['user_id']]);
            
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Error deleting user: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error deleting user']);
        }
    }
    elseif ($action === 'reset_password') {
        // Reset user password
        try {
            $hashedPassword = password_hash($input['new_password'], PASSWORD_DEFAULT);
            
            $sql = "UPDATE users SET password = ? WHERE id = ?";
            executeQuery($sql, [$hashedPassword, $input['user_id']]);
            
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Error resetting password: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error resetting password']);
        }
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
?>
