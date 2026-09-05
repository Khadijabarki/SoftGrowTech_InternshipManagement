/**
 * Internship Management System - Theme Controller
 * Manages persistent Light/Dark mode toggling.
 */

(function () {
    const THEME_KEY = 'ims_theme';
    
    // Get stored theme or default to light/dark based on system preferences
    function getPreferredTheme() {
        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        updateThemeToggleIcons(theme);
    }

    function updateThemeToggleIcons(theme) {
        const themeToggles = document.querySelectorAll('.theme-toggle-btn');
        themeToggles.forEach(btn => {
            const sunIcon = btn.querySelector('.sun-icon');
            const moonIcon = btn.querySelector('.moon-icon');
            if (sunIcon && moonIcon) {
                if (theme === 'dark') {
                    sunIcon.style.display = 'inline-block';
                    moonIcon.style.display = 'none';
                } else {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'inline-block';
                }
            }
        });
    }

    // Apply theme immediately before DOM ready to prevent flash
    const currentTheme = getPreferredTheme();
    document.documentElement.setAttribute('data-theme', currentTheme);

    document.addEventListener('DOMContentLoaded', () => {
        updateThemeToggleIcons(currentTheme);

        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const activeTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
            });
        });
    });
})();
