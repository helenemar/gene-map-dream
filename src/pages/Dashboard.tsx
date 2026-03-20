import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import gogyIcon from '@/assets/genogy-icon.svg';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, Settings, MoreVertical, ArrowUpDown, Atom, ChevronDown, FileText } from 'lucide-react';
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DossierNotesModal from '@/components/DossierNotesModal';

interface GenogramRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  data: any;
  /** Mock-only fields for fake creators */
  _mockCreator?: { name: string; initials: string; color: string };
}

type SortKey = 'name' | 'updated_at' | 'created_at';
type SortDir = 'asc' | 'desc';

const MOCK_GENOGRAMS: GenogramRow[] = [
  {
    id: 'mock-1', name: 'Lefèvre – Julien', user_id: 'mock',
    created_at: '2025-11-12T09:30:00Z', updated_at: '2026-02-28T14:22:00Z',
    data: {
      members: [
        // Gen 0 — Grands-parents paternels
        { id: 'gp1', firstName: 'Henri', lastName: 'Lefèvre', gender: 'male', x: -200, y: -400, birthYear: 1935, deathYear: 2010, age: 75, profession: '', pathologies: ['cardiovascular', 'diabetes'] },
        { id: 'gp2', firstName: 'Madeleine', lastName: 'Roux', gender: 'female', x: 0, y: -400, birthYear: 1938, age: 88, profession: '', pathologies: ['cancer'] },
        // Gen 0 — Grands-parents maternels
        { id: 'gp3', firstName: 'Robert', lastName: 'Girard', gender: 'male', x: 400, y: -400, birthYear: 1940, deathYear: 2018, age: 78, profession: '', pathologies: ['addiction'] },
        { id: 'gp4', firstName: 'Jeanne', lastName: 'Blanc', gender: 'female', x: 600, y: -400, birthYear: 1942, age: 84, profession: '', pathologies: ['neurodegeneration'] },
        // Gen 1 — Parents + oncles/tantes
        { id: 'p1', firstName: 'Philippe', lastName: 'Lefèvre', gender: 'male', x: -100, y: -200, birthYear: 1962, age: 64, profession: '', pathologies: ['addiction'] },
        { id: 'p2', firstName: 'Nathalie', lastName: 'Girard', gender: 'female', x: 100, y: -200, birthYear: 1965, age: 61, profession: '', pathologies: ['depression'] },
        { id: 'p3', firstName: 'Sylvie', lastName: 'Lefèvre', gender: 'female', x: -350, y: -200, birthYear: 1968, age: 58, profession: '', pathologies: [] },
        { id: 'p4', firstName: 'Marc', lastName: 'Dupont', gender: 'male', x: -500, y: -200, birthYear: 1966, age: 60, profession: '', pathologies: ['cardiovascular'] },
        { id: 'p5', firstName: 'Alain', lastName: 'Girard', gender: 'male', x: 500, y: -200, birthYear: 1970, deathYear: 2022, age: 52, profession: '', pathologies: ['bipolar'] },
        // Gen 2 — Patient + fratrie + cousins
        { id: 'c1', firstName: 'Julien', lastName: 'Lefèvre', gender: 'male', x: 0, y: 0, birthYear: 1990, age: 36, profession: '', pathologies: ['bipolar'] },
        { id: 'c1w', firstName: 'Marie', lastName: 'Perret', gender: 'female', x: 200, y: 0, birthYear: 1992, age: 34, profession: '', pathologies: [] },
        { id: 'c2', firstName: 'Camille', lastName: 'Lefèvre', gender: 'female', x: -100, y: 0, birthYear: 1993, age: 33, profession: '', pathologies: ['depression'], twinGroup: 'tw1', twinType: 'dizygotic' },
        { id: 'c3', firstName: 'Clara', lastName: 'Lefèvre', gender: 'female', x: -250, y: 0, birthYear: 1993, age: 33, profession: '', pathologies: ['psychogenic'], twinGroup: 'tw1', twinType: 'dizygotic' },
        { id: 'c4', firstName: 'Lucas', lastName: 'Dupont', gender: 'male', x: -450, y: 0, birthYear: 1995, age: 31, profession: '', pathologies: [] },
        { id: 'c5', firstName: 'Emma', lastName: 'Dupont', gender: 'female', x: -600, y: 0, birthYear: 1998, age: 28, profession: '', pathologies: ['psychogenic'] },
        // Gen 2 — Interruption spontanée de grossesse
        { id: 'c6', firstName: 'FC', lastName: '', gender: 'female', x: 350, y: 0, birthYear: 1996, age: 0, profession: '', pathologies: [], perinatalType: 'miscarriage' },
        // Gen 3 — Petits-enfants
        { id: 'gc1', firstName: 'Théo', lastName: 'Lefèvre', gender: 'male', x: 50, y: 200, birthYear: 2020, age: 6, profession: '', pathologies: [] },
        { id: 'gc2', firstName: 'Rose', lastName: 'Lefèvre', gender: 'female', x: 200, y: 200, birthYear: 2023, age: 3, profession: '', pathologies: [] },
        { id: 'gc3', firstName: '', lastName: '', gender: 'female', x: 350, y: 200, birthYear: 2026, age: 0, profession: '', pathologies: [], perinatalType: 'pregnancy' },
      ],
      unions: [
        { partner1: 'gp1', partner2: 'gp2', status: 'widowed', children: ['p1', 'p3'] },
        { partner1: 'gp3', partner2: 'gp4', status: 'married', children: ['p2', 'p5'] },
        { partner1: 'p1', partner2: 'p2', status: 'divorced', children: ['c1', 'c2', 'c3', 'c6'] },
        { partner1: 'p4', partner2: 'p3', status: 'married', children: ['c4', 'c5'] },
        { partner1: 'c1', partner2: 'c1w', status: 'married', children: ['gc1', 'gc2', 'gc3'] },
      ],
      emotionalLinks: [
        { id: 'e1', from: 'p1', to: 'c1', type: 'fusional' },
        { id: 'e2', from: 'c2', to: 'c3', type: 'conflictual' },
        { id: 'e3', from: 'gp2', to: 'gc1', type: 'fusional' },
      ],
    },
  },
  {
    id: 'mock-2', name: 'Dupont – Sophie', user_id: 'mock',
    created_at: '2026-01-05T11:00:00Z', updated_at: '2026-02-25T10:45:00Z',
    data: {
      members: [
        { id: 'a1', firstName: 'Sophie', lastName: 'Dupont', gender: 'female', x: 0, y: 0, birthYear: 1985, age: 41, profession: '', pathologies: ['cancer'] },
        { id: 'a2', firstName: 'Marc', lastName: 'Dupont', gender: 'male', x: 200, y: 0, birthYear: 1983, age: 43, profession: '', pathologies: [] },
        { id: 'a3', firstName: 'Clara', lastName: 'Dupont', gender: 'female', x: 100, y: 200, birthYear: 2012, age: 14, profession: '', pathologies: [] },
      ],
      unions: [{ partner1: 'a2', partner2: 'a1' }],
    },
  },
  {
    id: 'mock-3', name: 'Martin – Lucas', user_id: 'mock',
    created_at: '2025-09-20T08:15:00Z', updated_at: '2026-01-10T16:30:00Z',
    data: {
      members: [
        { id: 'b1', firstName: 'Lucas', lastName: 'Martin', gender: 'male', x: 0, y: 0, birthYear: 1978, age: 48, profession: '', pathologies: ['addiction', 'bipolar'] },
        { id: 'b2', firstName: 'Isabelle', lastName: 'Martin', gender: 'female', x: 200, y: 0, birthYear: 1980, age: 46, profession: '', pathologies: ['depression'] },
        { id: 'b3', firstName: 'Pierre', lastName: 'Martin', gender: 'male', x: -100, y: -200, birthYear: 1950, age: 76, profession: '', pathologies: [] },
        { id: 'b4', firstName: 'Jeanne', lastName: 'Blanc', gender: 'female', x: 100, y: -200, birthYear: 1952, age: 74, profession: '', pathologies: ['neurodegeneration'] },
        { id: 'b5', firstName: 'Théo', lastName: 'Martin', gender: 'male', x: 0, y: 200, birthYear: 2005, age: 21, profession: '', pathologies: [] },
        { id: 'b6', firstName: 'Emma', lastName: 'Martin', gender: 'female', x: 200, y: 200, birthYear: 2008, age: 18, profession: '', pathologies: ['psychogenic'] },
      ],
      unions: [
        { partner1: 'b3', partner2: 'b4' },
        { partner1: 'b1', partner2: 'b2' },
      ],
    },
  },
  {
    id: 'mock-4', name: 'Bernard – Camille', user_id: 'mock',
    created_at: '2026-02-01T14:00:00Z', updated_at: '2026-02-27T09:10:00Z',
    data: {
      members: [
        { id: 'c1', firstName: 'Camille', lastName: 'Bernard', gender: 'female', x: 0, y: 0, birthYear: 1995, age: 31, profession: '', pathologies: [] },
        { id: 'c2', firstName: 'Antoine', lastName: 'Bernard', gender: 'male', x: -150, y: -200, birthYear: 1965, age: 61, profession: '', pathologies: ['diabetes'] },
        { id: 'c3', firstName: 'Françoise', lastName: 'Morel', gender: 'female', x: 150, y: -200, birthYear: 1968, age: 58, profession: '', pathologies: [] },
      ],
      unions: [{ partner1: 'c2', partner2: 'c3' }],
    },
  },
  {
    id: 'mock-5', name: 'Petit – Alexandre', user_id: 'mock',
    created_at: '2025-06-15T10:30:00Z', updated_at: '2025-12-20T11:00:00Z',
    _mockCreator: { name: 'Nathalie Berteau', initials: 'NB', color: 'hsl(280 60% 55%)' },
    data: {
      members: [
        { id: 'd1', firstName: 'Alexandre', lastName: 'Petit', gender: 'male', x: 0, y: 0, birthYear: 1988, age: 38, profession: '', pathologies: ['cardiovascular'] },
        { id: 'd2', firstName: 'Laura', lastName: 'Petit', gender: 'female', x: 200, y: 0, birthYear: 1990, age: 36, profession: '', pathologies: [] },
        { id: 'd3', firstName: 'Hugo', lastName: 'Petit', gender: 'male', x: 0, y: 200, birthYear: 2018, age: 8, profession: '', pathologies: [] },
        { id: 'd4', firstName: 'Chloé', lastName: 'Petit', gender: 'female', x: 200, y: 200, birthYear: 2021, age: 5, profession: '', pathologies: [] },
      ],
      unions: [{ partner1: 'd1', partner2: 'd2' }],
    },
  },
  {
    id: 'mock-6', name: 'Garnier – Émilie', user_id: 'mock-other-1',
    created_at: '2026-01-18T13:00:00Z', updated_at: '2026-02-28T18:00:00Z',
    _mockCreator: { name: 'Léonie Nguyen', initials: 'LN', color: 'hsl(160 55% 42%)' },
    data: {
      members: [
        { id: 'e1', firstName: 'Émilie', lastName: 'Garnier', gender: 'female', x: 0, y: 0, birthYear: 1993, age: 33, profession: '', pathologies: ['depression'] },
        { id: 'e2', firstName: 'Thomas', lastName: 'Garnier', gender: 'male', x: 200, y: 0, birthYear: 1991, age: 35, profession: '', pathologies: [] },
        { id: 'e3', firstName: 'Robert', lastName: 'Garnier', gender: 'male', x: -100, y: -200, birthYear: 1958, age: 68, profession: '', pathologies: ['cardiovascular'] },
        { id: 'e4', firstName: 'Monique', lastName: 'Faure', gender: 'female', x: 100, y: -200, birthYear: 1961, age: 65, profession: '', pathologies: [] },
      ],
      unions: [
        { partner1: 'e3', partner2: 'e4' },
        { partner1: 'e2', partner2: 'e1' },
      ],
    },
  },
  {
    id: 'mock-7', name: 'Rousseau – Victor', user_id: 'mock-other-2',
    created_at: '2025-12-02T16:45:00Z', updated_at: '2026-02-15T12:00:00Z',
    _mockCreator: { name: 'Alice Vanmerche', initials: 'AV', color: 'hsl(20 75% 55%)' },
    data: {
      members: [
        { id: 'f1', firstName: 'Victor', lastName: 'Rousseau', gender: 'male', x: 0, y: 0, birthYear: 1982, age: 44, profession: '', pathologies: ['addiction'] },
        { id: 'f2', firstName: 'Claire', lastName: 'Rousseau', gender: 'female', x: 200, y: 0, birthYear: 1984, age: 42, profession: '', pathologies: ['cancer'] },
        { id: 'f3', firstName: 'Lina', lastName: 'Rousseau', gender: 'female', x: 100, y: 200, birthYear: 2010, age: 16, profession: '', pathologies: [] },
      ],
      unions: [{ partner1: 'f1', partner2: 'f2' }],
    },
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const [sortKey, setSortKey] = useState<SortKey>('updated_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const [notesModal, setNotesModal] = useState<{ open: boolean; genogramId: string; genogramName: string }>({ open: false, genogramId: '', genogramName: '' });
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});
  const [latestNoteDates, setLatestNoteDates] = useState<Record<string, string>>({});

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

  const genograms = [...(realGenograms || []), ...MOCK_GENOGRAMS];

  // Fake note data for mock genograms
  const MOCK_NOTE_COUNTS: Record<string, number> = {
    'mock-1': 3, 'mock-3': 5, 'mock-5': 1, 'mock-6': 2, 'mock-7': 4,
  };
  const MOCK_LATEST_NOTE_DATES: Record<string, string> = {
    'mock-1': '2026-03-01T10:00:00Z', // newer than updated_at → pulsing
    'mock-3': '2026-02-28T18:00:00Z', // newer than updated_at → pulsing
    'mock-5': '2025-12-21T09:00:00Z', // newer → pulsing
    'mock-6': '2026-02-21T07:00:00Z', // newer → pulsing
    'mock-7': '2025-11-01T10:00:00Z', // older than updated_at → no pulse
  };

  // Fetch note counts and latest note dates for all genograms
  useEffect(() => {
    if (!genograms?.length) return;
    const ids = genograms.filter(g => !g.id.startsWith('mock')).map(g => g.id);
    if (!ids.length) {
      setNoteCounts(MOCK_NOTE_COUNTS);
      setLatestNoteDates(MOCK_LATEST_NOTE_DATES);
      return;
    }
    supabase
      .from('genogram_notes')
      .select('genogram_id, created_at')
      .in('genogram_id', ids)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const counts: Record<string, number> = { ...MOCK_NOTE_COUNTS };
        const latest: Record<string, string> = { ...MOCK_LATEST_NOTE_DATES };
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

  const MAX_GENOGRAMS = 2;

  const handleCreate = () => {
    if (genograms && genograms.length >= MAX_GENOGRAMS) {
      toast.error(`Vous avez atteint la limite de ${MAX_GENOGRAMS} génogrammes.`, { duration: 3000 });
      return;
    }
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

  const displayName = 'Sophie Marchand';
  const userInitials = 'SM';

  return (
    <div className="min-h-screen bg-card">
      {/* ── Top Nav ── */}
      <header className="h-[64px] bg-card border-b border-border flex items-center justify-between px-8">
         <a href="/" className="flex items-center gap-2.5">
           <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
           <span className="text-[15px] font-semibold text-foreground tracking-tight">Genogy</span>
         </a>
        <div className="flex items-center gap-2">
          <Button variant="beta" size="sm" className="h-9 px-4 text-xs font-bold" onClick={() => setBetaModalOpen(true)}>
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
      <main className="px-6 py-5">
        {/* Hero / CTA Section */}
        <div className="dot-grid bg-background border border-border rounded-xl px-8 py-5 mb-4">
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
        <div className="bg-card border border-border rounded-xl px-6 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
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
                        Dernière modification <ArrowUpDown className="w-3 h-3" />
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
                        {(() => {
                          const mock = file._mockCreator;
                          const creatorName = mock ? mock.name : displayName.split('@')[0];
                          const creatorInitials = mock ? mock.initials : userInitials;
                          const isMe = !mock;
                          return (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: mock ? mock.color : 'hsl(var(--primary))' }}
                              >
                                <span className="text-white text-[10px] font-bold">{creatorInitials}</span>
                              </div>
                              <span className="text-[13px] text-foreground">
                                {creatorName}{' '}
                                {isMe && <span className="text-muted-foreground">(moi)</span>}
                              </span>
                            </div>
                          );
                        })()}
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
                                title="Notes du dossier"
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

        <BetaShareModal open={betaModalOpen} onOpenChange={setBetaModalOpen} />

        <DossierNotesModal
          open={notesModal.open}
          onClose={() => setNotesModal(prev => ({ ...prev, open: false }))}
          genogramId={notesModal.genogramId}
          genogramName={notesModal.genogramName}
        />
      </main>
    </div>
  );
};

export default Dashboard;
