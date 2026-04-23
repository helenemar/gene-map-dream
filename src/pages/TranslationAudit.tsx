import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, CheckCircle2, Languages } from 'lucide-react';
import { fr } from '@/i18n/fr';
import { en } from '@/i18n/en';
import { de } from '@/i18n/de';

type Locale = 'en' | 'de';

type RouteAudit = {
  fr: string;
  en?: string;
  de?: string;
  label: string;
  section: string;
  priority: 'P0' | 'P1' | 'P2';
  seoWeight: number;
  reason: string;
};

const publicRoutes: RouteAudit[] = [
  { label: 'Accueil', section: 'Landing', fr: '/', en: '/en', de: '/de', priority: 'P0', seoWeight: 100, reason: 'Page d’entrée principale, requêtes marque + génogrammes en ligne.' },
  { label: 'Définition du génogramme', section: 'Guides', fr: '/genogramme', en: '/en/what-is-a-genogram', de: '/de/was-ist-ein-genogramm', priority: 'P0', seoWeight: 95, reason: 'Intention informationnelle forte sur la définition du génogramme.' },
  { label: 'Comment faire un génogramme', section: 'Guides', fr: '/comment-faire-un-genogramme', en: '/en/how-to-create-a-genogram', de: '/de/genogramm-erstellen', priority: 'P0', seoWeight: 92, reason: 'Requête tutorielle à fort potentiel de conversion vers l’outil.' },
  { label: 'Symboles McGoldrick', section: 'Pages SEO', fr: '/symboles-genogramme', en: '/en/genogram-symbols', de: '/de/genogramm-symbole', priority: 'P0', seoWeight: 88, reason: 'Recherche spécialisée avec intention clinique et longue traîne.' },
  { label: 'Psychologie', section: 'Pages SEO', fr: '/genogramme-psychologie', en: '/en/genogram-psychology', de: '/de/genogramm-psychologie', priority: 'P1', seoWeight: 78, reason: 'Audience professionnelle pertinente, volume estimé intermédiaire.' },
  { label: 'Travail social', section: 'Pages SEO', fr: '/genogramme-travail-social', en: '/en/genogram-social-work', de: '/de/genogramm-sozialarbeit', priority: 'P1', seoWeight: 76, reason: 'Segment métier qualifié, utile pour capter les usages institutionnels.' },
  { label: 'Ressources', section: 'Ressources', fr: '/ressources', en: '/en/resources', de: '/de/ressourcen', priority: 'P1', seoWeight: 70, reason: 'Hub interne qui redistribue l’autorité vers les articles.' },
  { label: 'Article exemple clinique', section: 'Ressources', fr: '/ressources/exemple-genogramme-clinique', en: '/en/resources/clinical-genogram-example', de: '/de/ressourcen/klinisches-genogramm-beispiel', priority: 'P1', seoWeight: 66, reason: 'Longue traîne clinique avec forte pertinence métier.' },
  { label: 'Article première séance', section: 'Ressources', fr: '/ressources/genogramme-premiere-seance', en: '/en/resources/first-session-genogram', de: '/de/ressourcen/genogramm-erste-sitzung', priority: 'P2', seoWeight: 58, reason: 'Contenu de soutien pour thérapeutes, potentiel plus ciblé.' },
  { label: 'Article cas travail social', section: 'Ressources', fr: '/ressources/genogramme-travail-social-cas-pratique', en: '/en/resources/social-work-genogram-case-study', de: '/de/ressourcen/genogramm-sozialarbeit-fallbeispiel', priority: 'P2', seoWeight: 55, reason: 'Cas pratique utile, mais moins prioritaire que les pages piliers.' },
  { label: 'Confidentialité', section: 'Légal', fr: '/privacy', priority: 'P2', seoWeight: 25, reason: 'Important pour la confiance, faible acquisition SEO directe.' },
  { label: 'Conditions d’utilisation', section: 'Légal', fr: '/terms', priority: 'P2', seoWeight: 22, reason: 'Nécessaire pour cohérence publique, faible trafic organique estimé.' },
  { label: 'Avertissement légal', section: 'Légal', fr: '/disclaimer', priority: 'P2', seoWeight: 20, reason: 'Critique conformité, faible potentiel d’entrée SEO.' },
  { label: 'Mentions légales', section: 'Légal', fr: '/legal', priority: 'P2', seoWeight: 18, reason: 'Page obligatoire, priorité SEO basse.' },
];

const i18nCorrectionOrder = [
  'landing.seo, landing.hero, landing.cta',
  'guides.*.seo, guides.*.title, guides.*.sections',
  'seoPages.*.metaTitle, seoPages.*.metaDescription, seoPages.*.h1',
  'resources.index, resources.articles.*.seo, resources.articles.*.content',
  'navigation, footer, common CTAs',
  'legal.*.title, legal.*.metaDescription, legal.*.body',
  'Messages d’erreur, formulaires publics et libellés secondaires',
];

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const flattenKeys = (value: unknown, prefix = ''): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenKeys(item, `${prefix}[${index}]`));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key));
  }

  return prefix ? [prefix] : [];
};

const getValueAtPath = (source: unknown, path: string) => {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  return parts.reduce<unknown>((current, part) => {
    if (current == null) return undefined;
    return (current as Record<string, unknown>)[part];
  }, source);
};

const getMissingKeys = (target: unknown) => flattenKeys(fr).filter((key) => getValueAtPath(target, key) === undefined);

