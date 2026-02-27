import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Wand2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <TooltipProvider delayDuration={300}>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onAutoLayout}
              className="h-10 px-4 rounded-full bg-card shadow-float border border-border flex items-center justify-center gap-2 hover:bg-accent transition-colors"
            >
              <Wand2 className="w-4 h-4 text-foreground" />
              <span className="text-xs font-medium text-foreground">Réorganiser</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Réorganiser l'arbre automatiquement</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1 bg-card rounded-full shadow-float border border-border p-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onZoomOut} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Dézoomer</TooltipContent>
          </Tooltip>

          <span className="text-xs font-semibold text-foreground min-w-[40px] text-center tabular-nums select-none">
            {zoomPercent}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onZoomIn} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Zoomer</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-0.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onFitToScreen} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Recentrer la vue</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FloatingControls;
