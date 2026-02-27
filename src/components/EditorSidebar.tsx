import React from 'react';
import { ArrowLeft, Crosshair, Eye, EyeOff } from 'lucide-react';
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
import { FamilyLinkPreview } from '@/components/FamilyLinkLines';

interface EditorSidebarProps {
  members: FamilyMember[];
  unions: Union[];
  emotionalLinks: EmotionalLink[];
  fileName: string;
  /** Center canvas on a member */
  onFocusMember: (member: FamilyMember) => void;
  /** Hover a union status to highlight matching links on canvas */
  highlightedUnionStatus: UnionStatus | null;
  onHighlightUnionStatus: (status: UnionStatus | null) => void;
  /** Solo emotional link type — only show this type when active */
  soloEmotionalType: EmotionalLinkType | null;
  onToggleSoloEmotional: (type: EmotionalLinkType) => void;
}

/* ─── Family Link Status Icons (inline SVG for sidebar legend) ─── */
const FamilyLinkIcon: React.FC<{ status: UnionStatus }> = ({ status }) => {
  const s = 16;
  const half = s / 2;
  const stroke = 'currentColor';
  const sw = 1.8;

  switch (status) {
    case 'married':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="text-foreground/70">
          <line x1={2} y1={half} x2={s - 2} y2={half} stroke={stroke} strokeWidth={2} />
        </svg>
      );
    case 'common_law':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="text-foreground/70">
          <line x1={2} y1={half} x2={s - 2} y2={half} stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" />
        </svg>
      );
    case 'divorced':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="text-foreground/70">
          <line x1={half - 3} y1={half + 4} x2={half + 1} y2={half - 4} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <line x1={half - 1} y1={half + 4} x2={half + 3} y2={half - 4} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'separated':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="text-foreground/70">
          <line x1={half + 3} y1={half - 4} x2={half - 3} y2={half + 4} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'widowed':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="text-foreground/70">
          <line x1={half - 3} y1={half - 3} x2={half + 3} y2={half + 3} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <line x1={half + 3} y1={half - 3} x2={half - 3} y2={half + 3} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'love_affair':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="text-foreground/70">
          <path
            d={`M ${half} ${half + 3} C ${half - 1} ${half + 1}, ${half - 4} ${half - 2}, ${half - 3} ${half - 3} C ${half - 2} ${half - 5}, ${half} ${half - 5}, ${half} ${half - 2} C ${half} ${half - 5}, ${half + 2} ${half - 5}, ${half + 3} ${half - 3} C ${half + 4} ${half - 2}, ${half + 1} ${half + 1}, ${half} ${half + 3} Z`}
            fill="none" stroke={stroke} strokeWidth={1.2} strokeDasharray="2 1.5" strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  members, unions, emotionalLinks, fileName,
  onFocusMember,
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
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
        <h2 className="font-semibold text-foreground">{fileName}</h2>
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
                const count = unionStatusCounts.get(link.id) ?? 0;
                const isHighlighted = highlightedUnionStatus === link.id;
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-2.5 text-sm py-1.5 px-1.5 -mx-1.5 rounded-md text-foreground/80"
                  >
                    <div className="w-5 flex items-center justify-center shrink-0">
                      <FamilyLinkIcon status={link.id} />
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
