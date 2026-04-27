import React, { useEffect, useState } from 'react';
import { FamilyMember } from '@/types/genogram';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Waves } from 'lucide-react';

interface ImmigrationNotesDrawerProps {
  member: FamilyMember | null;
  open: boolean;
  onClose: () => void;
  onSave: (memberId: string, notes: string) => void;
  readOnly?: boolean;
}

const ImmigrationNotesDrawer: React.FC<ImmigrationNotesDrawerProps> = ({
  member, open, onClose, onSave, readOnly = false,
}) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (member) setNotes(member.immigrationNotes || '');
  }, [member]);

  if (!member) return null;

  const memberName = `${member.firstName || '?'} ${member.lastName || ''}`.trim();

  const handleSave = () => {
    onSave(member.id, notes.trim());
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[340px] sm:w-[380px] p-0 flex flex-col border-l border-border/50 bg-card"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="px-4 pt-4 pb-3 pr-14">
          <SheetHeader>
            <SheetTitle className="text-sm font-semibold flex items-center gap-2">
              <Waves className="w-4 h-4 text-primary" />
              Immigration
            </SheetTitle>
          </SheetHeader>

          <div className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-xl bg-accent/20 border border-border/50">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{memberName}</p>
              <p className="text-[11px] text-muted-foreground">Notes d'immigration</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-4 p-6 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              className="text-sm border-border/50 bg-card focus-visible:ring-primary/30 min-h-[180px] resize-y"
              placeholder="Pays d'origine, année, motif (économique, politique, familial…), parcours, langue, intégration…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              readOnly={readOnly}
              autoFocus={!readOnly}
            />
            <p className="text-[10px] text-muted-foreground/70 leading-tight mt-1">
              Ces notes sont spécifiques à l'événement d'immigration de ce membre.
            </p>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handleSave} size="sm" className="flex-1">
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Enregistrer
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ImmigrationNotesDrawer;
