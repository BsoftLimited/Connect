import { createContext, useContext, type ParentComponent, onMount } from "solid-js";

interface ThemeContextType {
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>();

const ThemeProvider: ParentComponent = (props) => {
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
        const htmlElement = document.getElementsByTagName("body")[0];
        
        if(htmlElement){
            if (savedTheme) {
                htmlElement.classList.add(savedTheme);
            } else {
                const defaultTheme = prefersDark ? 'dark' : 'light';
                htmlElement.classList.add(defaultTheme);
                localStorage.setItem('theme', defaultTheme);
            }
        }
    }

    onMount(()=> initializeTheme());
    
    const counter: ThemeContextType = {
        toggle: () => {
            const htmlElement = document.getElementsByTagName("body")[0];
    
            if(htmlElement){
                const isDark = htmlElement.classList.contains('dark');
            
                if (isDark) {
                    htmlElement.classList.replace('dark', 'light');
                    localStorage.setItem('theme', 'light');
                } else {
                    htmlElement.classList.replace('light', 'dark');
                    localStorage.setItem('theme', 'dark');
                }
            }
        }
    };
    
    return (
        <ThemeContext.Provider value={counter}>
            {props.children}
        </ThemeContext.Provider>
    );
};

// 4. Create custom hook for consuming context
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export { ThemeProvider, useTheme };