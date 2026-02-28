import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { User, Users, Baby, Heart, CircleSlash, Slash, X, UserPlus, HeartHandshake } from 'lucide-react';

export type RelationshipChoice =
  | 'parent'
  | 'parent_bio'
  | 'parent_adoptive'
  | 'sibling'
  | 'child'
  | 'spouse_married'
  | 'spouse_divorced'
  | 'spouse_separated'
  | 'spouse_widowed';

interface RelOptionDef {
  id: RelationshipChoice;
  label: string;
  icon: React.ReactNode;
  group?: 'parent_sub';
}

const BASE_OPTIONS: RelOptionDef[] = [
  { id: 'parent', label: 'Parent', icon: <User className="w-4 h-4" /> },
  { id: 'sibling', label: 'Frère / Sœur', icon: <Users className="w-4 h-4" /> },
  { id: 'child', label: 'Enfant', icon: <Baby className="w-4 h-4" /> },
  { id: 'spouse_married', label: 'Conjoint (Mariage)', icon: <Heart className="w-4 h-4" /> },
  { id: 'spouse_divorced', label: 'Conjoint (Divorce)', icon: <CircleSlash className="w-4 h-4" /> },
  { id: 'spouse_separated', label: 'Conjoint (Séparation)', icon: <Slash className="w-4 h-4" /> },
  { id: 'spouse_widowed', label: 'Veuf(ve)', icon: <X className="w-4 h-4" /> },
];

const PARENT_SUB_OPTIONS: RelOptionDef[] = [
  { id: 'parent_bio', label: 'Parents biologiques', icon: <UserPlus className="w-4 h-4" />, group: 'parent_sub' },
  { id: 'parent_adoptive', label: 'Parents adoptifs', icon: <HeartHandshake className="w-4 h-4" />, group: 'parent_sub' },
];

/** Map of choice → tooltip reason for disabled items */
export type DisabledOptions = Partial<Record<RelationshipChoice, string>>;

interface CreateMemberDropdownProps {
  onSelect: (choice: RelationshipChoice) => void;
  children: React.ReactNode;
  disabledOptions?: DisabledOptions;
  /** Show split parent options (bio/adoptive) instead of single "Parent" */
  showParentSplit?: boolean;
}

const CreateMemberDropdown: React.FC<CreateMemberDropdownProps> = ({
  onSelect,
  children,
  disabledOptions,
  showParentSplit = false,
}) => {
  // Build option list: replace 'parent' with sub-options when split is active
  const options: RelOptionDef[] = showParentSplit
    ? [...PARENT_SUB_OPTIONS, ...BASE_OPTIONS.filter(o => o.id !== 'parent')]
    : BASE_OPTIONS;

  const renderItem = (opt: RelOptionDef) => {
    const disabledReason = disabledOptions?.[opt.id];
    const isDisabled = !!disabledReason;

    if (isDisabled) {
      return (
        <Tooltip key={opt.id}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2.5 py-2 px-2 cursor-not-allowed opacity-40 select-none rounded-sm">
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
  };

  return (
    <TooltipProvider delayDuration={200}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="center" sideOffset={4} className="w-56">
          {showParentSplit && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                Ajouter des parents
              </DropdownMenuLabel>
              {PARENT_SUB_OPTIONS.map(renderItem)}
              <DropdownMenuSeparator />
            </>
          )}
          {BASE_OPTIONS.filter(o => showParentSplit ? o.id !== 'parent' : true).map(renderItem)}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default CreateMemberDropdown;
