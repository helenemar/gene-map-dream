import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { User, Users, Baby, Heart, CircleSlash, Slash, X } from 'lucide-react';

export type RelationshipChoice =
  | 'parent'
  | 'sibling'
  | 'child'
  | 'spouse_married'
  | 'spouse_divorced'
  | 'spouse_separated'
  | 'spouse_widowed';

const RELATIONSHIP_OPTIONS: { id: RelationshipChoice; label: string; icon: React.ReactNode }[] = [
  { id: 'parent', label: 'Parent', icon: <User className="w-4 h-4" /> },
  { id: 'sibling', label: 'Frère / Sœur', icon: <Users className="w-4 h-4" /> },
  { id: 'child', label: 'Enfant', icon: <Baby className="w-4 h-4" /> },
  { id: 'spouse_married', label: 'Conjoint (Mariage)', icon: <Heart className="w-4 h-4" /> },
  { id: 'spouse_divorced', label: 'Conjoint (Divorce)', icon: <CircleSlash className="w-4 h-4" /> },
  { id: 'spouse_separated', label: 'Conjoint (Séparation)', icon: <Slash className="w-4 h-4" /> },
  { id: 'spouse_widowed', label: 'Veuf(ve)', icon: <X className="w-4 h-4" /> },
];

/** Map of choice → tooltip reason for disabled items */
export type DisabledOptions = Partial<Record<RelationshipChoice, string>>;

interface CreateMemberDropdownProps {
  onSelect: (choice: RelationshipChoice) => void;
  children: React.ReactNode;
  disabledOptions?: DisabledOptions;
}

const CreateMemberDropdown: React.FC<CreateMemberDropdownProps> = ({ onSelect, children, disabledOptions }) => {
  return (
    <TooltipProvider delayDuration={200}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="center" sideOffset={4} className="w-56">
          {RELATIONSHIP_OPTIONS.map((opt) => {
            const disabledReason = disabledOptions?.[opt.id];
            const isDisabled = !!disabledReason;

            if (isDisabled) {
              return (
                <Tooltip key={opt.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center gap-2.5 py-2 px-2 cursor-not-allowed opacity-40 select-none rounded-sm"
                    >
                      <span className="text-muted-foreground">{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[200px] text-xs">
                    {disabledReason}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className="flex items-center gap-2.5 py-2 cursor-pointer"
              >
                <span className="text-muted-foreground">{opt.icon}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default CreateMemberDropdown;
