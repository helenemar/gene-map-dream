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
  '#7C4FDD', '#FF9BF7', '#009688', '#FF9A51', '#FFE851', '#51FFC8',
  '#FF519F', '#5168FF', '#15E951', '#FF5151', '#D651FF', '#AA7A46',
  '#28C6E2', '#E27928', '#E2D628', '#E2282B',
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

          {/* Color grid — only show available (unused) colors */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Choisir une couleur</p>
            <div className="flex flex-wrap gap-2">
              {PATHOLOGY_COLORS.filter(c => !usedColors.includes(c)).map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`
                      w-8 h-8 rounded-lg transition-all border-2 cursor-pointer
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2 border-primary scale-110' : 'border-transparent hover:scale-110'}
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
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
