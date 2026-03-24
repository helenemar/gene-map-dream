import React, { useState } from 'react';
import { EMOTIONAL_LINK_TYPES, EmotionalLinkType } from '@/types/genogram';
import { X, Trash2, Heart, AlertTriangle } from 'lucide-react';
import { EmotionalLinkPreview } from '@/components/EmotionalLinkLine';

interface LinkTypeModalProps {
  open: boolean;
  onSelect: (type: EmotionalLinkType) => void;
  onClose: () => void;
  currentType?: EmotionalLinkType;
  onDelete?: () => void;
}

const LinkTypeModal: React.FC<LinkTypeModalProps> = ({ open, onSelect, onClose, currentType, onDelete }) => {
  React.useEffect(() => {
    if (open) window.getSelection()?.removeAllRanges();
  }, [open]);

  if (!open) return null;

  const isEditing = !!currentType;
  const relationalLinks = EMOTIONAL_LINK_TYPES.filter(lt => lt.category === 'relational');
  const abusiveLinks = EMOTIONAL_LINK_TYPES.filter(lt => lt.category === 'abusive');

  const renderItem = (lt: typeof EMOTIONAL_LINK_TYPES[0]) => (
    <button
      key={lt.id}
      onClick={() => onSelect(lt.id)}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all shrink-0 border ${
        currentType === lt.id
          ? 'bg-primary/10 border-primary/30 shadow-sm'
          : 'border-transparent hover:bg-accent/60'
      }`}
    >
      <EmotionalLinkPreview type={lt.id} width={48} height={20} strokeScale={0.8} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground leading-tight">{lt.label}</span>
        <span className="text-[11px] text-muted-foreground leading-tight">{lt.description}</span>
      </div>
      {currentType === lt.id && (
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">Actuel</span>
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-modal p-5 w-[380px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 shrink-0 px-1">
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

        <div
          data-scroll-lock="modal-scroll"
          className="flex flex-col gap-1 overflow-y-scroll min-h-0 px-1 py-1 overscroll-contain"
        >
          {/* Relational category */}
          <div className="flex items-center gap-2 px-2 pt-1 pb-1.5">
            <Heart className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Relationnels</span>
          </div>
          {relationalLinks.map(renderItem)}

          {/* Separator */}
          <div className="my-2 border-t border-border/50" />

          {/* Abusive category */}
          <div className="flex items-center gap-2 px-2 pt-1 pb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Abus & violences</span>
          </div>
          {abusiveLinks.map(renderItem)}
        </div>

        {isEditing && onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 w-full mt-4 px-3 h-12 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors shrink-0 border-t border-border/50"
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
