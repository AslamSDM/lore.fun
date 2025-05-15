import { generateSignMessage, verifySignature } from "./auth";
import { UserService } from "./data-service";
import type { User } from "./types";

/**
 * Auth service to handle user authentication with Solana wallet signatures
 */
export class AuthService {
  /**
   * Authenticate a user with their wallet signature
   */
  static async authenticateWithSignature(
    walletAddress: string,
    signature: string
  ): Promise<{
    authenticated: boolean;
    user: User | null;
    isNewUser: boolean;
    error: string | null;
  }> {
    try {
      // Generate the message that should have been signed
      const message = generateSignMessage(walletAddress);
      
      // Verify the signature
      const isValid = await verifySignature(walletAddress, message, signature);
      
      if (!isValid) {
        return {
          authenticated: false,
          user: null,
          isNewUser: false,
          error: "Invalid signature",
        };
      }
      
      // Get or create the user using the UserService
      const { user, isNew, error } = await UserService.getOrCreateUser(walletAddress);
      
      if (error || !user) {
        return {
          authenticated: false,
          user: null,
          isNewUser: false,
          error: error || "Failed to get or create user",
        };
      }
      
      // Format user to match application expectations
      const formattedUser: User = {
        id: user.id,
        wallet_address: user.walletAddress,
        username: user.username || null,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      };
      
      return {
        authenticated: true,
        user: formattedUser,
        isNewUser: isNew,
        error: null,
      };
    } catch (error) {
      return {
        authenticated: false,
        user: null,
        isNewUser: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Validate a session (can be extended for more complex session management)
   */
  static async validateSession(userId: string, walletAddress: string): Promise<boolean> {
    try {
      const user = await UserService.getUserByWalletAddress(walletAddress);
      return !!user && user.id === userId;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Validate if a wallet is authenticated
   */
  static async isWalletAuthenticated(walletAddress: string): Promise<boolean> {
    try {
      const user = await UserService.getUserByWalletAddress(walletAddress);
      return !!user;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get a user by wallet address if they exist
   */
  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const user = await UserService.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return null;
      }
      
      // Format user to match application expectations
      return {
        id: user.id,
        wallet_address: user.walletAddress,
        username: user.username || null,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      };
    } catch (error) {
      return null;
    }
  }
}
