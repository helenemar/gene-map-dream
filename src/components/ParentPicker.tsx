import React from 'react';
import { Union, UnionStatus, FamilyMember, FAMILY_LINK_TYPES } from '@/types/genogram';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import MemberIcon from '@/components/MemberIcon';
import { UserPlus, Baby, User } from 'lucide-react';

export interface ParentPickerOption {
  type: 'existing-union';
  union: Union;
  partner: FamilyMember;
}

interface ParentPickerProps {
  sourceMember: FamilyMember;
  unions: Union[];
  members: FamilyMember[];
  onSelectUnion: (unionId: string) => void;
  onSelectNewPartner: () => void;
  onSelectAlone: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
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
  onSelectAlone,
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

        {/* Union options */}
        <div className="flex flex-col py-1">
          {unions.map(union => {
            const partnerId = union.partner1 === sourceMember.id ? union.partner2 : union.partner1;
            const partner = members.find(m => m.id === partnerId);
            if (!partner) return null;

            const partnerName = partner.isPlaceholder
              ? 'Parent inconnu'
              : `${partner.firstName} ${partner.lastName}`;
            const childCount = union.children.length;

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
                    {union.marriageYear && (
                      <span className="text-[10px] text-muted-foreground">· {union.marriageYear}</span>
                    )}
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

          {/* New partner option */}
          <button
            onClick={() => { onSelectNewPartner(); onOpenChange(false); }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left w-full"
          >
            <div className="w-7 h-7 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
              <UserPlus className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Nouveau partenaire</p>
              <p className="text-[10px] text-muted-foreground">Crée un parent inconnu en pointillés</p>
            </div>
          </button>

          {/* Standalone child option */}
          <button
            onClick={() => { onSelectAlone(); onOpenChange(false); }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left w-full"
          >
            <div className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Enfant seul</p>
              <p className="text-[10px] text-muted-foreground">Sans lien d'union, fiche vierge</p>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ParentPicker;
