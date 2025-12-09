"use client";

import { AuthService } from "@/models/Services/Auth";
import { useState, useEffect } from "react";

export function useAuth() {
    type CurrentUserType = NonNullable<ReturnType<typeof AuthService.prototype.getCurrentUser>> | null;

    const [state, setState] = useState<{
        isAuthenticated: boolean;
        currentUser: CurrentUserType;
        isInitialized: boolean;
    }>({
        isAuthenticated: false,
        currentUser: null,
        isInitialized: false,
    });

    useEffect(() => {
        const authService = AuthService.getInstance();

        const updateAuthState = () => {
            const currentUser = authService.getCurrentUser();
            setState({
                isAuthenticated: authService.getAuthStatus(),
                currentUser,
                isInitialized: true,
            });
        };

        updateAuthState();

        const authChangeHandler = () => {
            updateAuthState();
        };

        authService.subscribe(authChangeHandler);

        return () => {
            authService.unsubscribe(authChangeHandler);
        };
    }, []);

    return state;
}