import React, { useState } from 'react';
import { Lock, Unlock, ChevronUp, ChevronDown } from 'lucide-react';
import { FamilyMember } from '@/types/genogram';
import { motion, AnimatePresence } from 'framer-motion';

interface LockPanelProps {
  members: FamilyMember[];
  onToggleLock: (id: string) => void;
}

const LockPanel: React.FC<LockPanelProps> = ({ members, onToggleLock }) => {
  const [expanded, setExpanded] = useState(false);
  const nonPerinatalMembers = members.filter(m => !m.perinatalType && !m.isPlaceholder && !m.isDraft);
  const lockedCount = nonPerinatalMembers.filter(m => m.locked).length;

  return (
    <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-xl shadow-float border border-border p-3 max-h-[320px] w-[240px] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-foreground">
                Verrouillage ({lockedCount}/{nonPerinatalMembers.length})
              </span>
              <button
                onClick={() => {
                  const allLocked = nonPerinatalMembers.every(m => m.locked);
                  nonPerinatalMembers.forEach(m => {
                    if (allLocked ? m.locked : !m.locked) {
                      onToggleLock(m.id);
                    }
                  });
                }}
                className="text-[10px] font-medium text-primary hover:underline"
              >
                {nonPerinatalMembers.every(m => m.locked) ? 'Tout déverrouiller' : 'Tout verrouiller'}
              </button>
            </div>
            <div className="space-y-0.5">
              {nonPerinatalMembers
                .sort((a, b) => a.firstName.localeCompare(b.firstName, 'fr'))
                .map(m => (
                  <button
                    key={m.id}
                    onClick={() => onToggleLock(m.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                      m.locked
                        ? 'bg-primary/10 text-primary hover:bg-primary/15'
                        : 'text-foreground/70 hover:bg-accent/50'
                    }`}
                  >
                    {m.locked
                      ? <Lock className="w-3.5 h-3.5 shrink-0" />
                      : <Unlock className="w-3.5 h-3.5 shrink-0 opacity-40" />
                    }
                    <span className="truncate text-left flex-1">
                      {m.firstName} {m.lastName}
                    </span>
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(prev => !prev)}
        className={`h-10 px-4 rounded-full shadow-float border flex items-center gap-2 transition-colors ${
          lockedCount > 0
            ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/15'
            : 'bg-card border-border text-muted-foreground hover:bg-accent'
        }`}
      >
        <Lock className="w-4 h-4" />
        <span className="text-xs font-medium">{lockedCount} verrouillé{lockedCount !== 1 ? 's' : ''}</span>
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5" />
          : <ChevronUp className="w-3.5 h-3.5" />
        }
      </button>
    </div>
  );
};

export default LockPanel;
