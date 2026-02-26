import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { FamilyMember, PATHOLOGIES, FAMILY_LINK_TYPES, EMOTIONAL_LINK_TYPES } from '@/types/genogram';

interface EditorSidebarProps {
  members: FamilyMember[];
  fileName: string;
}

const Section: React.FC<{ title: string; count?: number; defaultOpen?: boolean; children: React.ReactNode }> = ({
  title, count, defaultOpen = true, children
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 transition-colors"
      >
        <span>{title}{count !== undefined ? ` (${count})` : ''}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
};

const EmotionalLinkIndicator: React.FC<{ type: string }> = ({ type }) => {
  const styles: Record<string, string> = {
    fusional: 'bg-[hsl(var(--link-fusional))] h-[3px] w-full rounded',
    distant: 'border-t-2 border-dashed border-[hsl(var(--link-distant))] w-full',
    conflictual: 'bg-[hsl(var(--link-conflictual))] h-[2px] w-full',
    ambivalent: 'bg-[hsl(var(--link-ambivalent))] h-[3px] w-full',
    negligent: 'bg-[hsl(var(--link-negligent))] h-[2px] w-full',
    coercive: 'bg-[hsl(var(--link-coercive))] h-[2px] w-full rounded',
    cutoff: 'bg-[hsl(var(--link-cutoff))] h-[4px] w-3 mx-0.5',
    violence: 'bg-[hsl(var(--link-violence))] h-[4px] w-3 mx-0.5',
  };

  if (type === 'cutoff' || type === 'violence') {
    return (
      <div className="flex items-center w-16">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles[type]} />
        ))}
      </div>
    );
  }

  return <div className={`w-16 ${styles[type] || ''}`} />;
};

const EditorSidebar: React.FC<EditorSidebarProps> = ({ members, fileName }) => {
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

      {/* Members */}
      <Section title="Membres" count={members.length}>
        <div className="space-y-1">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-2 py-1 text-sm text-foreground/80 hover:text-foreground cursor-pointer transition-colors">
              <span>{m.firstName} {m.lastName}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Pathologies */}
      <Section title="Pathologies" defaultOpen={true}>
        <div className="space-y-2">
          {PATHOLOGIES.map(p => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full bg-${p.color}`} />
              <span className="text-foreground/80">{p.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Family Links */}
      <Section title="Liens familiaux">
        <div className="space-y-2">
          {FAMILY_LINK_TYPES.map(link => (
            <div key={link.id} className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="w-4 text-center">{link.icon}</span>
              <span>{link.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Emotional Links */}
      <Section title="Liens émotionnels">
        <div className="space-y-3">
          {EMOTIONAL_LINK_TYPES.map(link => (
            <div key={link.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground/80">{link.label}</span>
              <EmotionalLinkIndicator type={link.id} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default EditorSidebar;
