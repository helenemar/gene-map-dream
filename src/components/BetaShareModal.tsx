import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Atom } from 'lucide-react';
import sharePreview from '@/assets/share-preview.png';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BetaShareModal: React.FC<Props> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 border-none [&>button]:hidden">
        <div className="relative flex flex-col items-center px-10 py-10">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>

          {/* Beta badge */}
          <Button variant="beta" size="sm" className="h-9 px-5 text-xs font-bold mb-5 pointer-events-none">
            <Atom className="w-3.5 h-3.5" />
            BETA Test
          </Button>

          {/* Title */}
          <h2 className="text-lg font-semibold text-foreground text-center mb-6 max-w-sm">
            La fonctionnalité de Partage n'est pas disponible pour la version BETA
          </h2>

          {/* Share preview image */}
          <img
            src={sharePreview}
            alt="Aperçu de la fonctionnalité de partage"
            className="w-[320px] rounded-xl shadow-lg border border-border/50 rotate-[-3deg]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetaShareModal;
