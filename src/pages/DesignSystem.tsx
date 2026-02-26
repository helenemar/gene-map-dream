import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Plus, UserPlus, Pencil, ZoomIn, ZoomOut, X, Search, ChevronDown, ChevronUp, ArrowLeft, Link } from 'lucide-react';
import { PATHOLOGIES, FAMILY_LINK_TYPES, EMOTIONAL_LINK_TYPES } from '@/types/genogram';
import MemberIcon from '@/components/MemberIcon';
import type { MemberCardState } from '@/components/MemberCard';

/* ============================================================
   Design System – Genogy
   Source of truth for all visual components.
   Route: /design-system (manual access only)
   ============================================================ */

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
            <ColorSwatch name="Primary (Violet)" cssVar="primary" hex="#6366F1" />
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
        <SubSection title="Border Radius">
          <div className="flex flex-wrap gap-6">
            {[
              { name: 'sm', val: 'calc(0.75rem - 4px)', px: '8px' },
              { name: 'md', val: 'calc(0.75rem - 2px)', px: '10px' },
              { name: 'lg (default)', val: '0.75rem', px: '12px' },
              { name: 'xl', val: 'calc(0.75rem + 4px)', px: '16px' },
              { name: '2xl', val: '1rem', px: '16px' },
              { name: 'full', val: '9999px', px: '∞' },
            ].map(r => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 bg-primary/10 border-2 border-primary/30"
                  style={{ borderRadius: r.val }}
                />
                <span className="text-xs font-semibold text-foreground">{r.name}</span>
                <code className="text-[10px] text-muted-foreground">{r.px}</code>
              </div>
            ))}
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
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
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
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Date de naissance</label>
                <input
                  type="text"
                  placeholder="25/08/1989"
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
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
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/50 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
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

        {/* Relationship Lines (SVG) */}
        <SubSection title="Lignes de relation (SVG)">
          <p className="text-sm text-muted-foreground mb-4">Chaque style de ligne utilisé dans le canevas pour représenter les liens.</p>
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="space-y-6">
              {/* Standard / Couple */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <line x1="0" y1="12" x2="120" y2="12" stroke="hsl(var(--foreground))" strokeWidth="2" strokeOpacity="0.3" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Continue (standard)</span>
                  <p className="text-xs text-muted-foreground">Couple / Relation</p>
                </div>
              </div>

              {/* Parent-child */}
              <div className="flex items-center gap-6">
                <svg width="120" height="40" className="shrink-0">
                  <path d="M 10 5 V 20 H 110 V 35" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeOpacity="0.2" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Angle droit (parent-enfant)</span>
                  <p className="text-xs text-muted-foreground">Filiation verticale puis horizontale</p>
                </div>
              </div>

              {/* Fusional */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <line x1="0" y1="10" x2="120" y2="10" stroke="hsl(var(--link-fusional))" strokeWidth="3" />
                  <line x1="0" y1="14" x2="120" y2="14" stroke="hsl(var(--link-fusional))" strokeWidth="3" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Double trait vert (fusionnel)</span>
                  <p className="text-xs text-muted-foreground">Relation fusionnelle</p>
                </div>
              </div>

              {/* Distant */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <line x1="0" y1="12" x2="120" y2="12" stroke="hsl(var(--link-distant))" strokeWidth="2" strokeDasharray="6 4" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Pointillé rouge (distant)</span>
                  <p className="text-xs text-muted-foreground">Relation distante</p>
                </div>
              </div>

              {/* Conflictual */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <line x1="0" y1="8" x2="120" y2="8" stroke="hsl(var(--link-conflictual))" strokeWidth="2" />
                  <line x1="0" y1="16" x2="120" y2="16" stroke="hsl(var(--link-conflictual))" strokeWidth="2" />
                  <line x1="55" y1="2" x2="65" y2="22" stroke="hsl(var(--link-conflictual))" strokeWidth="2" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Double trait rouge barré (conflictuel)</span>
                  <p className="text-xs text-muted-foreground">Relation conflictuelle</p>
                </div>
              </div>

              {/* Ambivalent / Zigzag */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <polyline
                    points="0,12 10,4 20,20 30,4 40,20 50,4 60,20 70,4 80,20 90,4 100,20 110,4 120,12"
                    fill="none"
                    stroke="hsl(var(--link-ambivalent))"
                    strokeWidth="2"
                  />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Zigzag / Wavy (ambivalent)</span>
                  <p className="text-xs text-muted-foreground">Tension / Ambivalence</p>
                </div>
              </div>

              {/* Negligent */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <line x1="0" y1="12" x2="120" y2="12" stroke="hsl(var(--link-negligent))" strokeWidth="2" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Ligne bleue (négligent)</span>
                  <p className="text-xs text-muted-foreground">Relation négligente</p>
                </div>
              </div>

              {/* Coercive */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <line x1="0" y1="12" x2="100" y2="12" stroke="hsl(var(--link-coercive))" strokeWidth="2" />
                  <polygon points="100,6 120,12 100,18" fill="hsl(var(--link-coercive))" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Ligne avec flèche (contrôlant)</span>
                  <p className="text-xs text-muted-foreground">Relation de contrôle / coercition</p>
                </div>
              </div>

              {/* Cut-off */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <line x1="0" y1="12" x2="50" y2="12" stroke="hsl(var(--link-cutoff))" strokeWidth="3" />
                  <line x1="45" y1="4" x2="55" y2="20" stroke="hsl(var(--link-cutoff))" strokeWidth="2" />
                  <line x1="50" y1="4" x2="60" y2="20" stroke="hsl(var(--link-cutoff))" strokeWidth="2" />
                  <line x1="65" y1="12" x2="120" y2="12" stroke="hsl(var(--link-cutoff))" strokeWidth="3" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Barres parallèles (lien rompu)</span>
                  <p className="text-xs text-muted-foreground">Coupure relationnelle</p>
                </div>
              </div>

              {/* Violence */}
              <div className="flex items-center gap-6">
                <svg width="120" height="24" className="shrink-0">
                  <line x1="0" y1="12" x2="120" y2="12" stroke="hsl(var(--link-violence))" strokeWidth="3" />
                  <line x1="35" y1="4" x2="45" y2="20" stroke="hsl(var(--link-violence))" strokeWidth="2" />
                  <line x1="55" y1="4" x2="65" y2="20" stroke="hsl(var(--link-violence))" strokeWidth="2" />
                  <line x1="75" y1="4" x2="85" y2="20" stroke="hsl(var(--link-violence))" strokeWidth="2" />
                </svg>
                <div>
                  <span className="text-sm font-semibold text-foreground">Triple barré (violence)</span>
                  <p className="text-xs text-muted-foreground">Violence dans la relation</p>
                </div>
              </div>
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

        {/* Member Card with Icon */}
        <SubSection title="Carte Membre (MemberCard / Node)">
          <p className="text-sm text-muted-foreground mb-4">Composant complet avec MemberIcon + infos. L'icône change selon genre, orientation, identité et statut vital.</p>
          <div className="dot-grid rounded-2xl border border-border p-8">
            <div className="flex flex-wrap gap-8 items-start">
              <MemberCardDemo name="François" age={39} birthYear={1889} profession="Ingénieur" gender="male" pathologies={[]} />
              <MemberCardDemo name="Hélène" age={33} birthYear={1992} profession="Product Designer" gender="female" pathologies={[]} />
              <MemberCardDemo name="Philippe" age={58} birthYear={1963} deathYear={2018} profession="Dentiste" gender="male" pathologies={['cardiovascular', 'depression']} isDead />
              <MemberCardDemo name="Elisabeth" age={63} birthYear={1962} profession="Psychologue" gender="female" pathologies={['cancer']} isTransgender />
              <MemberCardDemo name="Jona" age={28} birthYear={1996} profession="Psychologue" gender="female" pathologies={[]} selected isGay />
            </div>
          </div>
        </SubSection>

        {/* Member Card States */}
        <SubSection title="Carte Membre — États interactifs (States)">
          <p className="text-sm text-muted-foreground mb-4">
            Chaque carte possède 4 états UI : <strong>Default</strong>, <strong>Hover</strong> (bordure violette),
            <strong> Edition</strong> (ancres + boutons flottants) et <strong>Linkable</strong> (ancres + icône chaînage).
          </p>
          <div className="dot-grid rounded-2xl border border-border p-12">
            <div className="grid grid-cols-2 gap-x-16 gap-y-20">
              {(['default', 'hover', 'edition', 'linkable'] as const).map(st => (
                <div key={st} className="flex flex-col items-start gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    State: {st}
                  </span>
                  <MemberCardStatic
                    name="Firstname"
                    age={24}
                    birthYear={1962}
                    deathYear={1998}
                    profession="Data analyste"
                    gender="male"
                    pathologies={['depression']}
                    isTransgender
                    state={st}
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
                  <input type="text" placeholder="Rechercher un membre, une pathologie, un lien, etc..." className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-full focus:outline-none placeholder:text-muted-foreground/50" />
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

// ================== Sub-components for the DS page ==================

const MemberCardDemo: React.FC<{
  name: string;
  age: number;
  birthYear: number;
  deathYear?: number;
  profession: string;
  gender: 'male' | 'female';
  pathologies: string[];
  selected?: boolean;
  isDead?: boolean;
  isGay?: boolean;
  isBisexual?: boolean;
  isTransgender?: boolean;
}> = ({ name, age, birthYear, deathYear, profession, gender, pathologies, selected, isDead, isGay, isBisexual, isTransgender }) => {
  const isDeceased = !!deathYear || isDead;
  const matchedPathologies = PATHOLOGIES.filter(p => pathologies.includes(p.id));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center gap-3 ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''} rounded-xl p-2 bg-card border border-border shadow-card transition-shadow`}>
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
          <MemberIcon gender={gender} isGay={isGay} isBisexual={isBisexual} isTransgender={isTransgender} isDead={isDeceased} pathologyColors={matchedPathologies.map(p => `hsl(var(--pathology-${p.id}))`)} size={48} className="text-foreground" />
        </div>
        <div className="whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{name}</span>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{age} ans</span>
          </div>
          <div className="text-xs text-muted-foreground">{birthYear}{deathYear ? ` - ${deathYear}` : ' -'}</div>
          <div className="text-xs text-muted-foreground">{profession}</div>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">
        {gender === 'male' ? '♂ Homme' : '♀ Femme'}
        {isDeceased ? ' · Décédé' : ''}
        {isGay ? ' · Gay' : ''}{isBisexual ? ' · Bi' : ''}{isTransgender ? ' · Trans' : ''}
        {selected ? ' · Sélectionné' : ''}
      </span>
    </div>
  );
};

// Static MemberCard with state rendering (for design system showcase — not positioned absolute)
const MemberCardStatic: React.FC<{
  name: string;
  age: number;
  birthYear: number;
  deathYear?: number;
  profession: string;
  gender: 'male' | 'female';
  pathologies: string[];
  isDead?: boolean;
  isGay?: boolean;
  isBisexual?: boolean;
  isTransgender?: boolean;
  state?: MemberCardState;
}> = ({ name, age, birthYear, deathYear, profession, gender, pathologies, isDead, isGay, isBisexual, isTransgender, state = 'default' }) => {
  const isDeceased = !!deathYear || isDead;
  const matchedPathologies = PATHOLOGIES.filter(p => pathologies.includes(p.id));

  const showRing = state === 'hover' || state === 'edition' || state === 'linkable';
  const showAnchors = state === 'edition' || state === 'linkable';
  const showActions = state === 'edition';
  const showLinkIcon = state === 'linkable';

  return (
    <div className="relative inline-block">
      {/* Anchor points */}
      {showAnchors && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10" />
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10" />
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card z-10" />
        </>
      )}

      {/* Card body */}
      <div className={`relative flex items-center gap-3 rounded-xl p-2 bg-card border shadow-card transition-all ${showRing ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}>
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
          <MemberIcon gender={gender} isGay={isGay} isBisexual={isBisexual} isTransgender={isTransgender} isDead={isDeceased} pathologyColors={matchedPathologies.map(p => `hsl(var(--pathology-${p.id}))`)} size={48} className="text-foreground" />
        </div>
        <div className="whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{name}</span>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{age} ans</span>
          </div>
          <div className="text-xs text-muted-foreground">{birthYear}{deathYear ? ` - ${deathYear}` : ' -'}</div>
          <div className="text-xs text-muted-foreground">{profession}</div>
        </div>
        {showLinkIcon && (
          <div className="ml-1 w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Link className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Floating action buttons */}
      {showActions && (
        <div className="flex items-center gap-2 justify-center mt-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Create related member
          </button>
          <button className="w-8 h-8 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-accent transition-colors">
            <Pencil className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

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
