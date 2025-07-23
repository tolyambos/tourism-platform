import dns from 'dns/promises';

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

interface DomainVerification {
  verified: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

class VercelDomainService {
  private apiToken: string;
  private projectId: string;
  private teamId?: string;
  private baseUrl = 'https://api.vercel.com';

  constructor() {
    this.apiToken = process.env.VERCEL_API_TOKEN || '';
    this.projectId = process.env.VERCEL_PROJECT_ID || '';
    this.teamId = process.env.VERCEL_TEAM_ID;

    if (!this.apiToken || !this.projectId) {
      console.warn('Vercel API credentials not configured. Domain management will be disabled.');
    }
  }

  private get headers() {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };

    if (this.teamId) {
      headers['x-team-id'] = this.teamId;
    }

    return headers;
  }

  private isConfigured(): boolean {
    return !!(this.apiToken && this.projectId);
  }

  /**
   * Check DNS A record for a domain
   */
  async checkDNSRecord(domain: string): Promise<{
    hasCorrectARecord: boolean;
    currentRecords: string[];
  }> {
    try {
      const records = await dns.resolve4(domain);
      const hasCorrectARecord = records.includes('76.76.21.21');
      
      console.log(`DNS check for ${domain}:`, {
        records,
        hasCorrectARecord
      });
      
      return {
        hasCorrectARecord,
        currentRecords: records
      };
    } catch (error) {
      // If it's ENODATA or ENOTFOUND, the domain might not have A records
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
        console.log(`No A records found for ${domain}`);
      } else {
        console.error(`DNS lookup failed for ${domain}:`, error);
      }
      
      return {
        hasCorrectARecord: false,
        currentRecords: []
      };
    }
  }

  /**
   * Add a domain to Vercel project
   */
  async addDomain(domain: string, skipDNSCheck = false): Promise<{
    success: boolean;
    error?: string;
    domain?: VercelDomain;
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Vercel API not configured'
      };
    }

    try {
      // First check DNS unless skipped
      if (!skipDNSCheck) {
        const dnsCheck = await this.checkDNSRecord(domain);
        if (!dnsCheck.hasCorrectARecord) {
          // For now, let's just warn but still try to add
          console.warn(`DNS warning for ${domain}: Expected A record pointing to 76.76.21.21, but found: ${dnsCheck.currentRecords.join(', ') || 'no A records'}`);
          // We'll still proceed since DNS might not have propagated to this server yet
        }
      }

      const response = await fetch(
        `${this.baseUrl}/v10/projects/${this.projectId}/domains`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ name: domain }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        
        // If domain already exists, that's okay
        if (response.status === 409) {
          console.log(`Domain ${domain} already exists in project.`);
          const existingDomain = await this.getDomain(domain);
          if (existingDomain) {
            return {
              success: true,
              domain: existingDomain
            };
          }
        }
        
        return {
          success: false,
          error: `Failed to add domain: ${response.status} - ${error}`
        };
      }

      const result = await response.json();
      console.log(`Successfully added domain ${domain} to Vercel project.`);
      
      return {
        success: true,
        domain: result
      };
    } catch (error) {
      console.error('Error adding domain to Vercel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get domain details
   */
  async getDomain(domain: string): Promise<VercelDomain | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/v9/projects/${this.projectId}/domains/${domain}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get domain: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting domain from Vercel:', error);
      return null;
    }
  }

  /**
   * Remove a domain from the project
   */
  async removeDomain(domain: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/v9/projects/${this.projectId}/domains/${domain}`,
        {
          method: 'DELETE',
          headers: this.headers,
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to remove domain: ${response.statusText}`);
      }

      console.log(`Successfully removed domain ${domain} from Vercel project.`);
      return true;
    } catch (error) {
      console.error('Error removing domain from Vercel:', error);
      return false;
    }
  }

  /**
   * Verify domain configuration
   */
  async verifyDomain(domain: string): Promise<DomainVerification> {
    if (!this.isConfigured()) {
      return { verified: false };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/v9/projects/${this.projectId}/domains/${domain}/verify`,
        {
          method: 'POST',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to verify domain: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying domain:', error);
      return { verified: false };
    }
  }

  /**
   * Get domain status including DNS and SSL info
   */
  async getDomainStatus(domain: string): Promise<{
    exists: boolean;
    verified: boolean;
    dnsConfigured: boolean;
    dnsRecords?: string[];
    sslStatus?: string;
    error?: string;
  }> {
    try {
      // Check DNS first
      const dnsCheck = await this.checkDNSRecord(domain);
      
      // Check if domain exists in Vercel
      const vercelDomain = await this.getDomain(domain);
      
      if (!vercelDomain) {
        return {
          exists: false,
          verified: false,
          dnsConfigured: dnsCheck.hasCorrectARecord,
          dnsRecords: dnsCheck.currentRecords,
          error: dnsCheck.currentRecords.length > 0
            ? `DNS records found (${dnsCheck.currentRecords.join(', ')}), but domain not added to Vercel` 
            : 'No DNS A records found'
        };
      }

      // Try to verify if not already verified
      if (!vercelDomain.verified) {
        const verification = await this.verifyDomain(domain);
        return {
          exists: true,
          verified: verification.verified,
          dnsConfigured: dnsCheck.hasCorrectARecord,
          dnsRecords: dnsCheck.currentRecords,
          sslStatus: verification.verified ? 'active' : 'pending'
        };
      }

      return {
        exists: true,
        verified: vercelDomain.verified,
        dnsConfigured: dnsCheck.hasCorrectARecord,
        dnsRecords: dnsCheck.currentRecords,
        sslStatus: 'active'
      };
    } catch (error) {
      return {
        exists: false,
        verified: false,
        dnsConfigured: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const vercelDomainService = new VercelDomainService();