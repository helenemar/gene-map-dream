import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Clock, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface GenogramFile {
  id: string;
  name: string;
  familyName: string;
  membersCount: number;
  lastModified: Date;
  status: 'in_progress' | 'completed';
}

// Mock data — sera remplacé par une vraie source de données
const MOCK_FILES: GenogramFile[] = [
  {
    id: '1', name: 'Famille Lefèvre', familyName: 'Lefèvre',
    membersCount: 15, lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'in_progress',
  },
  {
    id: '2', name: 'Famille Dupont-Martin', familyName: 'Dupont',
    membersCount: 8, lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'completed',
  },
  {
    id: '3', name: 'Famille Garcia', familyName: 'Garcia',
    membersCount: 12, lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'in_progress',
  },
  {
    id: '4', name: 'Famille Bernard', familyName: 'Bernard',
    membersCount: 6, lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: 'completed',
  },
];

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR');
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_FILES;
    const q = searchQuery.toLowerCase();
    return MOCK_FILES.filter(
      (f) => f.name.toLowerCase().includes(q) || f.familyName.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleOpenFile = (file: GenogramFile) => {
    navigate('/editor');
  };

  const handleCreate = () => {
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Nav ── */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-card text-xs font-bold">G</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Genogy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">PM</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Title + Create */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes génogrammes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {MOCK_FILES.length} fichier{MOCK_FILES.length > 1 ? 's' : ''} · Centre de gestion
            </p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer un nouveau génogramme
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom de famille ou de fichier..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Files Table or Empty State */}
        {filteredFiles.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Nom du fichier</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Membres</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground hidden sm:table-cell">Dernière modification</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground hidden md:table-cell">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    onClick={() => handleOpenFile(file)}
                    className="cursor-pointer group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {relativeTime(file.lastModified)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1 text-xs font-medium">
                        <Users className="w-3 h-3" />
                        {file.membersCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {relativeTime(file.lastModified)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={file.status === 'completed' ? 'default' : 'outline'}
                        className={`text-xs ${file.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'text-muted-foreground'
                        }`}
                      >
                        {file.status === 'completed' ? 'Terminé' : 'En cours'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : searchQuery ? (
          /* No results */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Aucun résultat</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Aucun fichier ne correspond à "{searchQuery}". Vérifiez l'orthographe ou créez un nouveau génogramme.
            </p>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <FolderOpen className="w-9 h-9 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Commencez par créer votre premier génogramme
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Cartographiez les liens familiaux et émotionnels de vos patients pour enrichir votre analyse clinique.
            </p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer un génogramme
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
