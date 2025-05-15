import { create } from "zustand";

interface AuthStore {
  isAuthenticating: boolean;
  authError: string | null;
  isSigningMessage: boolean;
  
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  setAuthError: (error: string | null) => void;
  setIsSigningMessage: (isSigning: boolean) => void;
  
  // Method to reset the auth state
  resetAuthState: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticating: false,
  authError: null,
  isSigningMessage: false,
  
  setIsAuthenticating: (isAuthenticating: boolean) => set({ isAuthenticating }),
  setAuthError: (error: string | null) => set({ authError: error }),
  setIsSigningMessage: (isSigningMessage: boolean) => set({ isSigningMessage }),
  
  // Reset the authentication state
  resetAuthState: () => set({ 
    isAuthenticating: false,
    authError: null,
    isSigningMessage: false,
  }),
}));
