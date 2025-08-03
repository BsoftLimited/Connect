// Check for saved theme preference or use preferred color scheme
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const htmlElement = document.getElementsByTagName("body")[0];
    
    if (savedTheme) {
        htmlElement.classList.add(savedTheme);
    } else {
        const defaultTheme = prefersDark ? 'dark' : 'light';
        htmlElement.classList.add(defaultTheme);
        localStorage.setItem('theme', defaultTheme);
    }
}

const toggleTheme = () => {
    const htmlElement = document.getElementsByTagName("body")[0];
    const isDark = htmlElement.classList.contains('dark');
    
    if (isDark) {
        htmlElement.classList.replace('dark', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        htmlElement.classList.replace('light', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme when page loads
initializeTheme();

// Add event listener to a theme toggle button
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);