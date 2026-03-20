import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

/** 12 harmonious, distinct pathology colors */
export const PATHOLOGY_COLORS: string[] = [
  '#E63946', // vermillon
  '#E89005', // ambre
  '#D4A373', // sable
  '#C1666B', // vieux rose
  '#9B5DE5', // améthyste
  '#457B9D', // bleu tempête
  '#48BFE3', // azur
  '#264653', // pétrole
  '#2A9D8F', // émeraude
  '#7FB069', // sauge
  '#5E6472', // ardoise
  '#A8763E', // bronze
];

interface AddPathologyModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, colorHex: string) => void;
  usedColors?: string[];
}

const AddPathologyModal: React.FC<AddPathologyModalProps> = ({
  open,
  onClose,
  onAdd,
  usedColors = [],
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !selectedColor) return;
    onAdd(name.trim(), selectedColor);
    setName('');
    setSelectedColor('');
    onClose();
  };

  // Suggest first unused color
  const suggestColor = () => {
    if (selectedColor) return;
    const unused = PATHOLOGY_COLORS.find(c => !usedColors.includes(c));
    if (unused) setSelectedColor(unused);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base">Ajouter une pathologie</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* Name input with color preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border-2 border-border shrink-0 transition-colors"
              style={{ backgroundColor: selectedColor || 'hsl(var(--muted))' }}
            />
            <Input
              className="h-10 text-sm flex-1"
              placeholder="Maladie de Lyme"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={suggestColor}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button
              onClick={handleAdd}
              disabled={!name.trim() || !selectedColor}
              className="h-10 px-5 font-semibold"
            >
              Ajouter
            </Button>
          </div>

          {/* Color grid */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Choisir une couleur</p>
            <div className="grid grid-cols-6 gap-2">
              {PATHOLOGY_COLORS.map((color) => {
                const isUsed = usedColors.includes(color);
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    disabled={isUsed}
                    onClick={() => setSelectedColor(color)}
                    className={`
                      w-8 h-8 rounded-lg transition-all border-2
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2 border-primary scale-110' : 'border-transparent hover:scale-110'}
                      ${isUsed ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{ backgroundColor: color }}
                    title={isUsed ? 'Couleur déjà utilisée' : color}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white mx-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPathologyModal;
