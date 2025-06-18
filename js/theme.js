// Enhanced theme management with error handling and performance improvements
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const THEME_KEY = 'user-theme';

    // Cache media query for better performance
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function getSystemTheme() {
        return darkModeMediaQuery.matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        // Validate theme value
        if (theme !== 'dark' && theme !== 'light') {
            console.warn(`Invalid theme: ${theme}. Falling back to system theme.`);
            theme = getSystemTheme();
        }

        const root = document.documentElement;
        const isDark = theme === 'dark';

        // Use a single attribute update to avoid layout thrashing
        root.setAttribute('data-theme', theme);

        // Update toggle button accessibility
        if (themeToggle) {
            themeToggle.setAttribute('aria-label',
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
            );
            // Optional: Update button text/icon if needed
            themeToggle.setAttribute('aria-pressed', isDark.toString());
        }
    }

    function setSavedTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    }

    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme');
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        applyTheme(newTheme);
        setSavedTheme(newTheme);

        // Dispatch custom event for other components to react
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: newTheme, previousTheme: currentTheme }
        }));
    }

    // Set up event listeners
    function setupEventListeners() {
        if (themeToggle) {
            // Use passive listeners where possible
            themeToggle.addEventListener('click', toggleTheme);
            themeToggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            });
        }

        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === THEME_KEY && e.newValue) {
                applyTheme(e.newValue);
            }
        });
    }

    setupEventListeners();

    // Expose theme API for external use
    window.themeManager = {
        getCurrentTheme,
        setTheme: applyTheme,
        toggleTheme,
        getSystemTheme
    };
})();
