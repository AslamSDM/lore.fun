"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { supabase } from "../lib/supabase";
import type { User } from "../lib/types";
import { useRouter } from "next/router";

interface WalletContextType {
  user: User | null;
  loading: boolean;
  checkUsername: () => Promise<boolean>;
  setUsername: (
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  getUserStats: () => Promise<divny>;
}

export const WalletContext = createContext<WalletContextType>({
  user: null,
  loading: true,
  checkUsername: async () => false,
  setUsername: async () => ({ success: false }),
  getUserStats: async () => ({}),
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useSolanaWallet();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user exists when wallet is connected
  useEffect(() => {
    const checkUser = async () => {
      if (!publicKey) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const walletAddress = publicKey.toString();

      // Check if user exists in database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user:", error);
      }

      if (data) {
        setUser(data);
      } else {
        // Create new user if not exists
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([{ wallet_address: walletAddress }])
          .select()
          .single();

        if (createError) {
          console.error("Error creating user:", createError);
        } else if (newUser) {
          setUser(newUser);
        }
      }

      setLoading(false);
    };

    if (connected && publicKey) {
      checkUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [publicKey, connected]);

  // Check if username is set
  const checkUsername = async (): Promise<boolean> => {
    if (!user) return false;
    return !!user.username;
  };

  // Set username for new user
  const setUsername = async (
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not connected" };

    const { data, error } = await supabase
      .from("users")
      .update({ username })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Username already taken" };
      }
      return { success: false, error: error.message };
    }

    if (data) {
      setUser(data);
      return { success: true };
    }

    return { success: false, error: "Unknown error" };
  };

  // Get user stats
  const getUserStats = async () => {
    if (!user) return null;

    const { data: submissionsCount } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("submitted_by", user.id);

    const { data: winningSubmissions } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("submitted_by", user.id)
      .eq("is_winner", true);

    const { data: votesCast } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: storiesCreated } = await supabase
      .from("stories")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id);

    return {
      submissions_count: submissionsCount?.count || 0,
      winning_submissions_count: winningSubmissions?.count || 0,
      votes_cast_count: votesCast?.count || 0,
      stories_created_count: storiesCreated?.count || 0,
    };
  };

  return (
    <WalletContext.Provider
      value={{
        user,
        loading,
        checkUsername,
        setUsername,
        getUserStats,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export { WalletMultiButton };
