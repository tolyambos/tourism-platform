# Database Setup Instructions

The tourism platform uses PostgreSQL as its database. You have several options for setting up the database:

## Option 1: Local PostgreSQL

If you have PostgreSQL installed locally, update the credentials in the `.env` files:

1. Update `/packages/database/.env` and `/apps/cms/.env` with your local PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/tourism_platform?schema=public"
   ```

2. Create the database:
   ```bash
   createdb tourism_platform
   ```

3. Push the schema:
   ```bash
   pnpm db:push
   ```

## Option 2: Use a Free Cloud PostgreSQL Service (Recommended)

### Using Neon (Recommended - Free tier available)
1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Update the `DATABASE_URL` in both `.env` files with the Neon connection string

### Using Supabase
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use the "Transaction" mode URL)
5. Update the `DATABASE_URL` in both `.env` files

### Using Railway
1. Go to https://railway.app and create an account
2. Create a new PostgreSQL service
3. Copy the connection string from the service settings
4. Update the `DATABASE_URL` in both `.env` files

## Option 3: Use Docker

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tourism_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
```

## After Database Setup

Once you have a working database connection:

1. Generate Prisma Client:
   ```bash
   pnpm db:generate
   ```

2. Push the schema to create tables:
   ```bash
   pnpm db:push
   ```

3. (Optional) Run migrations instead of push for production:
   ```bash
   pnpm db:migrate
   ```

4. (Optional) Open Prisma Studio to view your data:
   ```bash
   pnpm db:studio
   ```

## Environment Variables

Make sure these files have the same `DATABASE_URL`:
- `/packages/database/.env`
- `/apps/cms/.env`

The API keys are already configured in `/apps/cms/.env`:
- `GEMINI_API_KEY` - For AI content generation
- `REPLICATE_API_TOKEN` - For image generation
- `NETLIFY_AUTH_TOKEN` - For deployment