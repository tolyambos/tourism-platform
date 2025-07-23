'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { checkDomainStatus } from '@/app/sites/[siteId]/settings/actions';

interface DomainStatusProps {
  domain: string | null;
  subdomain: string;
}

interface DomainInfo {
  exists: boolean;
  verified: boolean;
  dnsConfigured: boolean;
  sslStatus?: string;
  error?: string;
}

export function DomainStatus({ domain, subdomain }: DomainStatusProps) {
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (domain) {
      setLoading(true);
      checkDomainStatus(domain)
        .then(setDomainInfo)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [domain]);

  if (!domain) {
    return (
      <div className="mt-2 rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">No custom domain configured</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Your site is currently accessible at:</p>
              <a 
                href={`https://${subdomain}.tourism-platform.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center font-medium text-blue-600 hover:text-blue-500"
              >
                {subdomain}.tourism-platform.com
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-2 rounded-md bg-gray-50 p-4">
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          <span className="ml-3 text-sm text-gray-600">Checking domain status...</span>
        </div>
      </div>
    );
  }

  if (!domainInfo) {
    return null;
  }

  // All good - domain is working
  if (domainInfo.verified && domainInfo.dnsConfigured) {
    return (
      <div className="mt-2 rounded-md bg-green-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Domain active</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your custom domain is fully configured and working.</p>
              <a 
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center font-medium text-green-600 hover:text-green-500"
              >
                Visit {domain}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DNS not configured
  if (!domainInfo.dnsConfigured) {
    return (
      <div className="mt-2 rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">DNS configuration required</h3>
            <div className="mt-2 text-sm text-red-700">
              <p className="mb-2">{domainInfo.error || 'DNS A record not pointing to Vercel.'}</p>
              <p className="font-medium">Add this DNS record:</p>
              <div className="mt-2 rounded bg-red-100 p-2 font-mono text-xs">
                <div>Type: A</div>
                <div>Name: @ (or {domain})</div>
                <div>Value: 76.76.21.21</div>
              </div>
              <p className="mt-2 text-xs">
                Note: If using Cloudflare, ensure the proxy (orange cloud) is disabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DNS configured but not verified
  if (!domainInfo.verified) {
    return (
      <div className="mt-2 rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Domain verification pending</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>DNS is configured correctly. SSL certificate is being provisioned.</p>
              <p className="mt-2">This usually takes 1-10 minutes. Please check back shortly.</p>
              {domainInfo.sslStatus && (
                <p className="mt-1 text-xs">SSL Status: {domainInfo.sslStatus}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Some other error
  return (
    <div className="mt-2 rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Domain configuration error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{domainInfo.error || 'An error occurred while configuring your domain.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}