import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
    currentTheme: Theme;
    resolvedTheme: 'light' | 'dark';
}

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'system';

    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) return storedTheme;

    return 'system';
};

const getResolvedTheme = (theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') {
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    return theme;
};

const initialState: ThemeState = {
    currentTheme: getInitialTheme(),
    resolvedTheme: getResolvedTheme(getInitialTheme()),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<Theme>) => {
            state.currentTheme = action.payload;
            state.resolvedTheme = getResolvedTheme(action.payload);

            // Update localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', action.payload);
            }
        },
        toggleTheme: (state) => {
            // If current theme is system, toggle based on resolved theme
            // Otherwise, toggle between light and dark
            const newTheme = state.currentTheme === 'system' 
                ? (state.resolvedTheme === 'light' ? 'dark' : 'light')
                : (state.currentTheme === 'light' ? 'dark' : 'light');
            state.currentTheme = newTheme;
            state.resolvedTheme = newTheme;

            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', newTheme);
            }
        },
        updateResolvedTheme: (state) => {
            state.resolvedTheme = getResolvedTheme(state.currentTheme);
        },
    },
});

export const { setTheme, toggleTheme, updateResolvedTheme } = themeSlice.actions;
export default themeSlice.reducer;