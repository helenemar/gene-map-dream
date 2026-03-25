import React from 'react';
import { EMOTIONAL_LINK_TYPES, EmotionalLinkType } from '@/types/genogram';
import { X, Trash2, Heart, AlertTriangle, Check } from 'lucide-react';
import { EmotionalLinkPreview } from '@/components/EmotionalLinkLine';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkTypeModalProps {
  open: boolean;
  onSelect: (type: EmotionalLinkType) => void;
  onClose: () => void;
  currentType?: EmotionalLinkType;
  onDelete?: () => void;
  /** Types already used between this pair (to prevent exact duplicates) */
  existingTypes?: EmotionalLinkType[];
}

const LinkTypeModal: React.FC<LinkTypeModalProps> = ({ open, onSelect, onClose, currentType, onDelete, existingTypes = [] }) => {
  React.useEffect(() => {
    if (open) window.getSelection()?.removeAllRanges();
  }, [open]);

  // Escape key to close
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const isEditing = !!currentType;
  const relationalLinks = EMOTIONAL_LINK_TYPES.filter(lt => lt.category === 'relational');
  const abusiveLinks = EMOTIONAL_LINK_TYPES.filter(lt => lt.category === 'abusive');

  const renderItem = (lt: typeof EMOTIONAL_LINK_TYPES[0]) => {
    const isAlreadyUsed = !isEditing && existingTypes.includes(lt.id);
    const isActive = currentType === lt.id;

    return (
      <motion.button
        key={lt.id}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => !isAlreadyUsed && onSelect(lt.id)}
        disabled={isAlreadyUsed}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all shrink-0 border ${
          isActive
            ? 'bg-primary/10 border-primary/30 shadow-sm ring-1 ring-primary/20'
            : isAlreadyUsed
              ? 'border-transparent opacity-35 cursor-not-allowed'
              : 'border-transparent hover:bg-accent/80 hover:border-border/50 active:scale-[0.98]'
        }`}
      >
        <div className={`transition-transform duration-150 ${!isAlreadyUsed && !isActive ? 'group-hover:scale-110' : ''}`}>
          <EmotionalLinkPreview type={lt.id} width={48} height={20} strokeScale={0.8} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className={`text-sm font-medium leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>{lt.label}</span>
          <span className="text-[11px] text-muted-foreground leading-tight">{lt.description}</span>
        </div>
        {isActive && (
          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-primary-foreground" />
          </span>
        )}
        {isAlreadyUsed && (
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">Déjà utilisé</span>
        )}
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative bg-card border border-border rounded-2xl shadow-modal p-5 w-[380px] max-h-[80vh] flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0 px-1">
              <div className="flex flex-col">
                <h3 className="font-semibold text-foreground text-base">
                  {isEditing ? 'Modifier le lien' : 'Type de lien émotionnel'}
                </h3>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  {isEditing ? 'Changez le type ou supprimez le lien' : 'Choisissez le type de relation'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors active:scale-90"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Scrollable list */}
            <div
              data-scroll-lock="modal-scroll"
              className="flex flex-col gap-0.5 overflow-y-auto min-h-0 px-1 py-1 overscroll-contain"
            >
              {/* Relational category */}
              <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                <Heart className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Relationnels</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              {relationalLinks.map(renderItem)}

              {/* Separator */}
              <div className="my-2" />

              {/* Abusive category */}
              <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive/60" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Violences</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              {abusiveLinks.map(renderItem)}
            </div>

            {/* Delete button */}
            {isEditing && onDelete && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={onDelete}
                className="flex items-center justify-center gap-2 w-full mt-3 h-10 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all active:scale-[0.97] shrink-0 border border-destructive/20"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer ce lien
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkTypeModal;
