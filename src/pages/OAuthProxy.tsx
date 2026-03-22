import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const OAUTH_BROKER_ORIGIN = 'https://gene-map-dream.lovable.app';

const OAuthProxy: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const targetUrl = `${OAUTH_BROKER_ORIGIN}${location.pathname}${location.search}${location.hash}`;
    window.location.replace(targetUrl);
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirection vers Google…</p>
      </div>
    </div>
  );
};

export default OAuthProxy;
