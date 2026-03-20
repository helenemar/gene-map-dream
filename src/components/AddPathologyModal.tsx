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

/** 16 pathology colors — first 10 for defaults, last 6 for custom */
export const PATHOLOGY_COLORS: string[] = [
  '#FF3333', '#801A1A', '#FF8C33', '#FFFF4D', '#B38F00', '#99FF4D',
  '#1A803D', '#4DFFFF', '#1A7A80', '#4D4DFF', '#1A1A80', '#804DFF',
  '#3D1A80', '#FF4DFF', '#801A4F', '#FF4D99',
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
            <div className="grid grid-cols-8 gap-2">
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
