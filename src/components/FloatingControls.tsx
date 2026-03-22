import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Presentation, Undo2, Redo2, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface FloatingControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToScreen?: () => void;
  onAutoLayout?: () => void;
  zoom?: number;
  presentationMode?: boolean;
  onTogglePresentation?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onHelp?: () => void;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
  onZoomIn, onZoomOut, onFitToScreen, onAutoLayout, zoom = 1, presentationMode = false, onTogglePresentation,
  onUndo, onRedo, canUndo = false, canRedo = false, onHelp,
}) => {
  const { t } = useLanguage();
  const zoomPercent = Math.round(zoom * 100);

  return (
    <TooltipProvider delayDuration={300}>
      {!presentationMode && (
        <div className="absolute top-4 left-4 z-20">
          <div data-onboarding="undo-redo" className="flex items-center gap-1 bg-card rounded-full shadow-float border border-border p-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Undo2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t.controls.undo}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Redo2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t.controls.redo}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        <div data-onboarding="zoom-controls" className="flex items-center gap-1 bg-card rounded-full shadow-float border border-border p-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onZoomOut} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{t.controls.zoomOut}</TooltipContent>
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
            <TooltipContent side="top">{t.controls.zoomIn}</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-0.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onFitToScreen} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{t.controls.recenter}</TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onTogglePresentation}
              className={`h-10 w-10 rounded-full shadow-float border flex items-center justify-center transition-colors ${
                presentationMode
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-card border-border hover:bg-accent'
              }`}
            >
              <Presentation className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{presentationMode ? t.controls.exitPresentation : t.controls.presentationMode}</TooltipContent>
        </Tooltip>
      </div>

      {onHelp && !presentationMode && (
        <div className="absolute bottom-6 right-6 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onHelp}
                className="h-11 gap-2 px-4 rounded-full shadow-float border border-primary/30 bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <HelpCircle className="w-4.5 h-4.5 text-primary" />
                <span className="text-xs font-semibold text-primary">{t.controls.help}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{t.controls.helpShortcuts}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </TooltipProvider>
  );
};

export default FloatingControls;
