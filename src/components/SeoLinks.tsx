import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getSeoLinks, type PageKey, type LocaleCode } from '@/lib/hreflang';

interface SeoLinksProps {
  pageKey: PageKey;
  locale?: LocaleCode;
}

/**
 * Renders <link rel="canonical"> and <link rel="alternate" hreflang> tags inside <Helmet>.
 * Always include this on a public page so Google indexes the right URL per locale.
 */
const SeoLinks: React.FC<SeoLinksProps> = ({ pageKey, locale = 'fr' }) => {
  const { canonical, alternates } = getSeoLinks(pageKey, locale);
  return (
    <Helmet>
      <link rel="canonical" href={canonical} />
      {alternates.map((alt) => (
        <link key={`${alt.hreflang}-${alt.href}`} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}
    </Helmet>
  );
};

export default SeoLinks;
