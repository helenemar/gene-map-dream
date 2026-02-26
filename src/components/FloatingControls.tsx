import React from 'react';
import { Pencil, Plus, ZoomIn, ZoomOut, Link, Maximize } from 'lucide-react';

interface FloatingControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToScreen?: () => void;
  zoom?: number;
  mode?: 'select' | 'link';
  onToggleMode?: () => void;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
  onZoomIn, onZoomOut, onFitToScreen, zoom = 1, mode = 'select', onToggleMode,
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
      <div className="flex items-center gap-1 bg-card rounded-full shadow-float border border-border p-1.5">
        <button
          onClick={onToggleMode}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            mode === 'link' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
          title={mode === 'link' ? 'Mode liaison actif' : 'Activer le mode liaison'}
        >
          <Link className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
          <Pencil className="w-4 h-4 text-foreground" />
        </button>
        <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

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
