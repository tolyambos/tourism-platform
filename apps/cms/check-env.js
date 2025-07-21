#!/usr/bin/env node

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NODE_ENV'
];

const optionalEnvVars = [
  'REDIS_HOST',
  'REDIS_URL', 
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'PORT',
  'HOSTNAME'
];

console.log('🔍 Checking environment variables...\n');

// Check required variables
console.log('Required variables:');
let hasErrors = false;
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    hasErrors = true;
  }
});

console.log('\nOptional variables:');
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  }
});

// Special checks
console.log('\nSpecial checks:');
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    console.log('⚠️  DATABASE_URL points to localhost - ensure database is accessible from Railway');
  } else {
    console.log('✅ DATABASE_URL appears to be remote');
  }
}

if (hasErrors) {
  console.log('\n❌ Missing required environment variables!');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set');
}