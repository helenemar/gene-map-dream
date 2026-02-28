import React, { useState, useMemo } from 'react';
import gogyIcon from '@/assets/genogy-icon.svg';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, Settings, MoreVertical, ArrowUpDown, Atom, ChevronDown } from 'lucide-react';
import GenogramThumbnail from '@/components/GenogramThumbnail';
import CreateGenogramModal from '@/components/CreateGenogramModal';
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [searchQuery, setSearchQuery] = useState('');

  const [sortKey, setSortKey] = useState<SortKey>('updated_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: genograms, isLoading } = useQuery({
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

  const filteredFiles = useMemo(() => {
    if (!genograms) return [];
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

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer ce génogramme ?')) return;
    const { error } = await supabase.from('genograms').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Génogramme supprimé');
      queryClient.invalidateQueries({ queryKey: ['genograms'] });
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const displayName = user?.user_metadata?.full_name || user?.email || '';
  const userInitials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Nav ── */}
      <header className="h-[64px] bg-card border-b border-border flex items-center justify-between px-8">
        <div className="flex items-center gap-2.5">
          <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
          <span className="text-[15px] font-semibold text-foreground tracking-tight">Genogy</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="beta" size="sm" className="h-9 px-4 text-xs font-bold">
            <Atom className="w-3.5 h-3.5" />
            BETA Test
          </Button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="w-[18px] h-[18px] text-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <Settings className="w-[18px] h-[18px] text-foreground" />
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
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="px-8 py-8">
        {/* Hero / CTA Section */}
        <div className="dot-grid border border-border rounded-xl px-10 py-9 mb-6">
          <h1 className="text-[26px] font-bold text-foreground leading-tight mb-1.5">
            Créer un nouveau génogramme
          </h1>
          <p className="text-[14px] text-muted-foreground mb-7 max-w-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.
          </p>
          <Button onClick={handleCreate} className="gap-2 px-6 h-11 text-[14px] font-semibold">
            <Plus className="w-4 h-4" />
            Créer à partir d'un nouveau membre
          </Button>
        </div>

        <CreateGenogramModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

        {/* Files Section */}
        <div className="bg-card border border-border rounded-xl px-8 py-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-[16px] font-bold text-foreground">
              Mes génogrammes {genograms ? `(${filteredFiles.length})` : ''}
            </h2>
            <div className="relative w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher"
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/50"
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
                        Nom <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Créateur
                      </span>
                    </TableHead>
                    <TableHead className="text-right">
                      <button onClick={() => toggleSort('updated_at')} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-auto">
                        Dernière modifications <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-auto">
                        Date de création <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right pr-6">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
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
                          <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                            {file.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <span className="text-primary-foreground text-[10px] font-bold">{userInitials}</span>
                          </div>
                          <span className="text-[13px] text-foreground">
                            {displayName.split('@')[0]}{' '}
                            <span className="text-muted-foreground">(moi)</span>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/editor/${file.id}`); }}>
                                Ouvrir
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleDelete(file.id, e as any)}
                                className="text-destructive focus:text-destructive"
                              >
                                Supprimer
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
          ) : genograms && genograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Plus className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Aucun génogramme</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez votre premier génogramme pour commencer.
              </p>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer un génogramme
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Aucun résultat</h3>
              <p className="text-sm text-muted-foreground">
                Aucun génogramme ne correspond à "{searchQuery}".
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
