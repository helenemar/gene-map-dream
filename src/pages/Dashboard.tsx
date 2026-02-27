import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Bell, Settings, MoreVertical, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface GenogramFile {
  id: string;
  name: string;
  creator: string;
  creatorInitials: string;
  creatorColor: string;
  lastModified: string;
  createdAt: string;
  notification?: string;
}

const MOCK_FILES: GenogramFile[] = [
  {
    id: '1', name: 'Celine Dupuie', creator: 'Marine Toussin (moi)',
    creatorInitials: 'MT', creatorColor: 'bg-primary',
    lastModified: '24/11/2025', createdAt: '12/08/2025',
    notification: '1 nouvelle note',
  },
  {
    id: '2', name: 'Sofia Laraveche', creator: 'Marine Toussin (moi)',
    creatorInitials: 'MT', creatorColor: 'bg-primary',
    lastModified: '16/10/2025', createdAt: '18/02/2025',
  },
  {
    id: '3', name: 'Loic Perssier', creator: 'Clara Borniac',
    creatorInitials: 'CB', creatorColor: 'bg-brand-orange',
    lastModified: '16/07/2025', createdAt: '21/06/2025',
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_FILES;
    const q = searchQuery.toLowerCase();
    return MOCK_FILES.filter(
      (f) => f.name.toLowerCase().includes(q) || f.creator.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Nav ── */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-destructive to-brand-orange flex items-center justify-center">
            <span className="text-card text-xs font-bold">G</span>
          </div>
          <span className="text-base font-semibold text-foreground">Genogy</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-destructive-foreground bg-destructive px-3 py-1.5 rounded-full">
            🧪 BETA Test
          </span>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="w-4.5 h-4.5 text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <Settings className="w-4.5 h-4.5 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center cursor-pointer">
            <span className="text-card text-xs font-semibold">HM</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero / CTA Section */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Créer un nouveau génogramme</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.
          </p>
          <Button onClick={() => navigate('/editor')} className="gap-2 rounded-full px-6">
            <Plus className="w-4 h-4" />
            Créer à partir d'un nouveau membre
          </Button>
        </div>

        {/* Files Section */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-base font-bold text-foreground">
              Mes génogrammes ({filteredFiles.length})
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

          {/* Data Table */}
          {filteredFiles.length > 0 ? (
            <div className="border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-transparent">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Nom <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Créateur <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Dernière modifications <ArrowUpDown className="w-3 h-3" />
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
                      onClick={() => navigate('/editor')}
                      className="cursor-pointer group"
                    >
                      <TableCell className="w-12 pr-0">
                        <div className="w-10 h-10 rounded-lg bg-muted border border-border" />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {file.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${file.creatorColor} flex items-center justify-center shrink-0`}>
                            <span className="text-[10px] font-semibold text-primary-foreground">{file.creatorInitials}</span>
                          </div>
                          <span className="text-sm text-foreground">{file.creator}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-foreground">{file.lastModified}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-foreground">{file.createdAt}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {file.notification && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Bell className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">{file.notification}</span>
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
