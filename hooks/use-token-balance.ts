import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as splToken from "@solana/spl-token";

// Constants for minimum token requirements
export const MIN_TOKENS_TO_VOTE = 5;
export const MIN_TOKENS_TO_SUBMIT = 10;
export const MIN_TOKENS_TO_CREATE = 25;

// LORE token mint address (replace with your actual token mint address)
// This is used to fetch the SPL token balance
const LORE_TOKEN_MINT = new PublicKey(
  "ENfpbQUM5xAnNP8ecyEQGFJ6KwbuPjMwv7ZjR29cDuAb"
); // Example address

export function useTokenBalance() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has enough tokens for specific actions
  const canVote = balance >= MIN_TOKENS_TO_VOTE;
  const canSubmit = balance >= MIN_TOKENS_TO_SUBMIT;
  const canCreate = balance >= MIN_TOKENS_TO_CREATE;

  const fetchBalance = async () => {
    if (!publicKey || !connection) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch SOL balance
      const solanaBalance = await connection.getBalance(publicKey);
      setSolBalance(solanaBalance / LAMPORTS_PER_SOL);

      try {
        // Find all token accounts owned by the user
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        // Log available token accounts for debugging
        console.log(`Found ${tokenAccounts.value.length} token accounts`);

        // Find the specific token account for LORE token
        const loreAccount = tokenAccounts.value.find((account) => {
          const parsedInfo = account.account.data.parsed.info;
          const mintAddress = parsedInfo.mint;
          const isMatch = mintAddress === LORE_TOKEN_MINT.toString();

          if (isMatch) {
            console.log("Found LORE token account:", parsedInfo);
          }

          return isMatch;
        });

        if (loreAccount) {
          // Get the token balance from the account
          const parsedInfo = loreAccount.account.data.parsed.info;
          const tokenBalance =
            Number(parsedInfo.tokenAmount.amount) /
            Math.pow(10, parsedInfo.tokenAmount.decimals);
          setBalance(tokenBalance);
          console.log(`LORE token balance: ${tokenBalance}`);
        } else {
          // If no token account exists for this token, balance is 0
          console.log("No LORE token account found, setting balance to 0");
          setBalance(0);
        }
      } catch (tokenError) {
        console.error("Error fetching token balance:", tokenError);

        // FALLBACK FOR DEVELOPMENT: Use a deterministic mock balance
        // Remove this in production and just set balance to 0
        const addressStr = publicKey.toString();
        const addressNum = parseInt(addressStr.slice(-6), 16);
        const mockBalance = 5 + (addressNum % 50); // Balance between 5 and 54

        console.log(`Using mock LORE token balance: ${mockBalance}`);
        setBalance(mockBalance);
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Failed to fetch balance");
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  // Refresh balance periodically and on wallet changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();

      // Refresh every 30 seconds
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    } else {
      setBalance(0);
      setSolBalance(0);
    }
  }, [connected, publicKey, connection]);

  // Function to check if the user has a specific SPL token
  const hasToken = async (tokenMint: string): Promise<boolean> => {
    if (!publicKey || !connection) return false;

    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      return tokenAccounts.value.some((account) => {
        const parsedInfo = account.account.data.parsed.info;
        return (
          parsedInfo.mint === tokenMint &&
          Number(parsedInfo.tokenAmount.amount) > 0
        );
      });
    } catch (error) {
      console.error("Error checking token ownership:", error);
      return false;
    }
  };

  return {
    balance,
    solBalance,
    loading,
    error,
    refresh: fetchBalance,
    hasToken,
    canVote,
    canSubmit,
    canCreate,
    MIN_TOKENS_TO_VOTE,
    MIN_TOKENS_TO_SUBMIT,
    MIN_TOKENS_TO_CREATE,
  };
}
