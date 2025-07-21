import { PrismaClient } from '@tourism/database';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prisma connection pool configuration
export const prismaOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
};

// Create a singleton instance with connection pooling
export const prisma = global.prisma || new PrismaClient({
  ...prismaOptions,
  // Connection pool settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Middleware for query logging in development
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    console.log(
      `Query ${params.model}.${params.action} took ${after - before}ms`
    );
    
    return result;
  });
}