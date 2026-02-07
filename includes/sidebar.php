<?php
$currentUser = getCurrentUser();
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<aside class="sidebar">
    <div class="sidebar-header">
        <div class="sidebar-header-top">
            <h2>🍲 TC Eatery</h2>
            <button id="darkModeToggle" class="dark-mode-toggle" title="Toggle Dark Mode" aria-label="Toggle Dark Mode">
                <span class="icon-light">🌙</span>
                <span class="icon-dark">☀️</span>
            </button>
        </div>
        <p>Kumusta, <?php echo htmlspecialchars($currentUser['username']); ?>!</p>
    </div>

    
    <nav class="sidebar-nav">
        <a href="/Cinventory/dashboard.php" class="nav-item <?php echo $currentPage === 'dashboard.php' ? 'active' : ''; ?>">
            <span class="nav-item-icon">📊</span>
            <span>Dashboard</span>
        </a>
        
        <a href="/Cinventory/inventory.php" class="nav-item <?php echo $currentPage === 'inventory.php' ? 'active' : ''; ?>">
            <span class="nav-item-icon">📦</span>
            <span>Inventory</span>
        </a>
        
        <a href="/Cinventory/sales.php" class="nav-item <?php echo $currentPage === 'sales.php' ? 'active' : ''; ?>">
            <span class="nav-item-icon">🛒</span>
            <span>Sales Manager</span>
        </a>
        
        <?php if (isAdmin()): ?>
        <a href="/Cinventory/admin_accounts.php" class="nav-item <?php echo $currentPage === 'admin_accounts.php' ? 'active' : ''; ?>">
            <span class="nav-item-icon">👥</span>
            <span>Admin Accounts</span>
        </a>
        <?php endif; ?>
        
        <a href="/Cinventory/settings.php" class="nav-item <?php echo $currentPage === 'settings.php' ? 'active' : ''; ?>">
            <span class="nav-item-icon">⚙️</span>
            <span>Settings</span>
        </a>
    </nav>
    
    <div class="sidebar-footer">
        <a href="/Cinventory/logout.php" class="nav-item" style="color: #ef4444;">
            <span class="nav-item-icon">🚪</span>
            <span>Logout</span>
        </a>
    </div>
    
    <div class="sidebar-branding">
        <p>Created by JRDivina</p>
    </div>
</aside>
