# Security Guide - IMPORTANT

## Never Commit Secrets

### ❌ NEVER commit these to Git:
- Database URLs with passwords
- API keys (Gemini, Replicate, Vercel)
- JWT secrets
- Any credentials

### ✅ ALWAYS use:
- Environment variables
- `.env` files (which are gitignored)
- Platform secret managers (Vercel, Railway)

## If Credentials Are Exposed

1. **Immediately reset** the exposed credential
2. **Update** all services using it
3. **Audit** logs for unauthorized access
4. **Remove** from git history if needed

## Secure Practices

### 1. Use Placeholder Values in Documentation
```bash
# ❌ BAD
DATABASE_URL=postgresql://user:actualpassword@host/db

# ✅ GOOD
DATABASE_URL=postgresql://user:your-password-here@host/db
```

### 2. Use Environment Variables in Scripts
```bash
# ❌ BAD
export DATABASE_URL="postgresql://user:password@host/db"

# ✅ GOOD
if [ -z "$DATABASE_URL" ]; then
    echo "Please set DATABASE_URL environment variable"
    exit 1
fi
```

### 3. Check Before Committing
```bash
# Check for exposed secrets
git diff --staged | grep -E "(password|secret|key|token)" 
```

### 4. Use Git Hooks
Add pre-commit hooks to prevent accidental commits of secrets.

## Environment Files Structure

```
.env                    # Local development (gitignored)
.env.example            # Template with placeholders (committed)
.env.production         # Production values (NEVER commit)
```

## Rotating Credentials

When you need to rotate credentials:

1. Generate new credential
2. Update in all environments
3. Test with new credential
4. Revoke old credential
5. Document rotation date

## Remember

- Treat credentials like passwords
- Never share in public channels
- Use secure methods to share with team
- Rotate regularly
- Monitor for exposures