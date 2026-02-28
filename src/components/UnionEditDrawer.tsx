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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface UnionEditDrawerProps {
  union: Union | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: Union) => void;
  getMemberName: (id: string) => string;
}

const UnionEditDrawer: React.FC<UnionEditDrawerProps> = ({
  union,
  open,
  onClose,
  onUpdate,
  getMemberName,
}) => {
  if (!union) return null;

  const handleStatusChange = (status: UnionStatus) => {
    onUpdate({ ...union, status });
  };

  const handleMarriageYearChange = (val: string) => {
    const year = val ? parseInt(val, 10) : undefined;
    onUpdate({ ...union, marriageYear: year && !isNaN(year) ? year : undefined });
  };

  const handleDivorceYearChange = (val: string) => {
    const year = val ? parseInt(val, 10) : undefined;
    onUpdate({ ...union, divorceYear: year && !isNaN(year) ? year : undefined });
  };

  const endLabel = (() => {
    switch (union.status) {
      case 'divorced': return 'Année de divorce';
      case 'separated': return 'Année de séparation';
      case 'widowed': return 'Année de veuvage';
      default: return 'Année de fin';
    }
  })();

  const showEndDate = ['divorced', 'separated', 'widowed'].includes(union.status);

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

          {/* Marriage / Rencontre year */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {union.status === 'married' ? 'Année de mariage' : 'Année de rencontre'}
            </Label>
            <Input
              type="number"
              placeholder="ex: 1981"
              className="h-9"
              value={union.marriageYear ?? ''}
              onChange={(e) => handleMarriageYearChange(e.target.value)}
              min={1900}
              max={2100}
            />
          </div>

          {/* End year (contextual) */}
          {showEndDate && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {endLabel}
              </Label>
              <Input
                type="number"
                placeholder="ex: 2018"
                className="h-9"
                value={union.divorceYear ?? ''}
                onChange={(e) => handleDivorceYearChange(e.target.value)}
                min={1900}
                max={2100}
              />
            </div>
          )}

          {/* Adoption toggle */}
          {union.children.length > 0 && (
            <div className="flex items-center gap-2.5 pt-2">
              <Checkbox
                id="union-adoption"
                checked={!!union.isAdoption}
                onCheckedChange={(checked) =>
                  onUpdate({ ...union, isAdoption: checked === true })
                }
              />
              <Label htmlFor="union-adoption" className="text-sm font-normal cursor-pointer">
                Enfant(s) adopté(s)
              </Label>
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
