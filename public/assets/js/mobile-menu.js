/**
 * Mobile Menu Toggle
 * Handles hamburger menu and sidebar overlay for mobile devices
 */

(function () {
    'use strict';

    // Initialize mobile menu on DOM load
    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
    });

    function initMobileMenu() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (!hamburgerBtn || !sidebar || !overlay) {
            return; // Elements not found, exit gracefully
        }

        // Hamburger button click - toggle sidebar
        hamburgerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleSidebar();
        });

        // Overlay click - close sidebar
        overlay.addEventListener('click', function () {
            closeSidebar();
        });

        // Close sidebar when clicking nav links on mobile
        const navLinks = sidebar.querySelectorAll('.nav-item');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                // Only close on mobile
                if (window.innerWidth < 768) {
                    closeSidebar();
                }
            });
        });

        // Handle window resize - close sidebar if switching to desktop
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (window.innerWidth >= 768) {
                    closeSidebar();
                }
            }, 250);
        });
    }

    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function openSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    // Expose functions globally if needed
    window.MobileMenu = {
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar
    };
})();
