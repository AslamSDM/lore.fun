# LoreFunDapp - Prisma Migration

This project has been migrated from Supabase to Prisma for database operations. Below are the key changes made:

## Database Connection

- Created a singleton Prisma client in `lib/prisma.ts` that follows Next.js best practices
- Created data service classes in `lib/data-service.ts` that handle all database operations
- Created an API middleware in `lib/middleware.ts` to provide Prisma context to API routes

## API Changes

All API routes have been updated to use Prisma instead of Supabase:

- Changed imports from Supabase client to Prisma client
- Updated database queries to use Prisma's fluent API
- Maintained the same API response structure for backwards compatibility
- Formatted database responses to match the expected structure in the frontend

## Authentication

User authentication is now handled through the `UserService` class for:

- User creation
- Username updates
- User lookup by wallet address

## Data Migration

The original data model from Supabase was preserved in Prisma schema, ensuring compatibility with existing data.

## Running the Project

1. Make sure the database URL is correctly set in `.env` file
2. Run migrations if needed: `npx prisma migrate dev`
3. Seed the database: `npx prisma db seed`
4. Start the development server: `npm run dev`

## Troubleshooting

If you encounter any issues:

1. Check that the Database URL is correct in `.env`
2. Run `npx prisma generate` to update the Prisma client
3. Restart the development server
