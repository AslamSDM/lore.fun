# Solana Wallet Signature Authentication

This document outlines the implementation of a secure Solana wallet signature-based authentication system in the LoreFun application.

## Overview

The application uses cryptographic signatures to verify wallet ownership, providing a secure authentication mechanism without requiring passwords or sharing private keys.

## Key Components

### Authentication Flow

1. **User connects wallet**: The user connects their Solana wallet to the application
2. **Message signature**: The application generates a unique message for the user to sign with their wallet
3. **Signature verification**: The server verifies the signature to prove wallet ownership
4. **User lookup/creation**: The server finds or creates a user associated with the verified wallet address
5. **Authentication completion**: The server returns the authenticated user details

### Security Benefits

- **No password storage**: The system doesn't store passwords, eliminating password-related vulnerabilities
- **Cryptographic verification**: Uses public-key cryptography for secure authentication
- **No server-side secrets**: Private keys never leave the user's wallet
- **Non-reusable signatures**: Each authentication request requires a new signature

## Implementation Details

### Core Authentication Files

- `lib/auth.ts`: Core signature generation and verification utilities
- `lib/auth-service.ts`: Service-layer logic for user authentication
- `lib/auth-store.ts`: State management for authentication UI
- `pages/api/auth/signin.ts`: API endpoint for signature verification
- `components/sign-message-modal.tsx`: UI component for the signature process
- `lib/middleware.ts`: Authentication middleware for protected routes

### Signature Verification

The system uses Tweetnacl for cryptographic operations:

```typescript
// Verify a signature against a wallet address and message
export async function verifySignature(
  walletAddress: string, 
  message: string, 
  signature: string
): Promise<boolean> {
  const publicKey = new PublicKey(walletAddress);
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = Buffer.from(signature, 'base64');
  
  return sign.detached.verify(
    messageBytes,
    signatureBytes,
    publicKey.toBytes()
  );
}
```

### Middleware Integration

API routes can be protected using the `withAuth` middleware:

```typescript
export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  { prisma, user }
) {
  // Only authenticated users can access this endpoint
  // user object is available in the context
  // ...
});
```

## Usage

### Authenticated API Requests

For endpoints that require authentication:

```typescript
// Export with different middleware based on request method
export default async function(req: NextApiRequest, res: NextApiResponse) {
  // For POST/PUT/DELETE requests, use withAuth to require authentication
  if (["POST", "PUT", "DELETE"].includes(req.method ?? "")) {
    return withAuth(handler)(req, res);
  }
  
  // For GET requests, just use withPrisma
  return withPrisma(handler)(req, res);
}
```

### User Context

After authentication, the user is available in the API context:

```typescript
// In protected API routes:
const handler = async function(
  req: NextApiRequest,
  res: NextApiResponse,
  { prisma, user }
) {
  // user object is available here
  console.log(`Request from user: ${user.id}`);
  
  // ...rest of handler
}
```

## Future Improvements

- Add session management with JWT or similar mechanism
- Implement refresh tokens to reduce frequency of signing requests
- Add time-based expiration to signatures
- Integrate with role-based access control
