'use client';

import { useState } from 'react';
import { ExternalLink, Trash2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SiteActionsProps {
  siteId: string;
  subdomain: string;
  domain?: string | null;
  className?: string;
}

export function SiteActions({ siteId, subdomain, domain, className = '' }: SiteActionsProps) {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const router = useRouter();
  
  const siteUrl = domain 
    ? `https://${domain}`
    : `http://${subdomain}.localhost:3001`;
  
  const handleOpenWebsite = () => {
    window.open(siteUrl, '_blank');
  };
  
  const handleCleanupSections = async () => {
    if (!confirm('This will remove any sections that don\'t belong to this site type. Continue?')) {
      return;
    }
    
    setIsCleaningUp(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/cleanup-sections`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Cleanup completed! Removed ${data.removedSections?.length || 0} sections.`);
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to cleanup sections');
      console.error(error);
    } finally {
      setIsCleaningUp(false);
    }
  };
  
  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleOpenWebsite}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        title="Open website in new tab"
      >
        <ExternalLink className="h-4 w-4 mr-1.5" />
        Open Website
      </button>
      
      <button
        onClick={handleCleanupSections}
        disabled={isCleaningUp}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-orange-700 bg-orange-50 border border-orange-300 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove sections that don't belong to this site type"
      >
        {isCleaningUp ? (
          <>
            <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
            Cleaning...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clean Sections
          </>
        )}
      </button>
    </div>
  );
}