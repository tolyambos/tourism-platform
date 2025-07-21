'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface DeployButtonProps {
  siteId: string;
  hasContent: boolean;
  hasSubdomain: boolean;
}

export function DeployButton({ siteId, hasContent, hasSubdomain }: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const router = useRouter();

  const handleDeploy = async () => {
    if (!hasContent || !hasSubdomain) return;
    
    setIsDeploying(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/deploy`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Site deployed successfully!');
        router.refresh();
      } else {
        throw new Error('Deployment failed');
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      toast.error('Failed to deploy site');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <button
        onClick={handleDeploy}
        disabled={!hasContent || !hasSubdomain || isDeploying}
        className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
          hasContent && hasSubdomain && !isDeploying
            ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        <Rocket className="h-5 w-5 mr-2" />
        {isDeploying ? 'Deploying...' : 'Deploy to Production'}
      </button>
      {(!hasContent || !hasSubdomain) && (
        <p className="mt-2 text-sm text-red-600">
          {!hasContent && 'Generate content before deploying. '}
          {!hasSubdomain && 'Configure subdomain before deploying.'}
        </p>
      )}
    </>
  );
}