import React from 'react';
import { Union, UnionStatus, FAMILY_LINK_TYPES } from '@/types/genogram';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface UnionEditDrawerProps {
  union: Union | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: Union) => void;
  getMemberName: (id: string) => string;
}

/** Helper: get the effective meeting/event/end years, falling back to legacy fields */
function getEffectiveYears(union: Union) {
  return {
    meetingYear: union.meetingYear,
    meetingYearUnsure: union.meetingYearUnsure ?? false,
    eventYear: union.eventYear ?? union.marriageYear,
    eventYearUnsure: union.eventYearUnsure ?? false,
    endYear: union.endYear ?? union.divorceYear,
    endYearUnsure: union.endYearUnsure ?? false,
  };
}

const EVENT_LABELS: Record<UnionStatus, string> = {
  married: 'Année de mariage',
  common_law: 'Année d\'union libre',
  separated: 'Année de séparation',
  divorced: 'Année de divorce',
  widowed: 'Année de veuvage',
  love_affair: 'Année de la liaison',
};

const UnionEditDrawer: React.FC<UnionEditDrawerProps> = ({
  union,
  open,
  onClose,
  onUpdate,
  getMemberName,
}) => {
  if (!union) return null;

  const eff = getEffectiveYears(union);

  const handleStatusChange = (status: UnionStatus) => {
    onUpdate({ ...union, status });
  };

  const handleYearChange = (field: 'meetingYear' | 'eventYear' | 'endYear', val: string) => {
    const year = val ? parseInt(val, 10) : undefined;
    const cleaned = year && !isNaN(year) ? year : undefined;
    // Also clear legacy fields when using new fields
    if (field === 'eventYear') {
      onUpdate({ ...union, eventYear: cleaned, marriageYear: cleaned });
    } else if (field === 'endYear') {
      onUpdate({ ...union, endYear: cleaned, divorceYear: cleaned });
    } else {
      onUpdate({ ...union, [field]: cleaned });
    }
  };

  const toggleUnsure = (field: 'meetingYearUnsure' | 'eventYearUnsure' | 'endYearUnsure') => {
    onUpdate({ ...union, [field]: !union[field] });
  };

  const renderUnsureButton = (field: 'meetingYearUnsure' | 'eventYearUnsure' | 'endYearUnsure', value: boolean) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleUnsure(field); }}
            className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
              value
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border/50 text-muted-foreground/40 hover:text-muted-foreground hover:border-border'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {value ? 'Date marquée incertaine' : 'Marquer comme incertain'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[320px] sm:w-[360px]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-base font-semibold">Modifier l'union</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {getMemberName(union.partner1)} & {getMemberName(union.partner2)}
          </p>
        </SheetHeader>

        <Separator />

        <div className="flex flex-col gap-5 pt-5">
          {/* Status */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Type de relation
            </Label>
            <Select value={union.status} onValueChange={(v) => handleStatusChange(v as UnionStatus)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FAMILY_LINK_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t.icon}</span>
                      <span>{t.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meeting year */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Année de rencontre
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="ex: 1978"
                className="h-9 flex-1"
                value={eff.meetingYear ?? ''}
                onChange={(e) => handleYearChange('meetingYear', e.target.value)}
                min={1900}
                max={2100}
              />
              <UnsureButton field="meetingYearUnsure" value={eff.meetingYearUnsure} />
            </div>
          </div>

          {/* Event year */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {EVENT_LABELS[union.status]}
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="ex: 1981"
                className="h-9 flex-1"
                value={eff.eventYear ?? ''}
                onChange={(e) => handleYearChange('eventYear', e.target.value)}
                min={1900}
                max={2100}
              />
              <UnsureButton field="eventYearUnsure" value={eff.eventYearUnsure} />
            </div>
          </div>

          {/* End year — hidden for statuses where the event year already represents the end */}
          {!['separated', 'divorced', 'widowed'].includes(union.status) && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Année de fin
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  placeholder="ex: 2018"
                  className="h-9 flex-1"
                  value={eff.endYear ?? ''}
                  onChange={(e) => handleYearChange('endYear', e.target.value)}
                  min={1900}
                  max={2100}
                />
                <UnsureButton field="endYearUnsure" value={eff.endYearUnsure} />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-2 pt-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Notes
            </Label>
            <Textarea
              placeholder="Notes sur la relation..."
              className="min-h-[100px] text-sm resize-y"
              value={union.notes ?? ''}
              onChange={(e) => onUpdate({ ...union, notes: e.target.value })}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UnionEditDrawer;
