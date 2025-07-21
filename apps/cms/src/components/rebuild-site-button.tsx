'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RebuildSiteButtonProps {
  siteId: string;
  siteType: 'CITY' | 'ATTRACTION' | 'REGION' | 'CUSTOM';
}

export function RebuildSiteButton({ siteId, siteType }: RebuildSiteButtonProps) {
  const [isRebuilding, setIsRebuilding] = useState(false);
  const router = useRouter();

  const handleRebuild = async () => {
    if (!confirm('This will delete all existing sections and create new ones with the latest templates. Continue?')) {
      return;
    }

    setIsRebuilding(true);
    
    try {
      const response = await fetch(`/api/sites/${siteId}/rebuild`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rebuild site');
      }

      alert(`Site rebuilt successfully! ${data.sectionsCreated} sections created.`);
      router.refresh();
    } catch (error) {
      console.error('Rebuild error:', error);
      alert(error instanceof Error ? error.message : 'Failed to rebuild site');
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <button
      onClick={handleRebuild}
      disabled={isRebuilding}
      className={`
        relative rounded-lg border bg-white px-6 py-4 shadow-sm flex items-center space-x-3 
        transition-all duration-200 w-full
        ${isRebuilding 
          ? 'border-gray-200 opacity-50 cursor-not-allowed' 
          : 'border-orange-300 hover:border-orange-400 hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500'
        }
      `}
    >
      <div className="flex-shrink-0">
        <RefreshCw className={`h-6 w-6 text-orange-600 ${isRebuilding ? 'animate-spin' : ''}`} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-gray-900">
          {isRebuilding ? 'Rebuilding...' : 'Rebuild Site'}
        </p>
        <p className="text-sm text-gray-500">
          {siteType === 'ATTRACTION' 
            ? 'Update to new attraction layout' 
            : siteType === 'CITY'
            ? 'Refresh with latest city templates'
            : siteType === 'REGION'
            ? 'Update regional content templates'
            : 'Refresh with latest templates'
          }
        </p>
      </div>
    </button>
  );
}