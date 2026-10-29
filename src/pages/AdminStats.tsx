import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type Row = { email: string; signed_up: string; last_sign_in: string | null; genogram_count: number; member_count: number; last_edit: string | null };

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const status = (r: Row) => (r.genogram_count === 0 ? 'Inactif' : r.member_count <= 3 * r.genogram_count ? 'Essai' : 'Actif');

export default function AdminStats() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (supabase.rpc as any)('admin_user_stats').then(({ data, error }: any) => {
      if (error) setError(true); else setRows(data as Row[]);
    });
  }, []);

  const totals = useMemo(() => {
    const r = rows ?? [];
    return {
      users: r.length,
      active: r.filter((x) => status(x) === 'Actif').length,
      trial: r.filter((x) => status(x) === 'Essai').length,
      inactive: r.filter((x) => status(x) === 'Inactif').length,
      genos: r.reduce((s, x) => s + Number(x.genogram_count), 0),
    };
  }, [rows]);

  if (error) return <div className="p-10 text-center">Accès réservé. <Link className="text-primary underline" to="/dashboard">Retour</Link></div>;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Statistiques d'utilisation</h1>
          <Link to="/dashboard" className="text-sm text-primary underline">Tableau de bord</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[['Inscrits', totals.users], ['Actifs (>3 membres)', totals.active], ['Essai (3 membres)', totals.trial], ['Aucun génogramme', totals.inactive], ['Génogrammes', totals.genos]].map(([l, v]) => (
            <div key={l as string} className="bg-card border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="text-2xl font-semibold text-foreground">{rows ? v : '…'}</div>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>{['Email', 'Inscription', 'Dernière connexion', 'Génogrammes', 'Membres', 'Dernière modif', 'Statut'].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.email} className="border-b border-border last:border-0">
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{fmt(r.signed_up)}</td>
                  <td className="p-3">{fmt(r.last_sign_in)}</td>
                  <td className="p-3">{r.genogram_count}</td>
                  <td className="p-3">{r.member_count}</td>
                  <td className="p-3">{fmt(r.last_edit)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs ${status(r) === 'Actif' ? 'bg-primary/10 text-primary' : status(r) === 'Essai' ? 'bg-secondary/20 text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>{status(r)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows && <div className="p-6 text-center text-muted-foreground">Chargement…</div>}
        </div>
      </div>
    </div>
  );
}
