import React from 'react';
import { useLocation } from 'react-router-dom';
import { Monitor, Tablet } from 'lucide-react';
import gogyIcon from '@/assets/genogy-icon.svg';

const EDITOR_ROUTES = ['/editor', '/tree/', '/shared-edit/'];

const MobileBlocker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  const isEditorRoute = EDITOR_ROUTES.some((r) => pathname.startsWith(r));

  if (!isEditorRoute) return <>{children}</>;

  return (
    <>
      {/* Blocker shown only on small screens (<768px) for editor routes */}
      <div className="flex md:hidden fixed inset-0 z-[9999] bg-page-bg flex-col items-center justify-center px-8 text-center gap-6">
        <img src={gogyIcon} alt="Genogy" className="w-12 h-12" />
        <div className="flex items-center gap-3 text-muted-foreground">
          <Tablet className="w-6 h-6" />
          <Monitor className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          L'éditeur est conçu pour tablette et ordinateur
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Pour utiliser l'éditeur de génogramme, veuillez utiliser un appareil avec un écran plus large (tablette en mode paysage ou ordinateur).
        </p>
      </div>
      {/* App content hidden on mobile, visible on md+ */}
      <div className="hidden md:contents">
        {children}
      </div>
    </>
  );
};

export default MobileBlocker;
