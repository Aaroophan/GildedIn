'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/hooks';
import { updateResolvedTheme } from '@/models/store/themeSlice';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { currentTheme, resolvedTheme } = useAppSelector((state) => state.theme);

    // Apply theme to DOM
    useEffect(() => {
        const root = document.documentElement;

        if (resolvedTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Update CSS variables based on theme
        if (resolvedTheme === 'dark') {
            root.style.setProperty('--background', '#000e23');
            root.style.setProperty('--foreground', '#cfe3ff');
        } else {
            root.style.setProperty('--background', '#e7f1ff');
            root.style.setProperty('--foreground', '#000e23');
        }
    }, [resolvedTheme]);

    // Listen to system theme changes when theme is set to 'system'
    useEffect(() => {
        if (currentTheme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = () => {
            dispatch(updateResolvedTheme());
        };

        // Update immediately if needed
        handleChange();

        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [currentTheme, dispatch]);

    return <>{children}</>;
}