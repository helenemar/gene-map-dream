import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Wand2 } from 'lucide-react';

interface FloatingControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToScreen?: () => void;
  onAutoLayout?: () => void;
  zoom?: number;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
  onZoomIn, onZoomOut, onFitToScreen, onAutoLayout, zoom = 1,
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
      <button
        onClick={onAutoLayout}
        className="w-10 h-10 rounded-full bg-card shadow-float border border-border flex items-center justify-center hover:bg-accent transition-colors"
        title="Réorganiser l'arbre"
      >
        <Wand2 className="w-4 h-4 text-foreground" />
      </button>

      <div className="flex items-center gap-1 bg-card rounded-full shadow-float border border-border p-1.5">
        <button onClick={onZoomOut} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors" title="Dézoomer">
          <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-xs font-semibold text-foreground min-w-[40px] text-center tabular-nums select-none">
          {zoomPercent}%
        </span>
        <button onClick={onZoomIn} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors" title="Zoomer">
          <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="w-px h-5 bg-border mx-0.5" />
        <button onClick={onFitToScreen} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors" title="Recentrer la vue">
          <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default FloatingControls;
