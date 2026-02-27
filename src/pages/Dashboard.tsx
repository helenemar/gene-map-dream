import React, { useState, useMemo } from 'react';
import gogyIcon from '@/assets/genogy-icon.svg';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, Settings, MoreVertical, ArrowUpDown, Atom, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface GenogramRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: genograms, isLoading, refetch } = useQuery({
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
    if (!searchQuery.trim()) return genograms;
    const q = searchQuery.toLowerCase();
    return genograms.filter((f) => f.name.toLowerCase().includes(q));
  }, [searchQuery, genograms]);

  const handleCreate = async () => {
    if (!user || creating) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('genograms')
        .insert({ user_id: user.id, name: 'Sans titre', data: { members: [], unions: [], emotionalLinks: [] } })
        .select('id')
        .single();
      if (error) throw error;
      navigate(`/editor/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Nav ── */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
          <span className="text-base font-semibold text-foreground">Genogy</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="beta" size="sm">
            <Atom className="w-3.5 h-3.5" />
            BETA Test
          </Button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="w-4.5 h-4.5 text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <Settings className="w-4.5 h-4.5 text-foreground" />
          </button>
          <button
            onClick={() => signOut()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center cursor-pointer">
            <span className="text-card text-xs font-semibold">{userInitials}</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero / CTA Section */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Créer un nouveau génogramme</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Commencez à construire l'arbre familial de votre patient.
          </p>
          <Button onClick={handleCreate} disabled={creating} className="gap-2 rounded-full px-6">
            <Plus className="w-4 h-4" />
            {creating ? 'Création…' : 'Créer à partir d\'un nouveau membre'}
          </Button>
        </div>

        {/* Files Section */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-base font-bold text-foreground">
              Mes génogrammes {genograms ? `(${filteredFiles.length})` : ''}
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher"
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24 hidden sm:block" />
                  <Skeleton className="h-5 w-24 hidden md:block" />
                </div>
              ))}
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-transparent">
                    <TableHead>
                      <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Nom <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Dernière modification <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Date de création <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow
                      key={file.id}
                      onClick={() => navigate(`/editor/${file.id}`)}
                      className="cursor-pointer group"
                    >
                      <TableCell>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {file.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-foreground">{formatDate(file.updated_at)}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-foreground">{formatDate(file.created_at)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : genograms && genograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Plus className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Aucun génogramme</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez votre premier génogramme pour commencer.
              </p>
              <Button onClick={handleCreate} disabled={creating} className="gap-2 rounded-full">
                <Plus className="w-4 h-4" />
                Créer un génogramme
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
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
