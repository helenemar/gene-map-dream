import React from 'react';
import { EMOTIONAL_LINK_TYPES, EmotionalLinkType } from '@/types/genogram';
import { X } from 'lucide-react';

interface LinkTypeModalProps {
  open: boolean;
  onSelect: (type: EmotionalLinkType) => void;
  onClose: () => void;
}

const LinkTypeModal: React.FC<LinkTypeModalProps> = ({ open, onSelect, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-modal p-5 w-[340px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-base">Type de lien émotionnel</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {EMOTIONAL_LINK_TYPES.map((lt) => (
            <button
              key={lt.id}
              onClick={() => onSelect(lt.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-accent transition-colors text-left"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: `hsl(var(--${lt.color}))` }}
              />
              {lt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LinkTypeModal;
