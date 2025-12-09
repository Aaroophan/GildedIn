'use client';

import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { setTheme, toggleTheme } from '@/models/store/themeSlice';
import { Button } from '@/components/ui/Button';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
    const dispatch = useAppDispatch();
    const { currentTheme, resolvedTheme } = useAppSelector((state) => state.theme);

    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    return (
        <div className="flex items-center gap-2 p-1 bg-mono-2/10 dark:bg-mono-6/10 rounded-lg">
            {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                    <Button
                        key={theme.value}
                        type="button"
                        classname={`px-3 py-2 rounded-md transition-all ${currentTheme === theme.value
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-foreground hover:bg-mono-3/20 dark:hover:bg-mono-5/20'
                            }`}
                        onclick={() => dispatch(setTheme(theme.value as 'light' | 'dark' | 'system'))}
                        tooltip={`Switch to ${theme.label} theme`}
                    >
                        <Icon size={18} />
                        <span className="sr-only">{theme.label}</span>
                    </Button>
                );
            })}

            <Button
                type="button"
                classname="px-3 py-2 rounded-md text-foreground hover:bg-mono-3/20 dark:hover:bg-mono-5/20"
                onclick={() => dispatch(toggleTheme())}
                tooltip={`Quick toggle to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
            >
                {resolvedTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
    );
}