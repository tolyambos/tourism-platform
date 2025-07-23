'use client';

import { AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface DomainInstructionsProps {
  domain: string | null;
  platformDomain: string;
}

export function DomainInstructions({ domain, platformDomain }: DomainInstructionsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!domain) return null;

  const isApexDomain = !domain.includes('www.');

  return (
    <div className="mt-3 rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-blue-800">DNS Configuration Required</h3>
          <div className="mt-3 text-sm text-blue-700">
            <p className="mb-3">Configure your DNS records at your domain registrar:</p>
            
            {isApexDomain ? (
              <div className="rounded-md bg-white p-3 border border-blue-200">
                <p className="text-xs font-medium text-gray-600 mb-2">For apex domain ({domain}):</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Type:</span> A
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Name:</span> @
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Value:</span> 76.76.21.21
                    </div>
                    <button
                      onClick={() => copyToClipboard('76.76.21.21', 'ip')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded"
                    >
                      {copied === 'ip' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-white p-3 border border-blue-200">
                <p className="text-xs font-medium text-gray-600 mb-2">For subdomain ({domain}):</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Type:</span> CNAME
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Name:</span> www
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-medium">Value:</span> 
                      <span className="ml-1 font-mono text-xs break-all">{platformDomain}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(platformDomain, 'cname')}
                      className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                    >
                      {copied === 'cname' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2 text-xs text-gray-600">
              <p>• DNS changes typically take 5-30 minutes to propagate</p>
              <p>• SSL certificates will be automatically provisioned</p>
              <p>• Ensure your site is published before testing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}