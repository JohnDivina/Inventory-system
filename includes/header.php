<!DOCTYPE html>
<html lang="tl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? 'TC Eatery Management System'; ?></title>
    <link rel="stylesheet" href="/Cinventory/assets/css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
    <!-- Mobile Header with Hamburger Menu -->
    <div class="mobile-header">
        <button id="hamburger-btn" class="hamburger-btn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <div class="mobile-header-title">🍲 TC Eatery</div>
    </div>
    
    <!-- Sidebar Overlay for Mobile -->
    <div id="sidebar-overlay" class="sidebar-overlay"></div>
    
    <div class="main-layout">