const getEmptyKeys = (target: unknown) => flattenKeys(target).filter((key) => {
  const value = getValueAtPath(target, key);
  return typeof value === 'string' && value.trim().length === 0;
});

const TranslationAudit: React.FC = () => {
  const audit = useMemo(() => {
    const localeResults: Record<Locale, { missing: string[]; empty: string[] }> = {
      en: { missing: getMissingKeys(en), empty: getEmptyKeys(en) },
      de: { missing: getMissingKeys(de), empty: getEmptyKeys(de) },
    };

    const untranslatedRoutes = publicRoutes.filter((route) => !route.en || !route.de);
    const priorityPlan = [...publicRoutes].sort((a, b) => b.seoWeight - a.seoWeight);
    const i18nIssues = (['en', 'de'] as Locale[]).flatMap((locale) => {
      const result = localeResults[locale];
      return [
        ...result.missing.map((key) => ({ locale, key, type: 'Manquante' as const })),
        ...result.empty.map((key) => ({ locale, key, type: 'Vide' as const })),
      ];
    });

    return { localeResults, untranslatedRoutes, priorityPlan, i18nIssues };
  }, []);

  return (
    <main className="min-h-screen bg-page-bg px-6 py-10 text-foreground">
      <Helmet>
        <title>Audit traductions Genogy</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Languages className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">International SEO</p>
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Audit des traductions publiques</h1>
          </div>
        </div>

        <section className="mb-8 grid gap-5 lg:grid-cols-3">
          {(['en', 'de'] as Locale[]).map((locale) => {
            const result = audit.localeResults[locale];
            const ok = result.missing.length === 0 && result.empty.length === 0;

            return (
              <article key={locale} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold uppercase">{locale}</h2>
                  {ok ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
                </div>
                <p className="text-sm text-muted-foreground">{result.missing.length} clés manquantes · {result.empty.length} valeurs vides</p>
              </article>
            );
          })}
          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Routes</h2>
              {audit.untranslatedRoutes.length === 0 ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
            </div>
            <p className="text-sm text-muted-foreground">{audit.untranslatedRoutes.length} pages publiques sans URL EN/DE complète</p>
          </article>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Plan de traduction priorisé SEO</h2>
          <p className="mb-5 text-sm text-muted-foreground">Priorisation estimée selon potentiel SEO, intention de recherche et rôle dans le maillage interne.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Ordre</th>
                  <th className="py-3 pr-4 font-semibold">Priorité</th>
                  <th className="py-3 pr-4 font-semibold">Page</th>
                  <th className="py-3 pr-4 font-semibold">Score SEO</th>
                  <th className="py-3 pr-4 font-semibold">Correction attendue</th>
                </tr>
              </thead>
              <tbody>
                {audit.priorityPlan.map((route, index) => {
                  const missingLocales = [!route.en ? 'EN' : null, !route.de ? 'DE' : null].filter(Boolean).join(', ');

                  return (
                    <tr key={`plan-${route.fr}`} className="border-b border-border/60 align-top">
                      <td className="py-3 pr-4 font-semibold">{index + 1}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{route.priority}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{route.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{route.reason}</p>
                      </td>
                      <td className="py-3 pr-4 font-semibold">{route.seoWeight}/100</td>
                      <td className="py-3 pr-4 text-muted-foreground">{missingLocales ? `Créer les URLs ${missingLocales}` : 'Vérifier contenu, title, meta description et hreflang'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Ordre de correction des clés i18n</h2>
          <p className="mb-5 text-sm text-muted-foreground">Corriger d’abord les clés visibles dans les SERP et les premières sections, puis descendre vers les contenus secondaires.</p>
          <ol className="grid gap-3 md:grid-cols-2">
            {i18nCorrectionOrder.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-md bg-page-bg p-4 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">{index + 1}</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-2xl font-bold">Pages publiques non traduites</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Section</th>
                  <th className="py-3 pr-4 font-semibold">Page</th>
                  <th className="py-3 pr-4 font-semibold">FR</th>
                  <th className="py-3 pr-4 font-semibold">EN</th>
                  <th className="py-3 pr-4 font-semibold">DE</th>
                </tr>
              </thead>
              <tbody>
                {audit.untranslatedRoutes.map((route) => (
                  <tr key={route.fr} className="border-b border-border/60">
                    <td className="py-3 pr-4 text-muted-foreground">{route.section}</td>
                    <td className="py-3 pr-4 font-medium">{route.label}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{route.fr}</td>
                    <td className="py-3 pr-4">{route.en ?? <span className="text-destructive">Manquant</span>}</td>
                    <td className="py-3 pr-4">{route.de ?? <span className="text-destructive">Manquant</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          {(['en', 'de'] as Locale[]).map((locale) => {
            const result = audit.localeResults[locale];
            const issues = [...result.missing.map((key) => `Manquante : ${key}`), ...result.empty.map((key) => `Vide : ${key}`)];

            return (
              <article key={locale} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-5 text-2xl font-bold uppercase">Clés i18n {locale}</h2>
                {issues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune clé manquante détectée par rapport au français.</p>
                ) : (
                  <ul className="max-h-[420px] space-y-2 overflow-auto pr-2 text-sm text-muted-foreground">
                    {issues.map((issue) => <li key={issue} className="rounded-md bg-page-bg px-3 py-2">{issue}</li>)}
                  </ul>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default TranslationAudit;
