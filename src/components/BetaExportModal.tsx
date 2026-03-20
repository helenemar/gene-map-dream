import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Atom, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BetaExportModal: React.FC<Props> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 border-none [&>button]:hidden">
        <div className="relative flex flex-col items-center px-10 py-10">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>

          <Button variant="beta" size="sm" className="h-9 px-5 text-xs font-bold mb-5 pointer-events-none">
            <Atom className="w-3.5 h-3.5" />
            BETA Test
          </Button>

          <h2 className="text-lg font-semibold text-foreground text-center mb-6 max-w-sm">
            La fonctionnalité d'Export n'est pas disponible pour la version BETA
          </h2>

          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center rotate-[-3deg]">
            <Download className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetaExportModal;
