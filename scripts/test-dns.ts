#!/usr/bin/env tsx

import dns from 'dns/promises';

async function testDNS(domain: string) {
  console.log(`\nTesting DNS for: ${domain}`);
  console.log('='.repeat(50));

  try {
    // Check A records
    console.log('\n1. Checking A records...');
    try {
      const aRecords = await dns.resolve4(domain);
      console.log('✅ A records found:', aRecords);
      console.log('   Has correct Vercel IP (76.76.21.21):', aRecords.includes('76.76.21.21'));
    } catch (error: any) {
      console.log('❌ No A records found:', error.code || error.message);
    }

    // Check CNAME records
    console.log('\n2. Checking CNAME records...');
    try {
      const cnameRecords = await dns.resolveCname(domain);
      console.log('✅ CNAME records found:', cnameRecords);
    } catch (error: any) {
      console.log('❌ No CNAME records found:', error.code || error.message);
    }

    // Check NS records
    console.log('\n3. Checking NS records...');
    try {
      const nsRecords = await dns.resolveNs(domain);
      console.log('✅ NS records found:', nsRecords);
    } catch (error: any) {
      console.log('❌ No NS records found:', error.code || error.message);
    }

    // Try resolveAny
    console.log('\n4. Checking all records with resolveAny...');
    try {
      const anyRecords = await dns.resolveAny(domain);
      console.log('✅ All records:');
      anyRecords.forEach(record => {
        console.log(`   ${JSON.stringify(record)}`);
      });
    } catch (error: any) {
      console.log('❌ Could not resolve any records:', error.code || error.message);
    }

    // Check with different DNS servers
    console.log('\n5. Checking with Google DNS (8.8.8.8)...');
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4']);
    
    try {
      const googleDnsRecords = await resolver.resolve4(domain);
      console.log('✅ A records from Google DNS:', googleDnsRecords);
    } catch (error: any) {
      console.log('❌ No A records from Google DNS:', error.code || error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Test domains
const domains = process.argv.slice(2);

if (domains.length === 0) {
  console.log('Usage: tsx scripts/test-dns.ts <domain1> [domain2] ...');
  console.log('Example: tsx scripts/test-dns.ts flamrailwaytickets.com floral-fantasy-tickets.com');
  process.exit(1);
}

(async () => {
  for (const domain of domains) {
    await testDNS(domain);
  }
})();