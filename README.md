# LORE.FUN

## Collaborative Storytelling onchain
 
## Features

### Secure Solana Wallet Authentication
 
LoreFun uses a secure, signature-based authentication system with Solana wallets. This approach provides several benefits:

- No passwords to remember or store
- Cryptographic verification of wallet ownership
- Private keys remain in the user's wallet, never shared with our server
- Seamless integration with Solana ecosystem

For detailed information on the authentication implementation, see [SOLANA_AUTH.md](./SOLANA_AUTH.md).

### Automated Round Endings
 
LoreFun features an automated round ending system that:

- Automatically detects when a voting round has ended based on time
- Selects the winning submission with the most votes
- Adds the winning submission as the next sentence in the story
- Starts a new submission period for the next sentence

For detailed information about this feature, see [AUTOMATED_ROUNDS.md](./AUTOMATED_ROUNDS.md).

### Prisma Database Integration

LoreFun uses Prisma as its ORM for database operations. The migration from Supabase to Prisma is documented in [PRISMA_MIGRATION.md](./PRISMA_MIGRATION.md) and [PRISMA_STATUS.md](./PRISMA_STATUS.md).

## Development
