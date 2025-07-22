'use client';

import { useState } from 'react';
import { ChevronLeft, Rocket, Globe, CheckCircle, ExternalLink, Copy } from 'lucide-react';

interface DeploymentStepProps {
  siteId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function DeploymentStep({ siteId, onComplete, onBack }: DeploymentStepProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const startDeployment = async () => {
    setIsDeploying(true);
    setDeploymentStatus('deploying');
    
    try {
      // Simulate deployment process
      const response = await fetch(`/api/sites/${siteId}/deploy`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Deployment failed');
      
      const { url } = await response.json();
      
      // Simulate deployment time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Use the URL from the API response (which now returns the correct Vercel URL)
      setDeploymentUrl(url);
      setDeploymentStatus('success');
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentStatus('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(deploymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deploy Your Site</h2>
          <p className="text-gray-600 mt-1">
            Launch your website to the world
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          disabled={isDeploying}
          className="flex items-center text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>
      </div>

      {deploymentStatus === 'idle' && (
        <div className="text-center py-12">
          <Rocket className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to Deploy
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your site is ready to go live. Click the button below to deploy it to our global CDN.
          </p>
          <button
            onClick={startDeployment}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Deploy Now
          </button>
        </div>
      )}

      {deploymentStatus === 'deploying' && (
        <div className="text-center py-12">
          <div className="relative">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
            Deploying Your Site
          </h3>
          <p className="text-gray-600">
            This usually takes about 30 seconds...
          </p>
        </div>
      )}

      {deploymentStatus === 'success' && (
        <div>
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Deployment Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your site is now live and accessible worldwide.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Site URL</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center mt-1">
                  <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                  {deploymentUrl}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit Site
                </a>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your site is now published to the database. The Vercel-hosted website 
                  reads from this database and will display your content at the URL above.
                </p>
              </div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Next Steps</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  Configure a custom domain in the site settings
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  Edit content and customize the design
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  Set up analytics to track visitor engagement
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onComplete}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Site Dashboard
            </button>
          </div>
        </div>
      )}

      {deploymentStatus === 'error' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Deployment Failed
          </h3>
          <p className="text-gray-600 mb-6">
            Something went wrong during deployment. Please try again.
          </p>
          <button
            onClick={startDeployment}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retry Deployment
          </button>
        </div>
      )}
    </div>
  );
}