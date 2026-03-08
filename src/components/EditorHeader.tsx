import React, { useRef, useState, useEffect } from 'react';
import { Search, Download, Share2, X, User, Briefcase, HeartPulse, Link2, Image, FileCode, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { SearchSuggestion } from '@/hooks/useFamilySearch';
import SaveIndicator from '@/components/SaveIndicator';
import { SaveStatus } from '@/hooks/useAutoSave';
import gogyIcon from '@/assets/genogy-icon.svg';

interface EditorHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchClear: () => void;
  suggestions: SearchSuggestion[];
  isSearchActive: boolean;
  matchCount: number;
  onExportPng?: () => void;
  onExportSvg?: () => void;
  onExportPdf?: () => void;
  saveStatus?: SaveStatus;
  onOpenNotes?: () => void;
  noteCount?: number;
  onShare?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  name: <User className="w-3.5 h-3.5" />,
  profession: <Briefcase className="w-3.5 h-3.5" />,
  pathology: <HeartPulse className="w-3.5 h-3.5" />,
  relation: <Link2 className="w-3.5 h-3.5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  name: 'Nom',
  profession: 'Profession',
  pathology: 'Pathologie',
  relation: 'Relations',
};

const UserAvatar: React.FC = () => {
  const { user, signOut } = useAuth();
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => signOut()}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
        title="Se déconnecter"
      >
        <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <span className="text-[10px] font-semibold text-primary-foreground">{initials}</span>
      </div>
    </div>
  );
};

const EditorHeader: React.FC<EditorHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchClear,
  suggestions,
  isSearchActive,
  matchCount,
  onExportPng,
  onExportSvg,
  onExportPdf,
  saveStatus = 'idle',
  onOpenNotes,
  noteCount = 0,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (value: string) => {
    onSearchChange(value);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Group suggestions by category
  const grouped = suggestions.reduce<Record<string, SearchSuggestion[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      {/* Left: Logo + save status */}
      <div className="flex items-center gap-3">
        <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Rechercher un membre, une pathologie, un lien, etc..."
            className="w-full pl-9 pr-10 py-2 text-sm bg-card border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/50"
          />
          {isSearchActive && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                {matchCount}
              </span>
              <button
                onClick={onSearchClear}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-[200]">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 bg-accent/30">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">{CATEGORY_ICONS[category]}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {CATEGORY_LABELS[category] || category}
                      </span>
                    </div>
                  </div>
                  {items.map((item, i) => (
                    <button
                      key={`${category}-${i}`}
                      onClick={() => handleSelect(item.value)}
                      className="flex items-center justify-between w-full px-3 py-2 hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {/* Color dot for relation category */}
                        {item.color && (
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                        )}
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60">
                        {item.count} {category === 'relation' ? 'lien' : 'membre'}{item.count !== 1 ? 's' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {onOpenNotes && (
          <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs relative" onClick={onOpenNotes}>
            <FileText className="w-3.5 h-3.5" />
            Notes
            {noteCount > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {noteCount}
              </span>
            )}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs">
              <Download className="w-3.5 h-3.5" />
              Exporter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem onClick={onExportPng} className="gap-2 cursor-pointer">
              <Image className="w-4 h-4" />
              Exporter en PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportSvg} className="gap-2 cursor-pointer">
              <FileCode className="w-4 h-4" />
              Exporter en SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf} className="gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              Exporter en PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="brand" size="sm" className="gap-2 text-xs">
          <Share2 className="w-3.5 h-3.5" />
          Partager
        </Button>
        <UserAvatar />
      </div>

    </header>
  );
};

export default EditorHeader;
