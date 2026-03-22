import React, { useState, useMemo, useEffect } from 'react';
import gogyIcon from '@/assets/genogy-icon.svg';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, MoreVertical, ArrowUpDown, Atom, ChevronDown, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import GenogramThumbnail from '@/components/GenogramThumbnail';
import CreateGenogramModal from '@/components/CreateGenogramModal';
import BetaShareModal from '@/components/BetaShareModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DossierNotesModal from '@/components/DossierNotesModal';

interface GenogramRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  data: any;
}

type SortKey = 'name' | 'updated_at' | 'created_at';
type SortDir = 'asc' | 'desc';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updated_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const [notesModal, setNotesModal] = useState<{ open: boolean; genogramId: string; genogramName: string }>({ open: false, genogramId: '', genogramName: '' });
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});
  const [latestNoteDates, setLatestNoteDates] = useState<Record<string, string>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const locale = lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-US';

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, display_name')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: realGenograms, isLoading } = useQuery({
    queryKey: ['genograms', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genograms')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as GenogramRow[];
    },
    enabled: !!user,
  });

  const genograms = useMemo(() => realGenograms || [], [realGenograms]);

  useEffect(() => {
    if (!genograms?.length) return;
    const ids = genograms.map(g => g.id);
    if (!ids.length) return;
    supabase
      .from('genogram_notes')
      .select('genogram_id, created_at')
      .in('genogram_id', ids)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        const latest: Record<string, string> = {};
        if (data) {
          for (const row of data as { genogram_id: string; created_at: string }[]) {
            counts[row.genogram_id] = (counts[row.genogram_id] ?? 0) + 1;
            if (!latest[row.genogram_id]) latest[row.genogram_id] = row.created_at;
          }
        }
        setNoteCounts(counts);
        setLatestNoteDates(latest);
      });
  }, [genograms]);

  const filteredFiles = useMemo(() => {
    let list = genograms;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [searchQuery, genograms, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const MAX_GENOGRAMS = 2;

  const handleCreate = () => {
    if (genograms && genograms.length >= MAX_GENOGRAMS) {
      toast.error(t.dashboard.limitReached.replace('{max}', String(MAX_GENOGRAMS)), { duration: 3000 });
      return;
    }
    setCreateModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('genograms').delete().eq('id', deleteTarget.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.dashboard.deleted);
      queryClient.invalidateQueries({ queryKey: ['genograms'] });
    }
    setDeleteTarget(null);
  };

  const handleRename = async (id: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }
    const { error } = await supabase.from('genograms').update({ name: trimmed }).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t.dashboard.renamed);
      queryClient.invalidateQueries({ queryKey: ['genograms'] });
    }
    setRenamingId(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

  const displayName = 'Sophie Marchand';
  const userInitials = 'SM';

  return (
    <div className="min-h-screen bg-card">
      <header className="h-[64px] bg-card border-b border-border flex items-center justify-between px-8">
        <a href="/" className="flex items-center gap-2.5">
          <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
          <span className="text-[15px] font-semibold text-foreground tracking-tight">Genogy</span>
        </a>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 px-2.5 h-9">
                {lang === 'fr' ? (
                  <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden" aria-hidden="true">
                    <rect width="12" height="24" fill="#002395" />
                    <rect x="12" width="12" height="24" fill="#fff" />
                    <rect x="24" width="12" height="24" fill="#ED2939" />
                  </svg>
                ) : lang === 'de' ? (
                  <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden" aria-hidden="true">
                    <rect width="36" height="8" fill="#000" />
                    <rect y="8" width="36" height="8" fill="#DD0000" />
                    <rect y="16" width="36" height="8" fill="#FFCC00" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden" aria-hidden="true">
                    <rect width="36" height="24" fill="#012169" />
                    <path d="M0,0 L36,24 M36,0 L0,24" stroke="#fff" strokeWidth="4" />
                    <path d="M0,0 L36,24 M36,0 L0,24" stroke="#C8102E" strokeWidth="2.5" />
                    <path d="M18,0 V24 M0,12 H36" stroke="#fff" strokeWidth="6" />
                    <path d="M18,0 V24 M0,12 H36" stroke="#C8102E" strokeWidth="3.5" />
                  </svg>
                )}
                <span className="text-xs font-medium">{lang.toUpperCase()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => setLang('fr')} className="gap-2.5 cursor-pointer">
                <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden shrink-0" aria-hidden="true">
                  <rect width="12" height="24" fill="#002395" />
                  <rect x="12" width="12" height="24" fill="#fff" />
                  <rect x="24" width="12" height="24" fill="#ED2939" />
                </svg>
                <span className={lang === 'fr' ? 'font-semibold' : ''}>{t.common.french}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang('en')} className="gap-2.5 cursor-pointer">
                <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden shrink-0" aria-hidden="true">
                  <rect width="36" height="24" fill="#012169" />
                  <path d="M0,0 L36,24 M36,0 L0,24" stroke="#fff" strokeWidth="4" />
                  <path d="M0,0 L36,24 M36,0 L0,24" stroke="#C8102E" strokeWidth="2.5" />
                  <path d="M18,0 V24 M0,12 H36" stroke="#fff" strokeWidth="6" />
                  <path d="M18,0 V24 M0,12 H36" stroke="#C8102E" strokeWidth="3.5" />
                </svg>
                <span className={lang === 'en' ? 'font-semibold' : ''}>{t.common.english}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang('de')} className="gap-2.5 cursor-pointer">
                <svg viewBox="0 0 36 24" className="w-5 h-3.5 rounded-[2px] overflow-hidden shrink-0" aria-hidden="true">
                  <rect width="36" height="8" fill="#000" />
                  <rect y="8" width="36" height="8" fill="#DD0000" />
                  <rect y="16" width="36" height="8" fill="#FFCC00" />
                </svg>
                <span className={lang === 'de' ? 'font-semibold' : ''}>{t.common.german}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="beta" size="sm" className="h-9 px-4 text-xs font-bold" onClick={() => setBetaModalOpen(true)}>
            <Atom className="w-3.5 h-3.5" />
            BETA Test
          </Button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="w-[18px] h-[18px] text-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-10 pl-1 pr-2 rounded-full bg-foreground hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <span className="text-card text-[11px] font-bold tracking-wide">{userInitials}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-card" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate('/account')}>
                {t.dashboard.myAccount}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                {t.dashboard.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="px-6 py-5">
        
        <div className="dot-grid bg-background border border-border rounded-xl px-8 py-5 mb-4">
          <h1 className="text-[26px] font-bold text-foreground leading-tight mb-1.5">
            {t.dashboard.createNew}
          </h1>
          <p className="text-[14px] text-muted-foreground mb-7 max-w-lg">
            {t.dashboard.noFiles}
          </p>
          <Button onClick={handleCreate} className="gap-2 px-6 h-11 text-[14px] font-semibold">
            <Plus className="w-4 h-4" />
            {t.dashboard.createFromMember}
          </Button>
        </div>

        <CreateGenogramModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

        <div className="bg-card border border-border rounded-xl px-6 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-[16px] font-bold text-foreground">
              {t.dashboard.myGenograms} {genograms ? `(${filteredFiles.length})` : ''}
            </h2>
            <div className="relative w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.common.search}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 py-4 px-2">
                  <Skeleton className="h-10 w-16 rounded-lg" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-transparent">
                    <TableHead className="pl-6 w-[280px]">
                      <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {t.dashboard.name} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {t.dashboard.creator}
                      </span>
                    </TableHead>
                    <TableHead className="text-right">
                      <button onClick={() => toggleSort('updated_at')} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-auto">
                        {t.dashboard.lastModified} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-auto">
                        {t.dashboard.createdAt} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right pr-6">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {t.dashboard.actions}
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow
                      key={file.id}
                      onClick={() => navigate(`/editor/${file.id}`)}
                      className="cursor-pointer group h-[60px]"
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <GenogramThumbnail data={file.data || {}} width={56} height={40} />
                          {renamingId === file.id ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => handleRename(file.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(file.id);
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[13px] font-medium text-foreground bg-transparent border border-ring rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-ring w-48"
                            />
                          ) : (
                            <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                              {file.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                            <span className="text-[10px] font-bold text-primary-foreground">{userInitials}</span>
                          </div>
                          <span className="text-[13px] text-foreground">
                            {displayName} <span className="text-muted-foreground">{t.dashboard.me}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[13px] text-foreground">{formatDate(file.updated_at)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[13px] text-foreground">{formatDate(file.created_at)}</span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {(() => {
                            const count = noteCounts[file.id] ?? 0;
                            const latestNote = latestNoteDates[file.id];
                            const hasNew = latestNote && new Date(latestNote) > new Date(file.updated_at);
                            if (count === 0) return null;
                            return (
                              <button
                                onClick={(e) => { e.stopPropagation(); setNotesModal({ open: true, genogramId: file.id, genogramName: file.name }); }}
                                className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                                title={t.dashboard.dossierNotes}
                              >
                                <FileText className={`w-4 h-4 ${hasNew ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                                  hasNew ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted-foreground/20 text-muted-foreground'
                                }`}>
                                  {count}
                                </span>
                              </button>
                            );
                          })()}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/editor/${file.id}`); }}>
                                {t.common.open}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenamingId(file.id); setRenameValue(file.name); }}>
                                {t.common.rename}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: file.id, name: file.name }); }} className="text-destructive focus:text-destructive">
                                {t.common.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : genograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Plus className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t.dashboard.noGenogram}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.dashboard.createFirst}</p>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                {t.dashboard.createGenogram}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t.dashboard.noResults}</h3>
              <p className="text-sm text-muted-foreground">
                {t.dashboard.noResultsFor} “{searchQuery}”.
              </p>
            </div>
          )}
        </div>

        <BetaShareModal open={betaModalOpen} onOpenChange={setBetaModalOpen} />

        <DossierNotesModal
          open={notesModal.open}
          onClose={() => setNotesModal(prev => ({ ...prev, open: false }))}
          genogramId={notesModal.genogramId}
          genogramName={notesModal.genogramName}
        />

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{lang === 'fr' ? 'Supprimer ce génogramme ?' : 'Delete this genogram?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {lang === 'fr'
                  ? <>Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-foreground">{deleteTarget?.name}</span> ? Cette action est irréversible.</>
                  : <>Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.</>}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t.common.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Dashboard;
