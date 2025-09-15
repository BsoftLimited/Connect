import {createContext, useContext, type ParentComponent, onMount, createSignal} from "solid-js";

interface ThemeContextType {
    toggle: () => void;
    isDark: () => boolean;
}

type Theme = 'dark' | 'light';
const initTheme = (): Theme =>{
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme){
        return savedTheme as Theme;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme: Theme = prefersDark ? 'dark' : 'light';
    localStorage.setItem('theme', defaultTheme);
    return defaultTheme;
}

const ThemeContext = createContext<ThemeContextType>();

const ThemeProvider: ParentComponent = (props) => {
    const [theme, setTheme] = createSignal(initTheme());
    const initializeTheme = () => {
        const htmlElement = document.getElementsByTagName("body")[0];
        if(htmlElement){
            htmlElement.classList.add(theme());
        }
    }

    onMount(()=> initializeTheme());
    
    const contextType: ThemeContextType = {
        toggle: () => {
            const htmlElement = document.getElementsByTagName("body")[0];
            if(htmlElement){
                if (theme() === "dark") {
                    htmlElement.classList.replace('dark', 'light');
                    localStorage.setItem('theme', 'light');
                    setTheme("light");
                } else {
                    htmlElement.classList.replace('light', 'dark');
                    localStorage.setItem('theme', 'dark');
                    setTheme("dark");
                }
            }
        },
        isDark: () => theme() === "dark"
    };
    
    return (
        <ThemeContext.Provider value={contextType}>
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