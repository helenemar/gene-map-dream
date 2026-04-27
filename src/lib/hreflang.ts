// Centralized SEO mapping between FR (default), EN and DE versions of each public page.
// Used to emit consistent <link rel="canonical"> and <link rel="alternate" hreflang="..."> tags.

export const SITE_URL = 'https://www.genogy-app.com';

export type LocaleCode = 'fr' | 'en' | 'de';

export interface LocaleAlternates {
  fr?: string; // path starting with "/"
  en?: string;
  de?: string;
}

// Page key -> path per locale. A missing locale means the page is not translated yet.
export const PAGE_ALTERNATES: Record<string, LocaleAlternates> = {
  home: { fr: '/', en: '/en', de: '/de' },
  whatIs: { fr: '/genogramme', en: '/en/what-is-a-genogram', de: '/de/was-ist-ein-genogramm' },
  howTo: { fr: '/comment-faire-un-genogramme', en: '/en/how-to-create-a-genogram', de: '/de/genogramm-erstellen' },
  symbols: { fr: '/symboles-genogramme', en: '/en/genogram-symbols', de: '/de/genogramm-symbole' },
  psychology: { fr: '/genogramme-psychologie', en: '/en/genogram-psychology', de: '/de/genogramm-psychologie' },
  socialWork: { fr: '/genogramme-travail-social', en: '/en/genogram-social-work', de: '/de/genogramm-sozialarbeit' },
  resources: { fr: '/ressources', en: '/en/resources', de: '/de/ressourcen' },
  firstSession: { fr: '/ressources/genogramme-premiere-seance', en: '/en/resources/first-session-genogram', de: '/de/ressourcen/genogramm-erste-sitzung' },
  clinicalExample: { fr: '/ressources/exemple-genogramme-clinique', en: '/en/resources/clinical-genogram-example', de: '/de/ressourcen/klinisches-genogramm-beispiel' },
  socialCase: { fr: '/ressources/genogramme-travail-social-cas-pratique', en: '/en/resources/social-work-genogram-case-study', de: '/de/ressourcen/genogramm-sozialarbeit-fallbeispiel' },
  privacy: { fr: '/privacy' },
  terms: { fr: '/terms' },
  disclaimer: { fr: '/disclaimer' },
  legal: { fr: '/legal' },
};

export type PageKey = keyof typeof PAGE_ALTERNATES;

export const buildAbsoluteUrl = (path: string) => `${SITE_URL}${path}`;

/**
 * Returns the list of <link> tags (canonical + hreflang alternates) for a given page and current locale.
 * Use it inside a <Helmet> wrapper.
 */
export const getSeoLinks = (pageKey: PageKey, currentLocale: LocaleCode = 'fr') => {
  const alternates = PAGE_ALTERNATES[pageKey];
  if (!alternates) return { canonical: SITE_URL, alternates: [] as Array<{ hreflang: string; href: string }> };

  const currentPath = alternates[currentLocale] ?? alternates.fr ?? '/';
  const canonical = buildAbsoluteUrl(currentPath);

  const altList: Array<{ hreflang: string; href: string }> = [];
  (Object.keys(alternates) as LocaleCode[]).forEach((loc) => {
    const p = alternates[loc];
    if (p) altList.push({ hreflang: loc, href: buildAbsoluteUrl(p) });
  });
  // x-default → French version (or fallback to home)
  altList.push({ hreflang: 'x-default', href: buildAbsoluteUrl(alternates.fr ?? '/') });

  return { canonical, alternates: altList };
};
