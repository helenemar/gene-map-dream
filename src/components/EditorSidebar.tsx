import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Crosshair, Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import AddPathologyModal from '@/components/AddPathologyModal';
import {
  FamilyMember, Union, EmotionalLink,
  FAMILY_LINK_TYPES, EMOTIONAL_LINK_TYPES,
  UnionStatus, EmotionalLinkType,
} from '@/types/genogram';
import type { DynamicPathology } from '@/hooks/usePathologies';
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
  onFocusMember: (member: FamilyMember) => void;
  onBack: () => void;
  highlightedUnionStatus: UnionStatus | null;
  onHighlightUnionStatus: (status: UnionStatus | null) => void;
  soloEmotionalType: EmotionalLinkType | null;
  onToggleSoloEmotional: (type: EmotionalLinkType) => void;
  emotionalLinksVisible: boolean;
  onToggleEmotionalLinksVisible: () => void;
  pathologiesVisible: boolean;
  onTogglePathologiesVisible: () => void;
  dynamicPathologies?: DynamicPathology[];
  onAddPathology?: (name: string, colorHex: string) => Promise<{ data: any; error: any } | undefined>;
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
  emotionalLinksVisible, onToggleEmotionalLinksVisible,
  pathologiesVisible, onTogglePathologiesVisible,
  dynamicPathologies = [], onAddPathology,
}) => {
  const [addPathologyModalOpen, setAddPathologyModalOpen] = useState(false);
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
            Membres ({members.filter(m => !m.perinatalType).length})
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-0.5">
              {[...members].filter(m => !m.perinatalType).sort((a, b) => a.firstName.localeCompare(b.firstName, 'fr')).map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between group py-1.5 text-sm text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent/30 px-1.5 -mx-1.5"
                >
                  <span className="truncate">{m.firstName || m.lastName ? `${m.firstName || '?'} ${m.lastName}`.trim() : '?'}</span>
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

        {/* ═══ 2. LIENS FAMILIAUX ═══ */}
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

        {/* ═══ 3. PATHOLOGIES ═══ */}
        <AccordionItem value="pathologies" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            <span className="flex-1 text-left">Pathologies</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTogglePathologiesVisible(); }}
              className={`p-1 rounded-md transition-colors mr-1 ${
                pathologiesVisible
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-muted-foreground/40 hover:text-muted-foreground'
              }`}
              title={pathologiesVisible ? 'Masquer les pathologies' : 'Afficher les pathologies'}
            >
              {pathologiesVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-2">
              {dynamicPathologies.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 text-sm">
                  <div
                    className="w-4 h-4 rounded-[4px] shrink-0"
                    style={{ backgroundColor: p.color_hex }}
                  />
                  <span className="text-foreground/80">{p.name}</span>
                </div>
              ))}
              {dynamicPathologies.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Aucune pathologie créée</p>
              )}
              <button
                type="button"
                onClick={() => setAddPathologyModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 mt-2 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter une pathologie
              </button>
              <AddPathologyModal
                open={addPathologyModalOpen}
                onClose={() => setAddPathologyModalOpen(false)}
                onAdd={async (name, colorHex) => {
                  await onAddPathology?.(name, colorHex);
                }}
                usedColors={dynamicPathologies.map(p => p.color_hex)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══ 4. LIENS ÉMOTIONNELS (Solo toggle + visibility) ═══ */}
        <AccordionItem value="emotional-links" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            <span className="flex-1 text-left">Liens émotionnels</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleEmotionalLinksVisible(); }}
              className={`p-1 rounded-md transition-colors mr-1 ${
                emotionalLinksVisible
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-muted-foreground/40 hover:text-muted-foreground'
              }`}
              title={emotionalLinksVisible ? 'Masquer les liens émotionnels' : 'Afficher les liens émotionnels'}
            >
              {emotionalLinksVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
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
