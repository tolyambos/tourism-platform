import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }

  try {
    // Try to get A records
    let aRecords: string[] = [];
    try {
      aRecords = await dns.resolve4(domain);
    } catch (error) {
      console.log('No A records found:', error);
    }

    // Try to get CNAME records
    let cnameRecords: string[] = [];
    try {
      cnameRecords = await dns.resolveCname(domain);
    } catch (error) {
      console.log('No CNAME records found:', error);
    }

    // Try to get all records
    let allRecords: any[] = [];
    try {
      allRecords = await dns.resolveAny(domain);
    } catch (error) {
      console.log('Could not resolve any records:', error);
    }

    const hasCorrectARecord = aRecords.includes('76.76.21.21');

    return NextResponse.json({
      domain,
      aRecords,
      cnameRecords,
      allRecords,
      hasCorrectARecord,
      serverTime: new Date().toISOString(),
      note: 'DNS records as seen by the server'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'DNS lookup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      domain
    }, { status: 500 });
  }
}