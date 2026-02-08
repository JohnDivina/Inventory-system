/**
 * Dark Mode Toggle
 * Handles theme switching and localStorage persistence
 */

// Initialize dark mode from localStorage on page load
function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode');

    // Apply dark mode if previously enabled
    if (darkMode === 'enabled') {
        document.documentElement.classList.add('dark-mode');
    }
}

// Toggle dark mode on/off
function toggleDarkMode() {
    const html = document.documentElement;
    const isDarkMode = html.classList.toggle('dark-mode');

    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');

    // Optional: Add smooth transition effect
    html.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        html.style.transition = '';
    }, 300);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initDarkMode();

    // Attach event listener to toggle button
    const toggleButton = document.getElementById('darkModeToggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleDarkMode);
    }
});
