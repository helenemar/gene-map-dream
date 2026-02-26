import React from 'react';
import { Pencil, Plus, ZoomIn, ZoomOut } from 'lucide-react';

interface FloatingControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({ onZoomIn, onZoomOut }) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
      <div className="flex items-center gap-1 bg-card rounded-full shadow-lg border border-border p-1.5">
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
          <Pencil className="w-4 h-4 text-foreground" />
        </button>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <Plus className="w-4 h-4 text-secondary-foreground" />
        </button>
      </div>

      {/* Zoom controls - separate group */}
      <div className="flex items-center gap-1 bg-card rounded-full shadow-lg border border-border p-1.5 ml-2">
        <button onClick={onZoomOut} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
          <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={onZoomIn} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
          <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default FloatingControls;
