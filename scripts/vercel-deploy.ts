#!/usr/bin/env tsx

/**
 * Vercel Deployment Helper Script
 * This script helps manage Vercel deployments and custom domains
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from 'dotenv';

config();

const execAsync = promisify(exec);

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
  console.error('Missing required environment variables: VERCEL_TOKEN, VERCEL_PROJECT_ID');
  process.exit(1);
}

interface VercelDomain {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string;
  redirectStatusCode?: number;
  gitBranch?: string;
  updatedAt: number;
  createdAt: number;
  verified: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

/**
 * Add a custom domain to the Vercel project
 */
async function addDomain(domain: string): Promise<VercelDomain> {
  const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  if (VERCEL_TEAM_ID) {
    headers['x-vercel-team-id'] = VERCEL_TEAM_ID;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: domain }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add domain: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * List all domains for the project
 */
async function listDomains(): Promise<VercelDomain[]> {
  const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
  };
  
  if (VERCEL_TEAM_ID) {
    headers['x-vercel-team-id'] = VERCEL_TEAM_ID;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to list domains: ${response.statusText}`);
  }

  const data = await response.json();
  return data.domains;
}

/**
 * Remove a domain from the project
 */
async function removeDomain(domain: string): Promise<void> {
  const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
  };
  
  if (VERCEL_TEAM_ID) {
    headers['x-vercel-team-id'] = VERCEL_TEAM_ID;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to remove domain: ${response.statusText}`);
  }
}

/**
 * Verify a domain
 */
async function verifyDomain(domain: string): Promise<any> {
  const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
  };
  
  if (VERCEL_TEAM_ID) {
    headers['x-vercel-team-id'] = VERCEL_TEAM_ID;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to verify domain: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Deploy the project
 */
async function deploy(): Promise<void> {
  console.log('🚀 Deploying to Vercel...');
  
  try {
    const { stdout, stderr } = await execAsync('vercel --prod', {
      cwd: process.cwd(),
    });
    
    if (stderr) {
      console.error('Deployment warnings:', stderr);
    }
    
    console.log('✅ Deployment successful!');
    console.log(stdout);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

/**
 * Main CLI
 */
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'add-domain':
        if (!arg) {
          console.error('Usage: vercel-deploy add-domain <domain>');
          process.exit(1);
        }
        console.log(`Adding domain ${arg}...`);
        const domain = await addDomain(arg);
        console.log('✅ Domain added successfully!');
        console.log('Domain details:', JSON.stringify(domain, null, 2));
        
        if (!domain.verified) {
          console.log('\n⚠️  Domain needs verification. DNS records:');
          domain.verification?.forEach(v => {
            console.log(`- Type: ${v.type}, Domain: ${v.domain}, Value: ${v.value}`);
          });
        }
        break;

      case 'list-domains':
        console.log('Fetching domains...');
        const domains = await listDomains();
        console.log('\n📋 Project domains:');
        domains.forEach(d => {
          console.log(`- ${d.name} ${d.verified ? '✅' : '❌ (unverified)'}`);
        });
        break;

      case 'remove-domain':
        if (!arg) {
          console.error('Usage: vercel-deploy remove-domain <domain>');
          process.exit(1);
        }
        console.log(`Removing domain ${arg}...`);
        await removeDomain(arg);
        console.log('✅ Domain removed successfully!');
        break;

      case 'verify-domain':
        if (!arg) {
          console.error('Usage: vercel-deploy verify-domain <domain>');
          process.exit(1);
        }
        console.log(`Verifying domain ${arg}...`);
        const verification = await verifyDomain(arg);
        console.log('Verification result:', JSON.stringify(verification, null, 2));
        break;

      case 'deploy':
        await deploy();
        break;

      default:
        console.log(`
Vercel Deployment Helper

Usage:
  scripts/vercel-deploy.ts <command> [options]

Commands:
  add-domain <domain>     Add a custom domain to the project
  list-domains           List all domains for the project
  remove-domain <domain>  Remove a domain from the project
  verify-domain <domain>  Verify a domain's DNS configuration
  deploy                 Deploy the project to Vercel

Environment variables required:
  VERCEL_TOKEN          Your Vercel API token
  VERCEL_PROJECT_ID     Your Vercel project ID
  VERCEL_TEAM_ID        Your Vercel team ID (optional)

Example:
  tsx scripts/vercel-deploy.ts add-domain prahazoo.com
  tsx scripts/vercel-deploy.ts list-domains
        `);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();