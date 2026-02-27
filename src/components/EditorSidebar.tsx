import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Crosshair, Eye, EyeOff, Pencil } from 'lucide-react';
import {
  FamilyMember, Union, EmotionalLink,
  PATHOLOGIES, FAMILY_LINK_TYPES, EMOTIONAL_LINK_TYPES,
  UnionStatus, EmotionalLinkType,
} from '@/types/genogram';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EmotionalLinkPreview } from '@/components/EmotionalLinkLine';
import { StatusIcon } from '@/components/UnionBadge';

interface EditorSidebarProps {
  members: FamilyMember[];
  unions: Union[];
  emotionalLinks: EmotionalLink[];
  fileName: string;
  onFileNameChange: (name: string) => void;
  /** Center canvas on a member */
  onFocusMember: (member: FamilyMember) => void;
  /** Called when user clicks "Retour" */
  onBack: () => void;
  /** Hover a union status to highlight matching links on canvas */
  highlightedUnionStatus: UnionStatus | null;
  onHighlightUnionStatus: (status: UnionStatus | null) => void;
  /** Solo emotional link type — only show this type when active */
  soloEmotionalType: EmotionalLinkType | null;
  onToggleSoloEmotional: (type: EmotionalLinkType) => void;
}

/** Inline editable file name */
const EditableFileName: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    onChange(trimmed || value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className="font-semibold text-foreground bg-muted/50 border border-border rounded-lg px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        autoFocus
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-2 w-full text-left"
      title="Renommer"
    >
      <h2 className="font-semibold text-foreground truncate">{value}</h2>
      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
};

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  members, unions, emotionalLinks, fileName, onFileNameChange,
  onFocusMember, onBack,
  highlightedUnionStatus, onHighlightUnionStatus,
  soloEmotionalType, onToggleSoloEmotional,
}) => {
  // Count unions by status
  const unionStatusCounts = new Map<UnionStatus, number>();
  for (const u of unions) {
    unionStatusCounts.set(u.status, (unionStatusCounts.get(u.status) ?? 0) + 1);
  }

  // Count emotional links by type
  const emotionalTypeCounts = new Map<EmotionalLinkType, number>();
  for (const el of emotionalLinks) {
    emotionalTypeCounts.set(el.type, (emotionalTypeCounts.get(el.type) ?? 0) + 1);
  }

  return (
    <div className="w-[260px] bg-card border-r border-border h-full overflow-y-auto shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
        <EditableFileName value={fileName} onChange={onFileNameChange} />
      </div>

      <Accordion type="multiple" defaultValue={['members', 'pathologies', 'family-links', 'emotional-links']}>

        {/* ═══ 1. MEMBRES ═══ */}
        <AccordionItem value="members" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            Membres ({members.length})
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-0.5">
              {[...members].sort((a, b) => a.firstName.localeCompare(b.firstName, 'fr')).map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between group py-1.5 text-sm text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent/30 px-1.5 -mx-1.5"
                >
                  <span className="truncate">{m.firstName} {m.lastName}</span>
                  <button
                    onClick={() => onFocusMember(m)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-primary"
                    title="Centrer sur ce membre"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══ 2. PATHOLOGIES ═══ */}
        <AccordionItem value="pathologies" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            Pathologies
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-2">
              {PATHOLOGIES.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 text-sm">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(var(--pathology-${p.id}))` }}
                  />
                  <span className="text-foreground/80">{p.name}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══ 3. LIENS FAMILIAUX (Highlight on hover) ═══ */}
        <AccordionItem value="family-links" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            Liens familiaux
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-1">
              {FAMILY_LINK_TYPES.map(link => {
                const hasIcon = ['divorced', 'separated', 'widowed', 'love_affair', 'common_law'].includes(link.id);
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-2.5 text-sm py-1.5 px-1.5 -mx-1.5 rounded-md text-foreground/80"
                  >
                    <div className="w-7 h-7 rounded-full bg-card border border-border/60 flex items-center justify-center shrink-0 shadow-sm">
                      {hasIcon ? (
                        <StatusIcon status={link.id} size={16} />
                      ) : (
                        <svg width={16} height={16} viewBox="0 0 16 16">
                          <line x1={2} y1={8} x2={14} y2={8} stroke="hsl(var(--foreground))" strokeWidth={2} />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1">{link.label}</span>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══ 4. LIENS ÉMOTIONNELS (Solo toggle) ═══ */}
        <AccordionItem value="emotional-links" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            Liens émotionnels
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-1.5">
              {EMOTIONAL_LINK_TYPES.map(link => {
                const count = emotionalTypeCounts.get(link.id) ?? 0;
                const isSolo = soloEmotionalType === link.id;
                return (
                  <div
                    key={link.id}
                    className={`flex items-center gap-2 text-sm py-1.5 px-1.5 -mx-1.5 rounded-md transition-all ${
                      isSolo
                        ? 'bg-primary/10 ring-1 ring-primary/20'
                        : soloEmotionalType
                          ? 'opacity-40'
                          : ''
                    }`}
                  >
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-foreground/80 ${isSolo ? 'text-primary font-medium' : ''}`}>
                        {link.label}
                      </span>
                      <EmotionalLinkPreview type={link.id} width={60} height={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
};

export default EditorSidebar;
