import ApiClient from '@/lib/apiCalling';
import { getSession } from 'next-auth/react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface iUser {
    id: string;
    email: string;
    name: string;
    role: string

}

interface UserState {
    user: iUser | null;
    authToken: string | null;
    isUserVerified: boolean;
    isEmailVerified: boolean;
    isUserLoggedIn: boolean;
    isLoginDilogOpen: boolean;
}

type UserActions = {
    setUser: (user: iUser, token: string) => void;
    clearUser: () => void;
    setIsUserVerified: (isUserVerified: boolean) => void;
    setIsEmailVerified: (isEmailVerified: boolean) => void;
    setIsLoginDilogOpen: (isLoginDilogOpen: boolean) => void;
    authStatus: () => void;
};

const initialState: UserState = {
    user: null,
    authToken: null,
    isUserVerified: false,
    isEmailVerified: false,
    isUserLoggedIn: false,
    isLoginDilogOpen: false,
};

export const useUserStore = create<UserState & UserActions>()(
    persist(
        (set) => ({
            ...initialState,
            setUser: (user, token) =>
                set(() => ({
                    user,
                    authToken: token,
                    isUserLoggedIn: true,
                })),
            clearUser: () => set(() => initialState),
            setIsUserVerified: (isUserVerified) => set(() => ({ isUserVerified })),
            setIsEmailVerified: (isEmailVerified) => set(() => ({ isEmailVerified })),
            setIsLoginDilogOpen: (isLoginDilogOpen) => set(() => ({ isLoginDilogOpen })),
            authStatus: () => set(() => ({ isUserLoggedIn: true })),
        }),
        {
            name: "user-store",
            // skipHydration: true,
        }
    )
);
