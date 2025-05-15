import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { sign } from "tweetnacl";
import { prisma } from "./prisma";

// Generate a message for a user to sign with their wallet
export function generateSignMessage(walletAddress: string): string {
  return `Sign this message to verify your wallet ownership for LoreFun: ${walletAddress}`;
}

// Verify a signature against a wallet address and message
export async function verifySignature(
  walletAddress: string, 
  message: string, 
  signature: string
): Promise<boolean> {
  try {
    const publicKey = new PublicKey(walletAddress);
    const messageBytes = new TextEncoder().encode(message);
    
    // Handle both base64 and bs58 encoded signatures
    let signatureBytes;
    try {
      // Try base64 first
      signatureBytes = Buffer.from(signature, 'base64');
    } catch (e) {
      // If that fails, try bs58
      signatureBytes = bs58.decode(signature);
    }
    
    // Verify the signature
    return sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Authenticate a user based on their wallet signature
export async function authenticateUser(
  walletAddress: string,
  signature: string
): Promise<{
  authenticated: boolean;
  user: any | null;
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
        error: "Invalid signature",
      };
    }
    
    // Get or create the user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });
    
    // If no user exists, create one
    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress },
      });
    }
    
    return {
      authenticated: true,
      user,
      error: null,
    };
  } catch (error) {
    return {
      authenticated: false,
      user: null,
      error: (error as Error).message,
    };
  }
}
