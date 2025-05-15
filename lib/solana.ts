import { PublicKey } from "@solana/web3.js";
import { UserService } from "./data-service";
import type { User } from "./types";

export async function getOrCreateUser(
  walletAddress: string
): Promise<{ user: User | null; isNew: boolean; error: string | null }> {
  try {
    const result = await UserService.getOrCreateUser(walletAddress);

    if (result.error) {
      return { user: null, isNew: false, error: result.error };
    }

    if (!result.user) {
      return {
        user: null,
        isNew: false,
        error: "Failed to get or create user",
      };
    }

    // Convert Prisma User to app User type
    const user: User = {
      id: result.user.id,
      wallet_address: result.user.walletAddress,
      username: result.user.username || null,
      created_at: result.user.createdAt.toISOString(),
      updated_at: result.user.updatedAt.toISOString(),
    };

    return { user, isNew: result.isNew, error: null };
  } catch (error) {
    return { user: null, isNew: false, error: (error as Error).message };
  }
}

export async function updateUsername(
  userId: string,
  username: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const result = await UserService.updateUsername(userId, username);
    return result;
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}
