import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTraumaCatalog } from '@/hooks/useTraumaCatalog';

interface TraumaTagInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

const TraumaTagInput: React.FC<TraumaTagInputProps> = ({
  values,
  onChange,
  placeholder = 'Tapez pour rechercher ou créer…',
}) => {
  const { entries, addPersonalEntry } = useTraumaCatalog();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.filter(e => !values.includes(e.label)).slice(0, 8);
    return entries
      .filter(e => e.label.toLowerCase().includes(q) && !values.includes(e.label))
      .slice(0, 8);
  }, [entries, query, values]);

  const trimmedQuery = query.trim();
  const exactMatch = entries.some(e => e.label.toLowerCase() === trimmedQuery.toLowerCase());
  const showCreateOption = trimmedQuery.length > 0 && !exactMatch && !values.includes(trimmedQuery);
  const totalOptions = suggestions.length + (showCreateOption ? 1 : 0);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const addValue = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setQuery('');
    setOpen(true);
    inputRef.current?.focus();
  };

  const removeValue = (label: string) => {
    onChange(values.filter(v => v !== label));
  };

  const handleSelect = (index: number) => {
    if (index < suggestions.length) {
      addValue(suggestions[index].label);
    } else if (showCreateOption) {
      addPersonalEntry(trimmedQuery);
      addValue(trimmedQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight(h => Math.min(h + 1, Math.max(totalOptions - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalOptions > 0) {
        handleSelect(highlight);
      } else if (trimmedQuery) {
        addPersonalEntry(trimmedQuery);
        addValue(trimmedQuery);
      }
    } else if (e.key === 'Backspace' && !query && values.length > 0) {
      removeValue(values[values.length - 1]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map(v => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E24B4A]/10 border border-[#E24B4A]/30 text-xs font-medium text-foreground"
            >
              {v}
              <button
                type="button"
                onClick={() => removeValue(v)}
                className="hover:text-destructive transition-colors"
                aria-label={`Retirer ${v}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-8 text-sm border-border/50 bg-card focus-visible:ring-primary/30"
      />

      {open && (suggestions.length > 0 || showCreateOption) && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border/60 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(i); }}
              onMouseEnter={() => setHighlight(i)}
              className={`w-full px-3 py-1.5 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                highlight === i ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-foreground'
              }`}
            >
              <span className="truncate">{s.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 shrink-0">
                {s.source === 'user' ? 'perso' : s.category || ''}
              </span>
            </button>
          ))}
          {showCreateOption && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(suggestions.length); }}
              onMouseEnter={() => setHighlight(suggestions.length)}
              className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 border-t border-border/40 transition-colors ${
                highlight === suggestions.length ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-foreground'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">Créer « {trimmedQuery} »</span>
              <Sparkles className="w-3 h-3 text-muted-foreground/50 ml-auto shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TraumaTagInput;
