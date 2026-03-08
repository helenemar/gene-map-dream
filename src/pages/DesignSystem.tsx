import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Plus, UserPlus, Pencil, ZoomIn, ZoomOut, X, Search, ChevronDown, ChevronUp, ArrowLeft, Link, Atom } from 'lucide-react';
import { PATHOLOGIES, FAMILY_LINK_TYPES, EMOTIONAL_LINK_TYPES, FamilyMember } from '@/types/genogram';
import MemberIcon from '@/components/MemberIcon';
import MemberCard from '@/components/MemberCard';
import type { MemberCardState } from '@/components/MemberCard';
import { EmotionalLinkPreview } from '@/components/EmotionalLinkLine';
import { FamilyLinkPreview } from '@/components/FamilyLinkLines';
import { UnionBadgePreview } from '@/components/UnionBadge';

/* ============================================================
   Design System – Genogy
   Source of truth for all visual components.
   Route: /design-system (manual access only)
   ============================================================ */

/** Helper to build a FamilyMember for DS demos */
function dsMember(overrides: Partial<FamilyMember> & { firstName: string; gender: 'male' | 'female' }): FamilyMember {
  return {
    id: overrides.firstName.toLowerCase(),
    lastName: '',
    birthYear: 1990,
    age: 34,
    profession: '',
    x: 0, y: 0,
    pathologies: [],
    ...overrides,
  };
}

// --------------- Helpers ---------------
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold text-foreground mt-16 mb-6 pb-2 border-b border-border">{children}</h2>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-10">
    <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

const ColorSwatch: React.FC<{ name: string; cssVar: string; hex?: string }> = ({ name, cssVar, hex }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className="w-16 h-16 rounded-2xl border border-border shadow-card"
      style={{ backgroundColor: `hsl(var(--${cssVar}))` }}
    />
    <span className="text-xs font-semibold text-foreground">{name}</span>
    <code className="text-[10px] text-muted-foreground">--{cssVar}</code>
    {hex && <code className="text-[10px] text-muted-foreground">{hex}</code>}
  </div>
);

