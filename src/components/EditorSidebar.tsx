import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Crosshair, Eye, EyeOff, Pencil, Plus, Zap } from 'lucide-react';
import AddPathologyModal from '@/components/AddPathologyModal';
import {
  FamilyMember, Union, EmotionalLink,
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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
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
      title={t.common.rename}
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
  const { t } = useLanguage();
  const [addPathologyModalOpen, setAddPathologyModalOpen] = useState(false);

  const unionStatusCounts = new Map<UnionStatus, number>();
  for (const u of unions) {
    unionStatusCounts.set(u.status, (unionStatusCounts.get(u.status) ?? 0) + 1);
  }

  const emotionalTypeCounts = new Map<EmotionalLinkType, number>();
  for (const el of emotionalLinks) {
    emotionalTypeCounts.set(el.type, (emotionalTypeCounts.get(el.type) ?? 0) + 1);
  }

  const familyLinkLabels: Record<string, string> = {
    married: t.familyLinks.married,
    common_law: t.familyLinks.common_law,
    separated: t.familyLinks.separated,
    divorced: t.familyLinks.divorced,
    widowed: t.familyLinks.widowed,
    love_affair: t.familyLinks.love_affair,
  };

  const emotionalLinkLabels: Record<string, string> = {
    fusional: t.emotionalLinkTypes.fusional,
    distant: t.emotionalLinkTypes.distant,
    conflictual: t.emotionalLinkTypes.conflictual,
    ambivalent: t.emotionalLinkTypes.ambivalent,
    cutoff: t.emotionalLinkTypes.cutoff,
    violence: t.emotionalLinkTypes.violence,
    emotional_abuse: t.emotionalLinkTypes.emotional_abuse,
    physical_violence: t.emotionalLinkTypes.physical_violence,
    sexual_abuse: t.emotionalLinkTypes.sexual_abuse,
    neglect: t.emotionalLinkTypes.neglect,
    controlling: t.emotionalLinkTypes.controlling,
  };

  // Use genogram.ts FAMILY_LINK_TYPES/EMOTIONAL_LINK_TYPES for structure but override labels
  const FAMILY_LINK_IDS: { id: UnionStatus; hasIcon: boolean }[] = [
    { id: 'married', hasIcon: false },
    { id: 'common_law', hasIcon: true },
    { id: 'separated', hasIcon: true },
    { id: 'divorced', hasIcon: true },
    { id: 'widowed', hasIcon: true },
    { id: 'love_affair', hasIcon: true },
  ];

  const EMOTIONAL_LINK_IDS: EmotionalLinkType[] = [
    'fusional', 'distant', 'conflictual', 'ambivalent', 'cutoff',
    'violence', 'emotional_abuse', 'physical_violence', 'sexual_abuse', 'neglect', 'controlling',
  ];

  return (
    <div className="w-[260px] bg-card border-r border-border h-full overflow-y-auto shrink-0" data-onboarding="sidebar">
      <div className="px-4 py-4 border-b border-border">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </button>
        <EditableFileName value={fileName} onChange={onFileNameChange} />
      </div>

      <Accordion type="multiple" defaultValue={['members', 'pathologies', 'trauma', 'family-links', 'emotional-links']}>

        <AccordionItem value="members" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            {t.editor.members} ({members.filter(m => !m.perinatalType).length})
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-0.5">
              {[...members].filter(m => !m.perinatalType).sort((a, b) => a.firstName.localeCompare(b.firstName)).map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between group py-1.5 text-sm text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent/30 px-1.5 -mx-1.5"
                >
                  <span className="truncate">{m.firstName || m.lastName ? `${m.firstName || '?'} ${m.lastName}`.trim() : '?'}</span>
                  <button
                    onClick={() => onFocusMember(m)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-primary"
                    title={t.editor.centerOnMember}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="family-links" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            {t.editor.familyLinks}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-1">
              {FAMILY_LINK_IDS.map(link => (
                <div
                  key={link.id}
                  className="flex items-center gap-2.5 text-sm py-1.5 px-1.5 -mx-1.5 rounded-md text-foreground/80"
                >
                  <div className="w-7 h-7 rounded-full bg-card border border-border/60 flex items-center justify-center shrink-0 shadow-sm">
                    {link.hasIcon ? (
                      <StatusIcon status={link.id} size={16} />
                    ) : (
                      <svg width={16} height={16} viewBox="0 0 16 16">
                        <line x1={2} y1={8} x2={14} y2={8} stroke="hsl(var(--foreground))" strokeWidth={2} />
                      </svg>
                    )}
                  </div>
                  <span className="flex-1">{familyLinkLabels[link.id]}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pathologies" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            <span className="flex-1 text-left">{t.editor.pathologies}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTogglePathologiesVisible(); }}
              className={`p-1 rounded-md transition-colors mr-1 ${
                pathologiesVisible
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-muted-foreground/40 hover:text-muted-foreground'
              }`}
              title={pathologiesVisible ? t.editor.hidePathologies : t.editor.showPathologies}
            >
              {pathologiesVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-2">
              {dynamicPathologies.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 text-sm">
                  <div className="w-4 h-4 rounded-[4px] shrink-0" style={{ backgroundColor: p.color_hex }} />
                  <span className="text-foreground/80">{t.pathologyNames[p.name] ?? p.name}</span>
                </div>
              ))}
              {dynamicPathologies.length === 0 && (
                <p className="text-xs text-muted-foreground italic">{t.editor.noPathologyCreated}</p>
              )}
              <button
                type="button"
                onClick={() => setAddPathologyModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 mt-2 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.editor.addPathology}
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

        {members.some(m => m.hasTrauma) && (
          <AccordionItem value="trauma" className="border-b border-border">
            <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
              <span className="flex-1 text-left flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: '#E24B4A', fill: '#E24B4A' }} strokeWidth={1.5} />
                Événements traumatogènes
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <TraumaLegendList members={members} />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="emotional-links" className="border-b border-border">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 hover:no-underline">
            <span className="flex-1 text-left">{t.editor.emotionalLinks}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleEmotionalLinksVisible(); }}
              className={`p-1 rounded-md transition-colors mr-1 ${
                emotionalLinksVisible
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-muted-foreground/40 hover:text-muted-foreground'
              }`}
              title={emotionalLinksVisible ? t.editor.hideEmotionalLinks : t.editor.showEmotionalLinks}
            >
              {emotionalLinksVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-1.5">
              {EMOTIONAL_LINK_IDS.map(id => {
                const count = emotionalTypeCounts.get(id) ?? 0;
                const isSolo = soloEmotionalType === id;
                return (
                  <div
                    key={id}
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
                        {emotionalLinkLabels[id]}
                      </span>
                      <EmotionalLinkPreview type={id} width={60} height={16} strokeScale={0.65} />
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
