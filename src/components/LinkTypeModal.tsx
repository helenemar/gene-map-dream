import React from 'react';
import { EMOTIONAL_LINK_TYPES, EmotionalLinkType } from '@/types/genogram';
import { X, Trash2 } from 'lucide-react';

interface LinkTypeModalProps {
  open: boolean;
  onSelect: (type: EmotionalLinkType) => void;
  onClose: () => void;
  /** If set, we're editing an existing link */
  currentType?: EmotionalLinkType;
  /** Called when user wants to delete the link */
  onDelete?: () => void;
}

const LinkTypeModal: React.FC<LinkTypeModalProps> = ({ open, onSelect, onClose, currentType, onDelete }) => {
  React.useEffect(() => {
    if (open) window.getSelection()?.removeAllRanges();
  }, [open]);

  if (!open) return null;

  const isEditing = !!currentType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-modal p-5 w-[340px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-base">
            {isEditing ? 'Modifier le lien émotionnel' : 'Type de lien émotionnel'}
          </h3>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-accent transition-colors text-left ${
                currentType === lt.id ? 'bg-primary/10 ring-1 ring-primary/30' : ''
              }`}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: `hsl(var(--${lt.color}))` }}
              />
              {lt.label}
              {currentType === lt.id && (
                <span className="ml-auto text-[10px] font-medium text-primary">Actuel</span>
              )}
            </button>
          ))}
        </div>
        {isEditing && onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 w-full mt-4 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer ce lien
          </button>
        )}
      </div>
    </div>
  );
};

export default LinkTypeModal;
