import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Copy, Check, Link2, Eye, Pencil, Trash2, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

type AccessLevel = 'reader' | 'editor';

interface Share {
  id: string;
  share_token: string;
  access_level: AccessLevel;
  shared_with_email: string | null;
  is_active: boolean;
  created_at: string;
}

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genogramId: string;
  genogramName: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, genogramId, genogramName }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkAccess, setLinkAccess] = useState<AccessLevel>('reader');

  const fetchShares = async () => {
    const { data } = await supabase
      .from('genogram_shares')
      .select('*')
      .eq('genogram_id', genogramId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setShares(data as unknown as Share[]);
  };

  useEffect(() => {
    if (open && genogramId) fetchShares();
  }, [open, genogramId]);

  const linkShares = shares.filter(s => !s.shared_with_email);

  const createLinkShare = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('genogram_shares')
      .insert({
        genogram_id: genogramId,
        access_level: linkAccess,
        created_by: user.id,
      } as any);
    if (error) {
      toast.error(t.shareModal.linkError);
    } else {
      toast.success(t.shareModal.linkCreated);
      await fetchShares();
    }
    setLoading(false);
  };


  const deleteShare = async (shareId: string) => {
    await supabase
      .from('genogram_shares')
      .update({ is_active: false } as any)
      .eq('id', shareId);
    await fetchShares();
    toast.success(t.shareModal.shareDeleted);
  };

  const copyLink = (token: string, shareId: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    toast.success(t.shareModal.linkCopied);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const AccessBadge: React.FC<{ level: AccessLevel }> = ({ level }) => (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
      level === 'editor'
        ? 'bg-primary/10 text-primary'
        : 'bg-muted text-muted-foreground'
    }`}>
      {level === 'editor' ? <Pencil className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
      {level === 'editor' ? t.shareModal.editorAccess : t.shareModal.reader}
    </span>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 border-none [&>button]:hidden">
        <div className="relative flex flex-col px-5 py-6 sm:px-8 sm:py-8">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>

          <h2 className="text-lg font-semibold text-foreground mb-1">{t.shareModal.title}</h2>
          <p className="text-sm text-muted-foreground mb-6">« {genogramName} »</p>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{t.shareModal.linkSharing}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 bg-muted rounded-full p-0.5 flex-1">
                <button
                  onClick={() => setLinkAccess('reader')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    linkAccess === 'reader' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Eye className="w-3 h-3" /> {t.shareModal.reader}
                </button>
                <button
                  onClick={() => setLinkAccess('editor')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    linkAccess === 'editor' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Pencil className="w-3 h-3" /> {t.shareModal.editorAccess}
                </button>
              </div>
              <Button size="sm" onClick={createLinkShare} disabled={loading} className="rounded-full gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                {t.shareModal.generate}
              </Button>
            </div>

            {linkShares.length > 0 && (
              <div className="space-y-2">
                {linkShares.map(share => (
                  <div key={share.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                      .../shared/{share.share_token.slice(0, 12)}...
                    </span>
                    <AccessBadge level={share.access_level as AccessLevel} />
                    <button
                      onClick={() => copyLink(share.share_token, share.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      {copiedId === share.id
                        ? <Check className="w-3.5 h-3.5 text-green-600" />
                        : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      }
                    </button>
                    <button
                      onClick={() => deleteShare(share.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
