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
import { useConnection } from "@solana/wallet-adapter-react";
import { toast } from "@/components/ui/use-toast";
import {
  useTokenBalance,
  MIN_TOKENS_TO_VOTE,
  MIN_TOKENS_TO_SUBMIT,
  MIN_TOKENS_TO_CREATE,
} from "@/hooks/use-token-balance";

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: number;
  solBalance: number;
  updateBalance: (newBalance: number) => void;
  user: User | null;
  loading: boolean;
  setUsername: (
    username: string
  ) => Promise<{ success: boolean; error: string | null }>;
  refreshUser: () => Promise<void>;
  checkTokenRequirement: (action: "vote" | "submit" | "create") => boolean;
}

export const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  publicKey: null,
  connect: async () => {},
  disconnect: () => {},
  balance: 0,
  solBalance: 0,
  updateBalance: () => {},
  user: null,
  loading: true,
  setUsername: async () => ({ success: false, error: null }),
  refreshUser: async () => {},
  checkTokenRequirement: () => false,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const solanaWallet = useSolanaWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showSignMessageModal, setShowSignMessageModal] = useState(false);

  // Use our token balance hook instead of managing the state here
  const {
    balance: tokenBalance,
    solBalance: solanaTokenBalance,
    refresh: refreshBalance,
  } = useTokenBalance();

  // Keep the original state variables for compatibility with existing code
  const [balance, setBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);

  // Update the local state variables when the hook values change
  useEffect(() => {
    if (solanaWallet.connected) {
      setBalance(tokenBalance);
      setSolBalance(solanaTokenBalance);

      // Show balance notification when connected and balance changes
      if (tokenBalance > 0) {
        toast({
          title: "Balance Updated",
          description: `Your wallet contains ${tokenBalance} LORE tokens`,
          duration: 3000,
        });
      }
    }
  }, [tokenBalance, solanaTokenBalance, solanaWallet.connected]);

  const {
    isAuthenticating,
    setIsAuthenticating,
    authError,
    setAuthError,
    resetAuthState,
  } = useAuthStore();

  // Handle wallet connection
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
          let signature;

          try {
            const encodedMessage = new TextEncoder().encode(message);
            signature = await solanaWallet.signMessage(encodedMessage);
          } catch (signError) {
            // Specific handling for user rejection
            setShowSignMessageModal(false);
            setAuthError("User rejected signature");
            return;
          }

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
    setBalance(0);
    setSolBalance(0);
    resetAuthState();

    // Show disconnect notification
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
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

  // Function to update the wallet balance manually
  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);

    // Also refresh the token balance from the hook
    refreshBalance();
  };

  // Check token requirements for different actions
  const checkTokenRequirement = (
    action: "vote" | "submit" | "create"
  ): boolean => {
    // First check if the user is connected
    if (!solanaWallet.connected || !solanaWallet.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return false;
    }

    switch (action) {
      case "vote":
        if (balance < MIN_TOKENS_TO_VOTE) {
          toast({
            title: "Insufficient Tokens",
            description: `You need at least ${MIN_TOKENS_TO_VOTE} LORE tokens to vote on submissions.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      case "submit":
        if (balance < MIN_TOKENS_TO_SUBMIT) {
          toast({
            title: "Insufficient Tokens",
            description: `You need at least ${MIN_TOKENS_TO_SUBMIT} LORE tokens to submit a new sentence.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      case "create":
        if (balance < MIN_TOKENS_TO_CREATE) {
          toast({
            title: "Insufficient Tokens",
            description: `You need at least ${MIN_TOKENS_TO_CREATE} LORE tokens to create a new story.`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return false;
    }
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
        solBalance,
        user,
        loading,
        setUsername: handleSetUsername,
        refreshUser,
        updateBalance,
        checkTokenRequirement,
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
