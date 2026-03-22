import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ArrowLeft, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface GenogramNote {
  id: string;
  genogram_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

interface DossierNotesModalProps {
  open: boolean;
  onClose: () => void;
  genogramId: string;
  genogramName?: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

const DossierNotesModal: React.FC<DossierNotesModalProps> = ({
  open, onClose, genogramId, genogramName = 'Génogramme',
}) => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [view, setView] = useState<'list' | 'add'>('list');
  const [notes, setNotes] = useState<GenogramNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';

  const fetchNotes = async () => {
    if (!genogramId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('genogram_notes')
      .select('*')
      .eq('genogram_id', genogramId)
      .order('created_at', { ascending: false });
    if (error) {
      toast.error(t.notesModal.noteLoadError);
    } else {
      setNotes((data as GenogramNote[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchNotes();
      setView('list');
      setNewContent('');
    }
  }, [open, genogramId]);

  const handleSave = async () => {
    if (!newContent.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from('genogram_notes').insert({
      genogram_id: genogramId,
      author_id: user.id,
      content: newContent.trim(),
    });
    if (error) {
      toast.error(t.notesModal.noteSaveError);
    } else {
      toast.success(t.notesModal.noteSaved);
      setNewContent('');
      setView('list');
      fetchNotes();
    }
    setSaving(false);
  };

  const handleDelete = async (noteId: string) => {
    const { error } = await supabase.from('genogram_notes').delete().eq('id', noteId);
    if (error) {
      toast.error(t.notesModal.noteDeleteError);
    } else {
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxW = pageW - margin * 2;
    let y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Notes — ${genogramName}`, margin, y);
    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(`${t.notesModal.exportedOn} ${new Date().toLocaleDateString(locale)}`, margin, y);
    y += 12;
    doc.setTextColor(0);

    for (const note of notes) {
      const { date, time } = formatDateTime(note.created_at);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${date} — ${time}`, margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(note.content, maxW);
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 5;
      }
      y += 6;
      if (y > 270) { doc.addPage(); y = margin; }
      doc.setDrawColor(220);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
    }

    doc.save(`notes-${genogramName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const exportText = () => {
    const text = notes.map(n => {
      const { date, time } = formatDateTime(n.created_at);
      return `[${date} ${time}]\n${n.content}`;
    }).join('\n\n---\n\n');
    const blob = new Blob([`Notes — ${genogramName}\n${'='.repeat(40)}\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${genogramName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-lg mx-4 bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                {view === 'add' && (
                  <button onClick={() => setView('list')} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    {view === 'list' ? t.notesModal.dossierNotes : t.notesModal.newNote}
                  </h2>
                </div>
                {view === 'list' && notes.length > 0 && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {notes.length}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {view === 'list' ? (
                <div className="px-6 py-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{t.notesModal.noNotes}</p>
                      <p className="text-xs text-muted-foreground/60">{t.notesModal.addFirst}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map(note => {
                        const { date, time } = formatDateTime(note.created_at);
                        return (
                          <div key={note.id} className="group rounded-xl bg-accent/20 border border-border/40 p-3.5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground">{date}</span>
                                <span className="text-[10px] text-muted-foreground">{time}</span>
                              </div>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 transition-all"
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </button>
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-6 py-4">
                  <Textarea
                    className="min-h-[120px] text-sm border-border/50 bg-background focus-visible:ring-primary/30 resize-none"
                    placeholder={t.notesModal.notePlaceholder}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
              {view === 'list' ? (
                <>
                  <div className="flex items-center gap-2">
                    {notes.length > 0 && (
                      <DropdownExport onExportPdf={exportPdf} onExportText={exportText} />
                    )}
                  </div>
                  <Button onClick={() => setView('add')} size="sm" className="gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    {t.notesModal.addNote}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setView('list')}>{t.common.cancel}</Button>
                  <Button size="sm" onClick={handleSave} disabled={!newContent.trim() || saving} className="gap-2">
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    {t.notesModal.saveNote}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Small dropdown for export options */
const DropdownExport: React.FC<{ onExportPdf: () => void; onExportText: () => void }> = ({ onExportPdf, onExportText }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => setOpen(!open)}>
        <Download className="w-3.5 h-3.5" />
        {t.common.export}
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-10 min-w-[140px]">
          <button onClick={() => { onExportPdf(); setOpen(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors">
            {t.notesModal.exportPdf}
          </button>
          <button onClick={() => { onExportText(); setOpen(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors">
            {t.notesModal.exportTxt}
          </button>
        </div>
      )}
    </div>
  );
};

export default DossierNotesModal;

/** Hook to fetch note count for a genogram */
export function useGenogramNoteCount(genogramId: string | undefined) {
  const [count, setCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (!genogramId) return;
    supabase
      .from('genogram_notes')
      .select('id', { count: 'exact', head: true })
      .eq('genogram_id', genogramId)
      .then(({ count: c }) => setCount(c ?? 0));
  }, [genogramId, refreshKey]);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  return { count, refresh };
}
