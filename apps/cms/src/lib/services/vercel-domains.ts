/**
 * Vercel Domain Management Service
 * Handles automatic domain addition/removal for custom domains
 */

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
      headers['x-vercel-team-id'] = this.teamId;
    }

    return headers;
  }

  private isConfigured(): boolean {
    return !!(this.apiToken && this.projectId);
  }

  /**
   * Add a custom domain to the Vercel project
   */
  async addDomain(domain: string): Promise<VercelDomain | null> {
    if (!this.isConfigured()) {
      console.warn('Vercel API not configured. Skipping domain addition.');
      return null;
    }

    try {
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
          return await this.getDomain(domain);
        }
        
        throw new Error(`Failed to add domain: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log(`Successfully added domain ${domain} to Vercel project.`);
      
      return result;
    } catch (error) {
      console.error('Error adding domain to Vercel:', error);
      throw error;
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
  async removeDomain(domain: string): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Vercel API not configured. Skipping domain removal.');
      return;
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
    } catch (error) {
      console.error('Error removing domain from Vercel:', error);
      throw error;
    }
  }

  /**
   * List all domains for the project
   */
  async listDomains(): Promise<VercelDomain[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/v9/projects/${this.projectId}/domains`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list domains: ${response.statusText}`);
      }

      const data = await response.json();
      return data.domains || [];
    } catch (error) {
      console.error('Error listing domains from Vercel:', error);
      return [];
    }
  }

  /**
   * Verify domain configuration
   */
  async verifyDomain(domain: string): Promise<{ verified: boolean } | null> {
    if (!this.isConfigured()) {
      return null;
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
      return null;
    }
  }

  /**
   * Get DNS configuration instructions for a domain
   */
  getDNSInstructions(domain: string): {
    type: 'CNAME' | 'A';
    name: string;
    value: string;
  }[] {
    const isApex = !domain.includes('www.');
    
    if (isApex) {
      // For apex domains, use A records
      return [
        { type: 'A', name: '@', value: '76.76.21.21' }
      ];
    } else {
      // For subdomains, use CNAME
      return [
        { type: 'CNAME', name: domain.split('.')[0], value: 'cname.vercel-dns.com' }
      ];
    }
  }
}

// Export singleton instance
export const vercelDomainService = new VercelDomainService();