"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { generateSignMessage } from "../lib/auth";
import type { User } from "../lib/types";
import UsernameModal from "./username-modal";
import SignMessageModal from "./sign-message-modal";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuthStore } from "../lib/auth-store";
import { AuthAPI, UsersAPI } from "../lib/api-client";

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: number;
  updateBalance: (newBalance: number) => void;
  user: User | null;
  loading: boolean;
  setUsername: (
    username: string
  ) => Promise<{ success: boolean; error: string | null }>;
  refreshUser: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  publicKey: null,
  connect: async () => {},
  disconnect: () => {},
  balance: 0,
  updateBalance: () => {},
  user: null,
  loading: true,
  setUsername: async () => ({ success: false, error: null }),
  refreshUser: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const solanaWallet = useSolanaWallet();
  const { setVisible } = useWalletModal();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showSignMessageModal, setShowSignMessageModal] = useState(false);
  const [balance, setBalance] = useState(0);

  const {
    isAuthenticating,
    setIsAuthenticating,
    authError,
    setAuthError,
    resetAuthState,
  } = useAuthStore(); // Handle wallet connection
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (solanaWallet.connected && solanaWallet.publicKey) {
        try {
          setLoading(true);
          resetAuthState();

          if (!solanaWallet.signMessage) {
            throw new Error("Wallet doesn't support message signing");
          }

          const walletAddress = solanaWallet.publicKey.toString();

          // Show the sign message modal
          setShowSignMessageModal(true);

          // Create a message for the user to sign
          const message = generateSignMessage(walletAddress);

          // Begin authentication process
          setIsAuthenticating(true);

          // Ask the user to sign the message
          const encodedMessage = new TextEncoder().encode(message);
          const signature = await solanaWallet.signMessage(encodedMessage);

          // Hide the modal once signature is completed
          setShowSignMessageModal(false);

          // Convert the signature to a string
          const signatureString = Buffer.from(signature).toString("base64");

          // Authenticate with the server using our API client
          const {
            authenticated,
            user: dbUser,
            isNewUser,
          } = await AuthAPI.signin(walletAddress, signatureString);

          if (!authenticated) {
            throw new Error("Authentication failed");
          }
          setUser(dbUser);

          // Reset auth state
          resetAuthState();

          // If new user or no username, show username modal
          if (!dbUser.username) {
            setShowUsernameModal(true);
          }

          // Mock balance for now
          setBalance(250);
        } catch (error) {
          console.error("Error handling wallet connection:", error);
          setAuthError((error as Error).message);
          setShowSignMessageModal(false);
        } finally {
          setLoading(false);
          setIsAuthenticating(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    handleWalletConnection();
  }, [
    solanaWallet.connected,
    solanaWallet.publicKey,
    solanaWallet.signMessage,
  ]);

  const connect = async () => {
    try {
      // Reset any previous auth state
      resetAuthState();
      setVisible(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setAuthError((error as Error).message);
    }
  };

  const disconnect = () => {
    if (solanaWallet.disconnect) {
      solanaWallet.disconnect();
    }
    setUser(null);
    resetAuthState();
  };

  const handleSetUsername = async (
    username: string
  ): Promise<{ success: boolean; error: string | null }> => {
    if (!user) {
      return { success: false, error: "User not found" };
    }

    try {
      // Use our API client to update the username
      await UsersAPI.updateUsername(user.id, username);

      // Update local state
      setUser((prev) => (prev ? { ...prev, username } : null));
      setShowUsernameModal(false);

      return { success: true, error: null };
    } catch (error) {
      console.error("Error updating username:", error);
      return {
        success: false,
        error: (error as Error).message || "Failed to update username",
      };
    }
  };

  // Add a method to refresh user data from the server
  const refreshUser = async (): Promise<void> => {
    if (!user) return;

    try {
      const updatedUser = await UsersAPI.getProfile(user.id);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Function to update the wallet balance
  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  return (
    <WalletContext.Provider
      value={{
        connected: solanaWallet.connected,
        connecting: solanaWallet.connecting,
        publicKey: solanaWallet.publicKey?.toString() || null,
        connect,
        disconnect,
        balance,
        user,
        loading,
        setUsername: handleSetUsername,
        refreshUser,
        updateBalance,
      }}
    >
      {children}
      {showUsernameModal && (
        <UsernameModal
          isOpen={showUsernameModal}
          onClose={() => setShowUsernameModal(false)}
        />
      )}
      {showSignMessageModal && solanaWallet.publicKey && (
        <SignMessageModal
          isOpen={showSignMessageModal}
          onClose={() => setShowSignMessageModal(false)}
          walletAddress={solanaWallet.publicKey.toString()}
        />
      )}
    </WalletContext.Provider>
  );
}
