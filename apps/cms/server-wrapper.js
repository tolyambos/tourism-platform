#!/usr/bin/env node

// Set server start time for health check grace period
process.env.SERVER_START_TIME = Date.now().toString();

// Set hostname to listen on all interfaces for Railway
process.env.HOSTNAME = '0.0.0.0';

// Log startup information
console.log(`Starting server on port ${process.env.PORT || 3000}...`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Import and run the standalone server
require('./.next/standalone/apps/cms/server.js');