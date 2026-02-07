<?php
/**
 * Logout
 * Destroys session and redirects to login page
 */

require_once __DIR__ . '/includes/auth.php';

// Destroy session and redirect
logout();
?>
