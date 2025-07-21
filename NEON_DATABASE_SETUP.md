# Neon Database Setup Guide

## Quick Setup

### 1. Create Neon Account & Database
1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up/Login
3. Click "Create a project"
4. Name it: `tourism-platform`
5. Choose region closest to your Vercel deployment
6. Click "Create project"

### 2. Get Connection String
After creation, you'll see a connection string like:
```
postgresql://username:password@ep-cold-moon-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3. Configure Local Environment

1. **Add to `packages/database/.env`**:
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

2. **Add to `apps/cms/.env`** (if running CMS locally):
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 4. Set Up Database Schema
Run our setup script:
```bash
./scripts/setup-neon.sh
```

Or manually:
```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to Neon
pnpm db:push

# Run migrations (if any)
pnpm db:migrate

# Seed with initial data
pnpm --filter database db:seed
```

### 5. Add to Vercel
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add `DATABASE_URL` with your Neon connection string
4. Apply to: Production, Preview, Development

## Connection String Options

### Basic Connection
```
postgresql://user:pass@host/dbname?sslmode=require
```

### With Connection Pooling (Recommended for Serverless)
Neon provides a pooled connection endpoint:
```
postgresql://user:pass@host/dbname?sslmode=require&pgbouncer=true
```

### Prisma-specific Connection
For Prisma with connection pooling:
```env
# Direct connection for migrations
DIRECT_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Pooled connection for queries
DATABASE_URL="postgresql://user:pass@host-pooler/dbname?sslmode=require&pgbouncer=true"
```

## Neon Features to Enable

### 1. Connection Pooling
- Go to Settings → Connection Pooling
- Enable it for better serverless performance
- Use the `-pooler` endpoint in your connection string

### 2. Autoscaling
- Neon automatically scales compute
- No configuration needed

### 3. Branching (Optional)
- Create branches for development/staging
- Settings → Branches → Create branch

## Troubleshooting

### "Connection refused" Error
- Ensure you're using `sslmode=require`
- Check if IP is allowlisted (Neon allows all IPs by default)

### "Database does not exist" Error
- Make sure you're using the correct database name
- Default is usually `neondb`

### Slow Queries
- Enable connection pooling
- Check query performance in Neon dashboard
- Consider adding indexes (see our schema)

### Migration Issues
```bash
# If migrations fail, try direct connection:
pnpm db:migrate:dev
```

## Monitoring

### Neon Dashboard
- Monitor queries
- Check connection count
- View database size
- Set up alerts

### Useful Queries
```sql
-- Check database size
SELECT pg_database_size('neondb');

-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check active connections
SELECT count(*) FROM pg_stat_activity;
```

## Cost Optimization

### Free Tier Includes
- 0.5 GB storage
- 1 compute hour/day
- Unlimited databases
- Connection pooling

### Tips to Stay in Free Tier
1. Use connection pooling
2. Optimize queries with indexes
3. Clean up old data regularly
4. Use caching (Redis) for frequently accessed data

## Next Steps

After database setup:
1. ✅ Verify connection locally: `pnpm --filter database db:studio`
2. ✅ Check tables were created
3. ✅ Add DATABASE_URL to Vercel
4. ✅ Redeploy on Vercel
5. ✅ Test your site with real data

## Security Best Practices

1. **Never commit** DATABASE_URL to git
2. **Use different** databases for dev/staging/prod
3. **Enable** row-level security if needed
4. **Backup** important data regularly
5. **Monitor** for unusual activity

Need help? Check [Neon Docs](https://neon.tech/docs) or their Discord community.