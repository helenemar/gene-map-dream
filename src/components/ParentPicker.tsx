import React from 'react';
import { Union, UnionStatus, FamilyMember, FAMILY_LINK_TYPES } from '@/types/genogram';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import MemberIcon from '@/components/MemberIcon';
import { Baby, UserPlus } from 'lucide-react';

interface ParentPickerProps {
  sourceMember: FamilyMember;
  unions: Union[];
  members: FamilyMember[];
  onSelectUnion: (unionId: string) => void;
  onSelectNewPartner: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  isPerinatal?: boolean;
}

function getStatusLabel(status: UnionStatus): string {
  return FAMILY_LINK_TYPES.find(t => t.id === status)?.label || status;
}

function getStatusIcon(status: UnionStatus): string {
  return FAMILY_LINK_TYPES.find(t => t.id === status)?.icon || '';
}

const ParentPicker: React.FC<ParentPickerProps> = ({
  sourceMember,
  unions,
  members,
  onSelectUnion,
  onSelectNewPartner,
  open,
  onOpenChange,
  children,
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-72 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-accent/20 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Choisir le couple parent</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            De quelle union est issu cet enfant ?
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col py-1">
          {/* Existing unions */}
          {unions.map(union => {
            const partnerId = union.partner1 === sourceMember.id ? union.partner2 : union.partner1;
            const partner = members.find(m => m.id === partnerId);
            if (!partner) return null;

            const partnerName = partner.isPlaceholder
              ? 'Parent inconnu'
              : `${partner.firstName} ${partner.lastName}`;
            const childCount = union.children.filter(cId => {
              const child = members.find(m => m.id === cId);
              return !child?.perinatalType || child.perinatalType === 'stillborn';
            }).length;

            return (
              <button
                key={union.id}
                onClick={() => { onSelectUnion(union.id); onOpenChange(false); }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left w-full"
              >
                <div className="shrink-0">
                  <MemberIcon
                    gender={partner.gender}
                    isDead={!!partner.deathYear}
                    size={28}
                    className="text-foreground"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{partnerName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {getStatusIcon(union.status)} {getStatusLabel(union.status)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 ml-auto">
                      {childCount} enfant{childCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Separator */}
          <div className="h-px bg-border/50 mx-3 my-1" />

          {/* Autre partenaire — creates a placeholder card */}
          <div className="px-4 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Autre partenaire</p>
          </div>
          <button
            onClick={() => { onSelectNewPartner(); onOpenChange(false); }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left w-full"
          >
            <div className="w-7 h-7 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
              <UserPlus className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Nouveau partenaire</p>
              <p className="text-[10px] text-muted-foreground">Crée une carte membre non éditée</p>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ParentPicker;
