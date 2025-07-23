'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { checkDomainStatus } from '@/app/sites/[siteId]/settings/actions';

interface DomainStatusProps {
  domain: string | null;
  subdomain: string;
}

interface DomainInfo {
  exists: boolean;
  verified: boolean;
  verification: Array<{
    type: string;
    domain: string;
    value: string;
    reason: string;
  }>;
  dnsInstructions: Array<{
    type: 'CNAME' | 'A';
    name: string;
    value: string;
  }>;
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
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
          <span className="ml-3 text-sm text-gray-600">Checking domain status...</span>
        </div>
      </div>
    );
  }

  if (!domainInfo) {
    return null;
  }

  if (domainInfo.verified) {
    return (
      <div className="mt-2 rounded-md bg-green-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Domain verified</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your custom domain is active and configured correctly.</p>
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

  // Domain not verified - show DNS instructions
  return (
    <div className="mt-2 rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-yellow-800">Domain verification pending</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-3">Configure your DNS records with these settings:</p>
            
            <div className="rounded-md bg-white p-3 border border-yellow-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {domainInfo.dnsInstructions.map((instruction, index) => (
                    <tr key={index}>
                      <td className="py-2 font-medium">{instruction.type}</td>
                      <td className="py-2 font-mono text-xs">{instruction.name}</td>
                      <td className="py-2 font-mono text-xs break-all">{instruction.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs">
              DNS changes can take up to 48 hours to propagate. Once configured, your domain will be automatically verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}