// --------------- Main Page ---------------
const DesignSystemPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center">
              <span className="text-card text-sm font-bold">G</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Genogy Design System</h1>
              <p className="text-xs text-muted-foreground">Source de vérité visuelle · v1.0</p>
            </div>
          </div>
          <code className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            /design-system
          </code>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 pb-24">

        {/* ============================================================
           1. FONDATIONS VISUELLES
           ============================================================ */}
        <SectionTitle>1. Fondations Visuelles</SectionTitle>

        {/* Color Palette */}
        <SubSection title="Palette de couleurs">
          <p className="text-sm text-muted-foreground mb-6">Toutes les couleurs sont définies en HSL dans <code className="bg-muted px-1.5 py-0.5 rounded text-xs">index.css</code> et mappées dans <code className="bg-muted px-1.5 py-0.5 rounded text-xs">tailwind.config.ts</code>.</p>

          <h4 className="text-sm font-semibold text-foreground mb-3">Couleurs de base</h4>
          <div className="flex flex-wrap gap-6 mb-8">
            <ColorSwatch name="Background" cssVar="background" hex="#F1F2F5" />
            <ColorSwatch name="Card" cssVar="card" hex="#FFFFFF" />
            <ColorSwatch name="Foreground" cssVar="foreground" hex="#1E2233" />
            <ColorSwatch name="Muted" cssVar="muted" hex="#E5E7EB" />
            <ColorSwatch name="Muted fg" cssVar="muted-foreground" hex="#6B7280" />
            <ColorSwatch name="Border" cssVar="border" hex="#E2E4E9" />
          </div>

          <h4 className="text-sm font-semibold text-foreground mb-3">Couleurs de marque</h4>
          <div className="flex flex-wrap gap-6 mb-8">
            <ColorSwatch name="Primary (Violet)" cssVar="primary" hex="#6532FD" />
            <ColorSwatch name="Primary fg" cssVar="primary-foreground" hex="#FFFFFF" />
            <ColorSwatch name="Orange CTA" cssVar="brand-orange" hex="#F97316" />
            <ColorSwatch name="Orange fg" cssVar="brand-orange-foreground" hex="#FFFFFF" />
          </div>

          <h4 className="text-sm font-semibold text-foreground mb-3">Couleurs des pathologies</h4>
          <div className="flex flex-wrap gap-6 mb-8">
            {PATHOLOGIES.map(p => (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-2xl border border-border shadow-card"
                  style={{ backgroundColor: `hsl(var(--pathology-${p.id}))` }}
                />
                <span className="text-xs font-semibold text-foreground">{p.name}</span>
                <code className="text-[10px] text-muted-foreground">--pathology-{p.id}</code>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-foreground mb-3">Couleurs des liens émotionnels</h4>
          <div className="flex flex-wrap gap-6">
            {EMOTIONAL_LINK_TYPES.map(l => (
              <div key={l.id} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-2xl border border-border shadow-card"
                  style={{ backgroundColor: `hsl(var(--link-${l.id}))` }}
                />
                <span className="text-xs font-semibold text-foreground">{l.label}</span>
                <code className="text-[10px] text-muted-foreground">--link-{l.id}</code>
              </div>
            ))}
          </div>
        </SubSection>

        {/* Typography */}
        <SubSection title="Typographie">
          <p className="text-sm text-muted-foreground mb-6">Police : <strong>Inter</strong> — Variable weight 300–700.</p>
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">H1 — Page Title · 24px / Bold</span>
              <h1 className="text-2xl font-bold text-foreground">Nouveau Fichier</h1>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">H2 — Section Title · 18px / Semibold</span>
              <h2 className="text-lg font-semibold text-foreground">Créer un nouveau génogramme</h2>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">H3 — Sidebar Section · 14px / Semibold</span>
              <h3 className="text-sm font-semibold text-foreground">Membres (7)</h3>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Body — 14px / Regular</span>
              <p className="text-sm text-foreground">Hélène Margary — Product Designer</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Caption — 12px / Medium</span>
              <p className="text-xs font-medium text-muted-foreground">1992 - · 33 ans</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Label — 12px / Semibold</span>
              <p className="text-xs font-semibold text-foreground">Lien relationnel</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">Badge/Tag — 11px / Medium</span>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">33 ans</span>
            </div>
          </div>
        </SubSection>

        {/* Canvas */}
        <SubSection title="Canevas — Dot Grid">
          <p className="text-sm text-muted-foreground mb-4">Motif de grille à points utilisé comme fond du plan de travail. Taille : 24×24px, point : 1px, couleur : <code className="bg-muted px-1.5 py-0.5 rounded text-xs">--canvas-dot</code>.</p>
          <div className="dot-grid rounded-2xl border border-border h-48 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-muted-foreground bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">.dot-grid</span>
            </div>
          </div>
        </SubSection>

        {/* Shadows */}
        <SubSection title="Ombres">
          <div className="flex flex-wrap gap-6">
            {[
              { name: 'shadow-card', desc: 'Cartes, éléments de surface' },
              { name: 'shadow-soft', desc: 'Boutons, contrôles discrets' },
              { name: 'shadow-float', desc: 'Contrôles flottants' },
              { name: 'shadow-modal', desc: 'Modales, panels latéraux' },
            ].map(s => (
              <div key={s.name} className={`bg-card rounded-2xl border border-border p-6 w-40 h-28 flex flex-col justify-end ${s.name}`}>
                <span className="text-xs font-semibold text-foreground">{s.name}</span>
                <span className="text-[10px] text-muted-foreground">{s.desc}</span>
              </div>
            ))}
          </div>
        </SubSection>

        {/* Border Radius */}
        <SubSection title="Border Radius — Logique adaptative">
          <p className="text-sm text-muted-foreground mb-6">
            Le radius suit une <strong>logique adaptative</strong> : les grands conteneurs (modales, drawers, cartes) utilisent <code className="bg-muted px-1.5 py-0.5 rounded text-xs">rounded-xl</code> (12px), les éléments standards (boutons, inputs) utilisent <code className="bg-muted px-1.5 py-0.5 rounded text-xs">rounded-lg</code> (8px), et les petits éléments (badges, tags) utilisent <code className="bg-muted px-1.5 py-0.5 rounded text-xs">rounded-md</code> ou <code className="bg-muted px-1.5 py-0.5 rounded text-xs">rounded-full</code>.
          </p>

          <div className="flex flex-wrap gap-6 mb-10">
            {[
              { name: 'sm', tailwind: 'rounded-sm', val: 'calc(var(--radius) - 4px)', px: '4px' },
              { name: 'md', tailwind: 'rounded-md', val: 'calc(var(--radius) - 2px)', px: '6px' },
              { name: 'lg', tailwind: 'rounded-lg', val: 'var(--radius)', px: '8px' },
              { name: 'xl', tailwind: 'rounded-xl', val: 'calc(var(--radius) + 4px)', px: '12px' },
              { name: '2xl', tailwind: 'rounded-2xl', val: '1rem', px: '16px' },
              { name: '3xl', tailwind: 'rounded-3xl', val: '1.25rem', px: '20px' },
              { name: 'full', tailwind: 'rounded-full', val: '9999px', px: '∞' },
            ].map(r => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 bg-primary/10 border-2 border-primary/30"
                  style={{ borderRadius: r.val }}
                />
                <span className="text-xs font-semibold text-foreground">{r.name}</span>
                <code className="text-[10px] text-muted-foreground">{r.tailwind}</code>
                <code className="text-[10px] text-muted-foreground">{r.px}</code>
              </div>
            ))}
          </div>

          {/* Usage guide */}
          <h4 className="text-sm font-semibold text-foreground mb-3">Guide d'utilisation</h4>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Composant</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Radius</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Classe Tailwind</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { comp: 'Modales / AlertDialog / Drawers', radius: '12px', tw: 'rounded-xl' },
                  { comp: 'Cartes de section (Features, FAQ)', radius: '12px', tw: 'rounded-xl' },
                  { comp: 'Boutons grands (CTA, lg, xl)', radius: '12px', tw: 'rounded-xl' },
                  { comp: 'Bouton Beta', radius: '12px', tw: 'rounded-xl' },
                  { comp: 'Menus contextuels / Dropdowns', radius: '8px', tw: 'rounded-lg' },
                  { comp: 'Boutons standards (default, sm)', radius: '8px', tw: 'rounded-lg' },
                  { comp: 'Inputs / Selects', radius: '8px', tw: 'rounded-lg' },
                  { comp: 'Badges / Tags', radius: '∞', tw: 'rounded-full' },
                  { comp: 'Boutons icône circulaires', radius: '∞', tw: 'rounded-full' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-foreground">{row.comp}</td>
                    <td className="px-4 py-2.5"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{row.radius}</code></td>
                    <td className="px-4 py-2.5"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{row.tw}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubSection>

        {/* ============================================================
           2. COMPOSANTS ATOMES & MOLÉCULES
           ============================================================ */}
        <SectionTitle>2. Composants Atomes &amp; Molécules</SectionTitle>

        {/* Buttons */}
        <SubSection title="Boutons">
          <div className="bg-card rounded-2xl border border-border p-8">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Boutons primaires</h4>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Button variant="default" size="default">
                <UserPlus className="w-4 h-4" />
                Créer un membre
              </Button>
              <Button variant="default" size="sm">
                Créer
              </Button>
              <Button variant="default" size="lg">
                Créer un génogramme
              </Button>
            </div>

            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Bouton orange (CTA / Partager)</h4>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Button variant="brand" size="default">
                <Share2 className="w-4 h-4" />
                Partager
              </Button>
              <Button variant="brand" size="sm">Partager</Button>
              <Button variant="brand-outline" size="default">
                Créer à partir d'un nouveau modèle
              </Button>
            </div>

            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Bouton Beta</h4>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Button variant="beta" size="default">
                <Atom className="w-4 h-4" />
                BETA Test
              </Button>
              <Button variant="beta" size="sm">
                <Atom className="w-3.5 h-3.5" />
                BETA
              </Button>
            </div>

            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Boutons secondaires & outline</h4>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Button variant="outline" size="default">
                <Download className="w-4 h-4" />
                Exporter en PDF
              </Button>
              <Button variant="outline" size="sm">Ajouter</Button>
              <Button variant="ghost" size="default">Annuler</Button>
              <Button variant="subtle" size="sm">Fermer</Button>
            </div>

            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Boutons icône (contrôles flottants)</h4>
            <div className="flex items-center gap-3">
              <Button variant="icon-circle" size="icon">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="default" size="icon" className="rounded-full">
                <Plus className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 bg-card rounded-full shadow-float border border-border p-1">
                <Button variant="ghost" size="icon-sm" className="rounded-full">
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="rounded-full">
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </SubSection>

        {/* Inputs */}
        <SubSection title="Champs de saisie (Inputs)">
          <div className="bg-card rounded-2xl border border-border p-8 max-w-lg">
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Prénom *</label>
                <input
                  type="text"
                  placeholder="Hélène"
                  className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Nom *</label>
                <input
                  type="text"
                  defaultValue="Margary"
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Profession</label>
                <input
                  type="text"
                  placeholder="Ex: Product Designer"
                  className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Date de naissance</label>
                <input
                  type="text"
                  placeholder="25/08/1989"
                  className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Lien relationnel</label>
                <div className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all">
                  <span className="text-muted-foreground/60">Sélectionner...</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Recherche (rounded-full)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un membre, une pathologie, un lien, etc..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </SubSection>

        {/* Toggle / Gender Switch */}
        <SubSection title="Sélecteur Homme / Femme (Toggle)">
          <div className="bg-card rounded-2xl border border-border p-8 max-w-xs">
            <div className="bg-muted rounded-full p-1 flex">
              <button className="flex-1 py-2 text-sm font-semibold rounded-full bg-foreground text-card transition-all">
                Homme
              </button>
              <button className="flex-1 py-2 text-sm font-medium rounded-full text-muted-foreground hover:text-foreground transition-all">
                Femme
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
              <input type="checkbox" className="rounded border-border" />
              Personne transgenre
            </p>
          </div>
        </SubSection>

        {/* Family Links (Structural SVG) */}
        <SubSection title="Liens familiaux (Structurels)">
          <p className="text-sm text-muted-foreground mb-4">Lignes noires solides définissant la parenté. Chaque variante indique le statut de l'union.</p>
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="space-y-5">
              {FAMILY_LINK_TYPES.map(link => (
                <div key={link.id} className="flex items-center gap-6">
                  <FamilyLinkPreview status={link.id} width={200} height={32} />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{link.label}</span>
                    <p className="text-xs text-muted-foreground font-mono">{link.id}</p>
                  </div>
                </div>
              ))}
              {/* Descent / Sibling comb */}
              <div className="flex items-center gap-6">
                <svg width="200" height="60" className="shrink-0">
                  <line x1="100" y1="5" x2="100" y2="25" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeOpacity="0.3" />
                  <line x1="30" y1="25" x2="170" y2="25" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeOpacity="0.3" />
                  <line x1="30" y1="25" x2="30" y2="55" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeOpacity="0.3" />
                  <line x1="100" y1="25" x2="100" y2="55" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeOpacity="0.3" />
                  <line x1="170" y1="25" x2="170" y2="55" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeOpacity="0.3" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Peigne de fratrie</span>
                  <p className="text-xs text-muted-foreground">Tige de descente + barre horizontale + gouttes individuelles</p>
                </div>
              </div>
            </div>
          </div>
        </SubSection>

        {/* Union Badges */}
        <SubSection title="Badges d'union (UnionBadge)">
          <p className="text-sm text-muted-foreground mb-4">
            Badge de spécification positionné sur la ligne d'union. Pilule de texte (dates) + icône circulaire de statut en dessous. Z-index 60 sur le canvas.
          </p>
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="grid grid-cols-3 gap-8">
              {[
                { status: 'married' as const, label: 'Mariage', year: 1996, end: undefined },
                { status: 'divorced' as const, label: 'Divorce', year: 1981, end: 2005 },
                { status: 'separated' as const, label: 'Séparation', year: 1990, end: 2010 },
                { status: 'widowed' as const, label: 'Veuvage', year: 1968, end: 2020 },
                { status: 'love_affair' as const, label: 'Liaison', year: 2015, end: undefined },
                { status: 'common_law' as const, label: 'Union libre', year: 2000, end: undefined },
              ].map(({ status, label, year, end }) => (
                <div key={status} className="flex flex-col items-center gap-3">
                  <UnionBadgePreview status={status} marriageYear={year} endYear={end} />
                  <div className="text-center">
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                    <p className="text-xs text-muted-foreground font-mono">{status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SubSection>

        {/* Emotional Links (SVG dynamic lines) */}
        <SubSection title="Liens émotionnels (SVG dynamique)">
          <p className="text-sm text-muted-foreground mb-4">Moteur de rendu SVG pour les 11 types de liens émotionnels. Chaque ligne est calculée dynamiquement entre deux points d'ancrage.</p>
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="space-y-5">
              {EMOTIONAL_LINK_TYPES.map(link => (
                <div key={link.id} className="flex items-center gap-6">
                  <EmotionalLinkPreview type={link.id} width={200} height={32} />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{link.label}</span>
                    <p className="text-xs text-muted-foreground font-mono">{link.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SubSection>

        {/* ============================================================
           3. ORGANISMES
           ============================================================ */}
        <SectionTitle>3. Organismes (Spécifiques à Genogy)</SectionTitle>

        {/* Member Icon - Male 12 Variants (Reference Grid) */}
        <SubSection title="Icône Homme — Grille de référence (12 variantes)">
          <p className="text-sm text-muted-foreground mb-4">
            Grille 4×3 exacte de la référence. <strong>Carré</strong> = homme. 
            Cercle intérieur (gris) = Transgenre, Triangle inversé = Gay, Triangle pointillé = Bisexuel, Croix = Décédé.
          </p>
          <div className="grid grid-cols-4 gap-5 mb-8">
            {MALE_REFERENCE_GRID.map((combo, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col items-center gap-3">
                <MemberIcon
                  gender="male"
                  isGay={combo.gay}
                  isBisexual={combo.bisexual}
                  isTransgender={combo.transgender}
                  isDead={combo.dead}
                  size={72}
                  className="text-foreground"
                />
                <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  {combo.label}
                </div>
              </div>
            ))}
          </div>
        </SubSection>

        {/* All combinations systematic */}
        <SubSection title="Icône Membre — Toutes les combinaisons">
          <p className="text-sm text-muted-foreground mb-4">
            Grille exhaustive par genre. Triangle inversé = Gay, Triangle pointillé = Bisexuel, Forme intérieure = Transgenre, Croix = Décédé.
          </p>

          <h4 className="text-sm font-semibold text-foreground mb-3">Homme (Carré)</h4>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {generateCombinations('male').map((combo, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-3">
                <MemberIcon gender="male" isGay={combo.gay} isBisexual={combo.bisexual} isTransgender={combo.transgender} isDead={combo.dead} size={56} className="text-foreground" />
                <div className="text-[10px] text-muted-foreground text-center space-y-0.5">
                  <div>Gay: <strong>{combo.gay ? 'T' : 'F'}</strong> · Trans: <strong>{combo.transgender ? 'T' : 'F'}</strong></div>
                  <div>Bi: <strong>{combo.bisexual ? 'T' : 'F'}</strong> · Dead: <strong>{combo.dead ? 'T' : 'F'}</strong></div>
                </div>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-foreground mb-3">Femme (Cercle)</h4>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {generateCombinations('female').map((combo, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-3">
                <MemberIcon gender="female" isGay={combo.gay} isBisexual={combo.bisexual} isTransgender={combo.transgender} isDead={combo.dead} size={56} className="text-foreground" />
                <div className="text-[10px] text-muted-foreground text-center space-y-0.5">
                  <div>Gay: <strong>{combo.gay ? 'T' : 'F'}</strong> · Trans: <strong>{combo.transgender ? 'T' : 'F'}</strong></div>
                  <div>Bi: <strong>{combo.bisexual ? 'T' : 'F'}</strong> · Dead: <strong>{combo.dead ? 'T' : 'F'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </SubSection>

        {/* Pathology Fill Grid */}
        <SubSection title="Icône Membre — Remplissage Pathologies (0 à 4)">
          <p className="text-sm text-muted-foreground mb-4">
            Grille de démonstration du remplissage par quadrants selon le nombre de pathologies.
            Ordre : Bas-Gauche[0], Bas-Droit[1], Haut-Gauche[2], Haut-Droit[3].
          </p>

          <h4 className="text-sm font-semibold text-foreground mb-3">Homme (Carré)</h4>
          <div className="flex flex-wrap gap-6 mb-8">
            {PATHOLOGY_FILL_DEMOS.map((demo, i) => (
              <div key={`m-${i}`} className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-4">
                <MemberIcon gender="male" pathologyColors={demo.colors} size={64} className="text-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">{demo.colors.length} pathologie{demo.colors.length !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-foreground mb-3">Femme (Cercle)</h4>
          <div className="flex flex-wrap gap-6 mb-8">
            {PATHOLOGY_FILL_DEMOS.map((demo, i) => (
              <div key={`f-${i}`} className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-4">
                <MemberIcon gender="female" pathologyColors={demo.colors} size={64} className="text-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">{demo.colors.length} pathologie{demo.colors.length !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-foreground mb-3">Combiné avec symboles</h4>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-4">
              <MemberIcon gender="male" isTransgender pathologyColors={[PATHO_COLORS[0]]} size={64} className="text-foreground" />
              <span className="text-[10px] text-muted-foreground">Trans + 1 patho</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-4">
              <MemberIcon gender="male" isTransgender pathologyColors={[PATHO_COLORS[2], PATHO_COLORS[0]]} size={64} className="text-foreground" />
              <span className="text-[10px] text-muted-foreground">Trans + 2 patho</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-4">
              <MemberIcon gender="female" isTransgender isBisexual pathologyColors={[PATHO_COLORS[2], PATHO_COLORS[0]]} size={64} className="text-foreground" />
              <span className="text-[10px] text-muted-foreground">Trans+Bi + 2 patho</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-card rounded-xl border border-border p-4">
              <MemberIcon gender="female" isTransgender isBisexual isDead pathologyColors={[PATHO_COLORS[2], PATHO_COLORS[0]]} size={64} className="text-foreground" />
              <span className="text-[10px] text-muted-foreground">Trans+Bi+Dead + 2</span>
            </div>
          </div>
        </SubSection>

        {/* Pregnancy / Miscarriage / Abortion / Stillbirth symbols */}
        <SubSection title="Symboles périnataux (Grossesse, Interruption spontanée de grossesse, IVG, Mortinaissance)">
          <p className="text-sm text-muted-foreground mb-4">
            Symboles triangulaires et croisés utilisés pour les événements périnataux dans le génogramme.
          </p>
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="grid grid-cols-5 gap-6">
              {/* Grossesse — simple triangle */}
              <div className="flex flex-col items-center gap-3">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="text-foreground">
                  <polygon points="36,8 66,64 6,64" stroke="currentColor" strokeWidth="2.5" fill="white" strokeLinejoin="miter" />
                </svg>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground">Grossesse</span>
                  <p className="text-[10px] text-muted-foreground">pregnancy</p>
                </div>
              </div>

              {/* Interruption spontanée de grossesse — triangle + X qui dépasse */}
              <div className="flex flex-col items-center gap-3">
                <svg width="72" height="72" viewBox="-4 -4 48 48" fill="none" className="text-foreground">
                  <polygon points="20,0 40,40 0,40" stroke="currentColor" strokeWidth="2" fill="white" strokeLinejoin="miter" />
                  <line x1="-2" y1="42" x2="42" y2="-2" stroke="currentColor" strokeWidth="2" />
                  <line x1="42" y1="42" x2="-2" y2="-2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground">ISG</span>
                  <p className="text-[10px] text-muted-foreground">miscarriage</p>
                </div>
              </div>

              {/* IVG — triangle + X qui dépasse + ligne horizontale */}
              <div className="flex flex-col items-center gap-3">
                <svg width="72" height="72" viewBox="-4 -4 48 48" fill="none" className="text-foreground">
                  <polygon points="20,0 40,40 0,40" stroke="currentColor" strokeWidth="2" fill="white" strokeLinejoin="miter" />
                  <line x1="-2" y1="42" x2="42" y2="-2" stroke="currentColor" strokeWidth="2" />
                  <line x1="42" y1="42" x2="-2" y2="-2" stroke="currentColor" strokeWidth="2" />
                  <line x1="-2" y1="20" x2="42" y2="20" stroke="currentColor" strokeWidth="2" />
                </svg>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground">IVG</span>
                  <p className="text-[10px] text-muted-foreground">abortion</p>
                </div>
              </div>

              {/* Mortinaissance Homme — petit carré + X qui dépasse */}
              <div className="flex flex-col items-center gap-3">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="text-foreground">
                  <rect x="20" y="20" width="32" height="32" stroke="currentColor" strokeWidth="2.5" fill="white" />
                  <line x1="14" y1="14" x2="58" y2="58" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="58" y1="14" x2="14" y2="58" stroke="currentColor" strokeWidth="2.5" />
                </svg>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground">Mort-né (H)</span>
                  <p className="text-[10px] text-muted-foreground">stillbirth · male</p>
                </div>
              </div>

              {/* Mort-né Femme — petit cercle + X qui dépasse */}
              <div className="flex flex-col items-center gap-3">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="text-foreground">
                  <circle cx="36" cy="36" r="16" stroke="currentColor" strokeWidth="2.5" fill="white" />
                  <line x1="14" y1="14" x2="58" y2="58" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="58" y1="14" x2="14" y2="58" stroke="currentColor" strokeWidth="2.5" />
                </svg>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground">Mort-né (F)</span>
                  <p className="text-[10px] text-muted-foreground">stillbirth · female</p>
                </div>
              </div>
            </div>
          </div>
        </SubSection>

        {/* Member Card with Icon */}
        <SubSection title="Carte Membre (MemberCard / Node)">
          <p className="text-sm text-muted-foreground mb-4">Composant complet avec MemberIcon + infos. L'icône change selon genre, orientation, identité et statut vital.</p>
          <div className="dot-grid rounded-2xl border border-border p-8">
            <div className="flex flex-wrap gap-8 items-start">
              {[
                dsMember({ firstName: 'François', age: 39, birthYear: 1889, profession: 'Ingénieur', gender: 'male' }),
                dsMember({ firstName: 'Hélène', age: 33, birthYear: 1992, profession: 'Product Designer', gender: 'female' }),
                dsMember({ firstName: 'Philippe', age: 58, birthYear: 1963, deathYear: 2018, profession: 'Dentiste', gender: 'male', pathologies: ['cardiovascular', 'depression'] }),
                dsMember({ firstName: 'Elisabeth', age: 63, birthYear: 1962, profession: 'Psychologue', gender: 'female', pathologies: ['cancer'], isTransgender: true }),
                dsMember({ firstName: 'Jona', age: 28, birthYear: 1996, profession: 'Psychologue', gender: 'female', isGay: true }),
              ].map(m => (
                <MemberCard key={m.id} member={m} static />
              ))}
            </div>
          </div>
        </SubSection>

        {/* Member Card States */}
        <SubSection title="Carte Membre — 4 États interactifs">
          <p className="text-sm text-muted-foreground mb-4">
            Chaque carte possède 4 états UI : <strong>Default</strong> (bordure grise, pas d'ombre),{' '}
            <strong>Hover</strong> (bordure violette + halo),{' '}
            <strong>Selected</strong> (halo + ancres outline + boutons d'action),{' '}
            <strong>Anchor-active</strong> (ancres pleines, mode drag activé).
          </p>
          <div className="dot-grid rounded-2xl border border-border p-12">
            <div className="grid grid-cols-2 gap-x-16 gap-y-20">
              {(['default', 'hover', 'selected', 'anchor-active'] as const).map(st => (
                <div key={st} className="flex flex-col items-start gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    State: {st}
                  </span>
                  <MemberCard
                    member={dsMember({
                      firstName: 'Firstname',
                      age: 24,
                      birthYear: 1962,
                      deathYear: 1998,
                      profession: 'Data analyste',
                      gender: 'male',
                      pathologies: ['depression'],
                      isTransgender: true,
                    })}
                    state={st}
                    static
                  />
                </div>
              ))}
            </div>
          </div>
        </SubSection>

        {/* Lateralsheet */}
        <SubSection title="Lateralsheet (Panneau latéral droit)">
          <p className="text-sm text-muted-foreground mb-4">Panneau contextuel qui s'ouvre à droite pour éditer un membre. Ombre douce, border-radius large.</p>
          <div className="flex gap-6">
            <div className="bg-card rounded-3xl shadow-modal border border-border w-[340px] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Modification</h3>
                <button className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Avatar preview */}
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-border bg-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">♀</span>
                  </div>
                </div>
                {/* Gender toggle */}
                <div className="bg-muted rounded-full p-1 flex">
                  <button className="flex-1 py-1.5 text-xs font-medium rounded-full text-muted-foreground">Homme</button>
                  <button className="flex-1 py-1.5 text-xs font-semibold rounded-full bg-foreground text-card">Femme</button>
                </div>
                {/* Fields */}
                <div className="space-y-3">
                  {[
                    { label: 'Lien relationnel', value: 'Frère / Sœur' },
                    { label: 'Prénom', value: 'Elisabeth' },
                    { label: 'Profession', value: 'Psychologue' },
                    { label: 'Date de naissance', value: '12/03/1962' },
                    { label: 'Date de décès', value: '' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-xs font-semibold text-foreground mb-1 block">{f.label}</label>
                      <div className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground">
                        {f.value || <span className="text-muted-foreground/50">—</span>}
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Conditions</label>
                    <div className="px-3 py-2 text-sm bg-background border border-border rounded-lg flex items-center justify-between cursor-pointer">
                      <span className="text-muted-foreground/60">Voir les conditions</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <Button variant="default" className="w-full mt-2">Créer</Button>
              </div>
            </div>
          </div>
        </SubSection>

        {/* Modal */}
        <SubSection title="Modale (Nouveau Membre / Nouveau Fichier)">
          <p className="text-sm text-muted-foreground mb-4">Modale centrée avec overlay grisé. border-radius: 24px, shadow-modal.</p>
          <div className="relative rounded-2xl border border-border overflow-hidden h-[400px] bg-background/50">
            {/* Fake overlay */}
            <div className="absolute inset-0 bg-foreground/10" />
            {/* Modal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-3xl shadow-modal border border-border w-[440px] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground text-lg">Nouveau membre</h3>
                <button className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-muted rounded-full p-1 flex">
                  <button className="flex-1 py-2 text-sm font-semibold rounded-full bg-foreground text-card">Homme</button>
                  <button className="flex-1 py-2 text-sm font-medium rounded-full text-muted-foreground">Femme</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Prénom *</label>
                    <input type="text" defaultValue="François" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Nom</label>
                    <input type="text" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg placeholder:text-muted-foreground/50" placeholder="Margary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Profession</label>
                  <input type="text" defaultValue="Ingénieur" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1">Annuler</Button>
                  <Button variant="default" className="flex-1">Créer un génogramme</Button>
                </div>
              </div>
            </div>
          </div>
        </SubSection>

        {/* Sidebar structure */}
        <SubSection title="Barre latérale gauche (Sidebar)">
          <p className="text-sm text-muted-foreground mb-4">Structure repliable avec sections : Membres, Pathologies (pastilles couleur), Liens familiaux, Liens émotionnels.</p>
          <div className="bg-card rounded-2xl border border-border w-[280px] overflow-hidden shadow-card">
            {/* Header */}
            <div className="px-4 py-4 border-b border-border">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-1">
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
              <h2 className="font-semibold text-foreground">Nouveau fichier</h2>
            </div>
            {/* Members */}
            <SidebarSection title="Membres" count={3} defaultOpen>
              <div className="space-y-1">
                {['Hélène Margary', 'Elisabeth Jouanolle', 'Philippe Margary'].map(n => (
                  <div key={n} className="flex items-center gap-2 py-1 text-sm text-foreground/80 hover:text-foreground cursor-pointer">
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            </SidebarSection>
            {/* Pathologies */}
            <SidebarSection title="Pathologies" defaultOpen>
              <div className="space-y-2">
                {PATHOLOGIES.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(var(--pathology-${p.id}))` }} />
                    <span className="text-foreground/80">{p.name}</span>
                  </div>
                ))}
              </div>
            </SidebarSection>
            {/* Family Links */}
            <SidebarSection title="Liens familiaux">
              <div className="space-y-2">
                {FAMILY_LINK_TYPES.map(l => (
                  <div key={l.id} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="w-4 text-center">{l.icon}</span>
                    <span>{l.label}</span>
                  </div>
                ))}
              </div>
            </SidebarSection>
            {/* Emotional Links */}
            <SidebarSection title="Liens émotionnels">
              <div className="space-y-2">
                {EMOTIONAL_LINK_TYPES.slice(0, 4).map(l => (
                  <div key={l.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">{l.label}</span>
                    <div className="w-14 h-[3px] rounded" style={{ backgroundColor: `hsl(var(--link-${l.id}))` }} />
                  </div>
                ))}
              </div>
            </SidebarSection>
          </div>
        </SubSection>

        {/* Floating Controls */}
        <SubSection title="Contrôles flottants (Canvas bottom)">
          <p className="text-sm text-muted-foreground mb-4">Groupe de boutons flottants positionnés en bas-centre du canevas.</p>
          <div className="dot-grid rounded-2xl border border-border p-12 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-card rounded-full shadow-float border border-border p-1.5">
                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <Pencil className="w-4 h-4 text-foreground" />
                </button>
                <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-1 bg-card rounded-full shadow-float border border-border p-1.5">
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </SubSection>

        {/* Header bar */}
        <SubSection title="Header (Barre de navigation)">
          <p className="text-sm text-muted-foreground mb-4">Logo + Undo/Redo, barre de recherche centrale, Export PDF + Partager.</p>
          <div className="rounded-2xl border border-border overflow-hidden shadow-card">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <span className="text-card text-xs font-bold">G</span>
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                  <button className="p-1.5 rounded-full hover:bg-accent transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                  </button>
                  <button className="p-1.5 rounded-full hover:bg-accent transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Rechercher un membre, une pathologie, un lien, etc..." className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-full focus:outline-none placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 rounded-full text-xs">
                  <Download className="w-3.5 h-3.5" />
                  Exporter en PDF
                </Button>
                <Button variant="brand" size="sm" className="gap-2 text-xs">
                  <Share2 className="w-3.5 h-3.5" />
                  Partager
                </Button>
              </div>
            </header>
          </div>
        </SubSection>

      </div>
    </div>
  );
};

// Pathology hex colors for demo grids
const PATHO_COLORS = [
  'hsl(var(--pathology-depression))',   // violet
  'hsl(var(--pathology-cancer))',       // blue
  'hsl(var(--pathology-addiction))',     // green
  'hsl(var(--pathology-bipolar))',      // orange
];

const PATHOLOGY_FILL_DEMOS = [
  { colors: [] as string[] },
  { colors: [PATHO_COLORS[1]] },
  { colors: [PATHO_COLORS[0], PATHO_COLORS[1]] },
  { colors: [PATHO_COLORS[3], PATHO_COLORS[0], PATHO_COLORS[1]] },
  { colors: [PATHO_COLORS[3], PATHO_COLORS[2], PATHO_COLORS[0], PATHO_COLORS[1]] },
];

// Reference grid: exact 12 variants from the screenshot (4 cols × 3 rows)
const MALE_REFERENCE_GRID = [
  { gay: false, transgender: false, bisexual: false, dead: false, label: 'Base' },
  { gay: false, transgender: true,  bisexual: false, dead: false, label: 'Transgenre' },
  { gay: false, transgender: false, bisexual: false, dead: true,  label: 'Décédé' },
  { gay: false, transgender: true,  bisexual: false, dead: true,  label: 'Trans + Décédé' },
  { gay: true,  transgender: false, bisexual: false, dead: false, label: 'Gay' },
  { gay: true,  transgender: true,  bisexual: false, dead: false, label: 'Gay + Trans' },
  { gay: true,  transgender: false, bisexual: false, dead: true,  label: 'Gay + Décédé' },
  { gay: true,  transgender: true,  bisexual: false, dead: true,  label: 'Gay + Trans + Décédé' },
  { gay: false, transgender: false, bisexual: true,  dead: false, label: 'Bisexuel' },
  { gay: false, transgender: true,  bisexual: true,  dead: false, label: 'Bi + Trans' },
  { gay: false, transgender: false, bisexual: true,  dead: true,  label: 'Bi + Décédé' },
  { gay: false, transgender: true,  bisexual: true,  dead: true,  label: 'Bi + Trans + Décédé' },
];

// ================== Helpers ==================

function generateCombinations(_gender: 'male' | 'female') {
  const bools = [false, true];
  const combos: { gay: boolean; transgender: boolean; bisexual: boolean; dead: boolean }[] = [];
  for (const gay of bools) {
    for (const transgender of bools) {
      for (const bisexual of bools) {
        for (const dead of bools) {
          if (gay && bisexual) continue;
          combos.push({ gay, transgender, bisexual, dead });
        }
      }
    }
  }
  return combos;
}


const SidebarSection: React.FC<{
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, count, defaultOpen = false, children }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 transition-colors"
      >
        <span>{title}{count !== undefined ? ` (${count})` : ''}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
        }
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
};

export default DesignSystemPage;
