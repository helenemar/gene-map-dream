import React from 'react';
import { Search, Download, Share2, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditorHeader: React.FC = () => {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      {/* Left: Logo + actions */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
          <span className="text-card text-xs font-bold">G</span>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          <button className="p-1.5 rounded-full hover:bg-accent transition-colors">
            <Undo2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-accent transition-colors">
            <Redo2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un membre, une pathologie, un lien, etc..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs">
          <Download className="w-3.5 h-3.5" />
          Exporter en PDF
        </Button>
        <Button size="sm" className="gap-2 rounded-full text-xs bg-primary text-primary-foreground hover:bg-primary/90">
          <Share2 className="w-3.5 h-3.5" />
          Partager
        </Button>
      </div>
    </header>
  );
};

export default EditorHeader;
