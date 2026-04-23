import React, { lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, BriefcaseBusiness, CheckCircle2, GitFork, HeartPulse, HelpCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';

const AuthModal = lazy(() => import('@/components/AuthModal'));

const baseUrl = 'https://www.genogy-app.com';
const description = "Genogy est l'outil en ligne pour créer des génogrammes cliniques professionnels. Conçu pour psychologues, thérapeutes et travailleurs sociaux. Gratuit en bêta.";

type AuthView = 'login' | 'signup';

type FaqItem = { q: string; a: string };
type ExampleItem = { title: string; text: string };

const dedupeFaqItems = (items: FaqItem[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.q.trim().toLocaleLowerCase('fr-FR')}::${item.a.trim().toLocaleLowerCase('fr-FR')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildWebPageJsonLd = (title: string, canonicalPath: string, pageDescription: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${baseUrl}${canonicalPath}#webpage`,
  url: `${baseUrl}${canonicalPath}`,
  name: title,
  description: pageDescription,
  inLanguage: 'fr-FR',
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'Genogy',
    url: `${baseUrl}/`,
  },
  breadcrumb: { '@id': `${baseUrl}${canonicalPath}#breadcrumb` },
  primaryImageOfPage: `${baseUrl}/og-image.webp`,
});

const buildBreadcrumbJsonLd = (canonicalPath: string, currentName: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': `${baseUrl}${canonicalPath}#breadcrumb`,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: `${baseUrl}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Ressources',
      item: `${baseUrl}/ressources`,
    },
    ...(canonicalPath === '/ressources' ? [] : [{
      '@type': 'ListItem',
      position: 3,
      name: currentName,
      item: `${baseUrl}${canonicalPath}`,
    }]),
  ],
});

const SeoShell: React.FC<{
  title: string;
  canonicalPath: string;
  children: React.ReactNode;
}> = ({ title, canonicalPath, children }) => {
  const [authModal, setAuthModal] = useState<{ open: boolean; view: AuthView }>({ open: false, view: 'login' });
  const canonical = `${baseUrl}${canonicalPath}`;

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${baseUrl}/og-image.webp`} />
      </Helmet>
      <LandingHeader onAuth={(view) => setAuthModal({ open: true, view })} />
      {children}
      <Footer />
      {authModal.open && (
        <Suspense fallback={null}>
          <AuthModal
            open={authModal.open}
            onClose={() => setAuthModal({ ...authModal, open: false })}
            defaultView={authModal.view}
          />
        </Suspense>
      )}
    </div>
  );
};

const Hero: React.FC<{ eyebrow: string; title: string; intro: string; icon: React.ReactNode }> = ({ eyebrow, title, intro, icon }) => (
  <section className="border-b border-border bg-card">
    <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
      <div className="mb-4 flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-semibold uppercase tracking-wider">{eyebrow}</span>
      </div>
      <h1 className="mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
      <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
    </div>
  </section>
);

const FaqAndExamples: React.FC<{ examples: ExampleItem[]; faq: FaqItem[] }> = ({ examples, faq }) => (
  <section className="mx-auto max-w-5xl px-6 pb-16">
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="mb-5 flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <h2 className="text-2xl font-bold text-foreground">Exemples concrets</h2>
        </div>
        <div className="space-y-4">
          {examples.map((example) => (
            <article key={example.title} className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-2 font-bold text-foreground">{example.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{example.text}</p>
            </article>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-5 flex items-center gap-2 text-primary">
          <HelpCircle className="h-5 w-5" />
          <h2 className="text-2xl font-bold text-foreground">Questions fréquentes</h2>
        </div>
        <div className="space-y-4">
          {faq.map((item) => (
            <article key={item.q} className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-2 font-bold text-foreground">{item.q}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const ArticleLayout: React.FC<{
  title: string;
  canonicalPath: string;
  eyebrow: string;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
  examples: ExampleItem[];
  faq: FaqItem[];
}> = ({ title, canonicalPath, eyebrow, intro, sections, examples, faq }) => (
  <SeoShell title={`${title} | Genogy`} canonicalPath={canonicalPath}>
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': `${baseUrl}${canonicalPath}#faq`,
          mainEntity: dedupeFaqItems(faq).map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        })}
      </script>
    </Helmet>
    <Hero eyebrow={eyebrow} icon={<BookOpen className="h-5 w-5" />} title={title} intro={intro} />
    <main className="mx-auto max-w-4xl px-6 py-14">
      <article className="space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-4 text-2xl font-bold text-foreground">{section.heading}</h2>
            <div className="space-y-4 text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </main>
    <FaqAndExamples examples={examples} faq={faq} />
  </SeoShell>
);

const resources = [
  { title: 'Comment préparer un génogramme avant un entretien ?', path: '/comment-faire-un-genogramme', text: 'Les informations à recueillir, les générations à représenter et les pièges à éviter au démarrage.' },
  { title: 'Symboles McGoldrick : les bases à connaître', path: '/symboles-genogramme', text: 'Carrés, cercles, unions, séparations, décès, liens émotionnels et pathologies : le socle visuel du génogramme.' },
  { title: 'Génogramme clinique : usages en psychologie et travail social', path: '/genogramme-psychologie', text: 'Pourquoi la représentation familiale aide à formuler des hypothèses et à clarifier les dynamiques relationnelles.' },
  { title: 'Construire un génogramme en première séance', path: '/ressources/genogramme-premiere-seance', text: 'Une méthode étape par étape pour démarrer sans surcharger l’entretien ni perdre la dimension clinique.' },
  { title: 'Exemple de génogramme clinique commenté', path: '/ressources/exemple-genogramme-clinique', text: 'Un cas fictif détaillé pour comprendre comment lire les alliances, ruptures, ressources et répétitions.' },
  { title: 'Génogramme en travail social : cas pratique', path: '/ressources/genogramme-travail-social-cas-pratique', text: 'Comment structurer une situation familiale complexe pour une synthèse, une réunion ou une transmission.' },
];

export const ResourcesPage: React.FC = () => (
  <SeoShell title="Ressources génogramme — guides pratiques | Genogy" canonicalPath="/ressources">
    <Hero
      eyebrow="Ressources"
      icon={<BookOpen className="h-5 w-5" />}
      title="Guides pour comprendre et créer un génogramme en ligne"
      intro="Retrouvez les articles Genogy pour apprendre à structurer un génogramme clinique, choisir les bons symboles et présenter une carte familiale exploitable en entretien."
    />
    <main className="mx-auto max-w-5xl px-6 py-14 lg:py-18">
      <div className="grid gap-6 md:grid-cols-3">
        {resources.map((article) => (
          <article key={article.path} className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold leading-snug">{article.title}</h2>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{article.text}</p>
            <Link to={article.path} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Lire l’article <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </main>
  </SeoShell>
);

export const SymbolsGenogramPage: React.FC = () => (
  <SeoShell title="Symboles génogramme McGoldrick — guide complet | Genogy" canonicalPath="/symboles-genogramme">
    <Hero
      eyebrow="Symboles McGoldrick"
      icon={<GitFork className="h-5 w-5" />}
      title="Les symboles du génogramme : personnes, unions, filiations et liens émotionnels"
      intro="Un génogramme efficace repose sur des conventions visuelles stables. Cette page résume les symboles McGoldrick les plus utilisés dans les pratiques cliniques et médico-sociales."
    />
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="space-y-10 text-muted-foreground">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Symboles des personnes</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li><strong className="text-foreground">Carré</strong> — homme ou identité masculine.</li>
            <li><strong className="text-foreground">Cercle</strong> — femme ou identité féminine.</li>
            <li><strong className="text-foreground">Losange</strong> — genre non spécifié, intersexe ou information inconnue.</li>
            <li><strong className="text-foreground">Croix sur le symbole</strong> — personne décédée.</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Unions, séparations et filiations</h2>
          <p className="leading-relaxed">La ligne horizontale représente une union, la ligne verticale indique la filiation parent-enfant. Les séparations, divorces, remariages, adoptions ou grossesses interrompues sont indiqués par des marqueurs spécifiques afin de conserver une lecture clinique claire.</p>
        </section>
        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Liens émotionnels et pathologies</h2>
          <p className="leading-relaxed">Les relations fusionnelles, conflictuelles, distantes, coupées ou violentes complètent la structure familiale. Genogy permet aussi d’ajouter des pathologies visibles par couleur pour repérer rapidement des antécédents ou répétitions transgénérationnelles.</p>
        </section>
      </div>
    </main>
    <FaqAndExamples
      examples={[
        { title: 'Séparation puis recomposition', text: 'Une première union est barrée par un marqueur de séparation, puis une seconde union est dessinée avec les enfants issus de chaque branche pour éviter toute confusion.' },
        { title: 'Décès et événement marquant', text: 'La personne décédée garde sa place générationnelle avec une croix, ce qui permet de visualiser son rôle dans l’histoire familiale malgré son absence actuelle.' },
        { title: 'Relation conflictuelle', text: 'Un lien émotionnel conflictuel peut être ajouté entre deux membres sans modifier la filiation, afin de distinguer structure familiale et dynamique relationnelle.' },
      ]}
      faq={[
        { q: 'Faut-il suivre strictement les symboles McGoldrick ?', a: 'Ils constituent une base commune utile entre professionnels. L’essentiel est de rester cohérent et de documenter les choix lorsque la situation clinique exige une adaptation.' },
        { q: 'Comment représenter une adoption ?', a: 'L’adoption se note par une filiation distincte de la filiation biologique, afin de préserver la lisibilité de l’histoire familiale et des appartenances.' },
        { q: 'Peut-on mélanger pathologies et liens émotionnels ?', a: 'Oui, car ils ne décrivent pas le même niveau d’information : les pathologies concernent les personnes, les liens émotionnels concernent les relations.' },
      ]}
    />
  </SeoShell>
);

export const GenogramPsychologyPage: React.FC = () => (
  <SeoShell title="Génogramme en psychologie — outil clinique | Genogy" canonicalPath="/genogramme-psychologie">
    <Hero
      eyebrow="Psychologie"
      icon={<Brain className="h-5 w-5" />}
      title="Un outil de génogramme pour psychologues et thérapeutes"
      intro="Genogy aide les professionnels de la psychologie à représenter la structure familiale, les liens émotionnels, les événements marquants et les hypothèses cliniques en quelques minutes."
    />
    <main className="mx-auto grid max-w-5xl gap-8 px-6 py-14 lg:grid-cols-3">
      {[
        ['Anamnèse structurée', 'Visualisez rapidement les générations, alliances, ruptures et personnes ressources pendant l’entretien.'],
        ['Hypothèses cliniques', 'Repérez les répétitions, loyautés, conflits, deuils, séparations ou dynamiques transgénérationnelles.'],
        ['Support partageable', 'Exportez un génogramme clair pour vos notes, supervisions ou échanges interdisciplinaires.'],
      ].map(([title, text]) => (
        <section key={title} className="rounded-lg border border-border bg-card p-6">
          <HeartPulse className="mb-4 h-7 w-7 text-primary" />
          <h2 className="mb-3 text-xl font-bold">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
        </section>
      ))}
    </main>
    <FaqAndExamples
      examples={[
        { title: 'Première consultation adulte', text: 'Le praticien cartographie trois générations, puis ajoute les ruptures et deuils évoqués spontanément pour soutenir l’anamnèse sans interrompre le récit.' },
        { title: 'Thérapie familiale', text: 'Le génogramme devient un support commun : chacun peut situer les alliances, conflits, distances et personnes ressources avant d’explorer les hypothèses.' },
        { title: 'Supervision clinique', text: 'Un export lisible permet de présenter rapidement une situation complexe, en séparant faits, liens émotionnels et pistes d’analyse.' },
      ]}
      faq={[
        { q: 'Le génogramme remplace-t-il les notes cliniques ?', a: 'Non. Il complète les notes en offrant une vue d’ensemble structurée, particulièrement utile pour repérer les répétitions et organiser les informations familiales.' },
        { q: 'Combien de générations représenter ?', a: 'Trois générations suffisent souvent pour commencer. Une quatrième peut être utile si le récit fait apparaître des transmissions ou événements anciens importants.' },
        { q: 'Peut-on l’utiliser en visio ?', a: 'Oui, un outil en ligne permet de construire progressivement la carte familiale et de l’exporter ensuite pour le dossier ou la supervision.' },
      ]}
    />
  </SeoShell>
);

export const GenogramSocialWorkPage: React.FC = () => (
  <SeoShell title="Génogramme pour le travail social | Genogy" canonicalPath="/genogramme-travail-social">
    <Hero
      eyebrow="Travail social"
      icon={<BriefcaseBusiness className="h-5 w-5" />}
      title="Créer des génogrammes lisibles pour l’accompagnement social"
      intro="Genogy permet aux travailleurs sociaux, éducateurs spécialisés et équipes médico-sociales de clarifier les situations familiales complexes et de partager une lecture commune."
    />
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-border bg-card p-6">
          <Users className="mb-4 h-8 w-8 text-primary" />
          <h2 className="mb-3 text-2xl font-bold">Pour quelles situations ?</h2>
          <p className="leading-relaxed text-muted-foreground">Protection de l’enfance, accompagnement familial, insertion, handicap, santé mentale, coordination d’équipe : le génogramme rend visibles les ressources et les points de fragilité.</p>
        </section>
        <section className="space-y-4 text-muted-foreground">
          <h2 className="text-2xl font-bold text-foreground">Ce que Genogy apporte aux équipes</h2>
          <ul className="space-y-3">
            <li>Une carte familiale propre, compréhensible par plusieurs intervenants.</li>
            <li>Des notes et pathologies associées au dossier familial.</li>
            <li>Un export pour préparer réunions, synthèses ou transmissions.</li>
            <li>Un accès en ligne sans logiciel lourd à installer.</li>
          </ul>
          <Button asChild variant="brand" className="rounded-full px-7">
            <Link to="/">Découvrir Genogy</Link>
          </Button>
        </section>
      </div>
    </main>
    <FaqAndExamples
      examples={[
        { title: 'Protection de l’enfance', text: 'Le génogramme clarifie les détenteurs de l’autorité parentale, les fratries, les placements, les personnes ressources et les ruptures de lien.' },
        { title: 'Coordination médico-sociale', text: 'Une carte partagée aide plusieurs professionnels à parler de la même situation sans multiplier les reformulations ou les schémas improvisés.' },
        { title: 'Synthèse d’équipe', text: 'L’export sert de support visuel pour distinguer les faits établis, les hypothèses et les informations à vérifier.' },
      ]}
      faq={[
        { q: 'Le génogramme est-il adapté aux situations très complexes ?', a: 'Oui, à condition de hiérarchiser les informations : structure familiale d’abord, puis événements, ressources, fragilités et liens relationnels.' },
        { q: 'Peut-on le partager en réunion ?', a: 'Un export clair facilite la transmission, mais les informations sensibles doivent toujours être partagées selon les règles de confidentialité applicables.' },
        { q: 'Quelle différence avec un arbre généalogique ?', a: 'Le génogramme ne se limite pas à la parenté : il intègre événements, ruptures, liens émotionnels, ressources et éléments cliniques ou sociaux.' },
      ]}
    />
  </SeoShell>
);

export const FirstSessionGenogramArticle: React.FC = () => (
  <ArticleLayout
    title="Construire un génogramme en première séance"
    canonicalPath="/ressources/genogramme-premiere-seance"
    eyebrow="Article pratique"
    intro="Une méthode simple pour commencer un génogramme dès le premier entretien, sans transformer la séance en questionnaire administratif."
    sections={[
      { heading: 'Commencer par la structure, pas par les détails', body: ['En première séance, l’objectif n’est pas de tout documenter. Il s’agit d’obtenir une carte suffisamment claire pour situer la personne, ses proches, les générations principales et les événements qui organisent le récit.', 'Commencez par le patient index, puis remontez vers les parents et grands-parents lorsque les informations sont disponibles. Les détails incertains peuvent rester ouverts : un génogramme clinique se précise souvent au fil des séances.'] },
      { heading: 'Choisir les informations vraiment utiles', body: ['Les noms, années approximatives, unions, séparations, décès et membres significatifs suffisent souvent pour créer une première base. Les pathologies, migrations, placements ou ruptures de lien peuvent être ajoutés ensuite lorsqu’ils éclairent la demande.', 'Cette progression évite de saturer l’entretien et laisse la personne raconter ce qui fait sens pour elle.'] },
      { heading: 'Transformer la carte en support clinique', body: ['Une fois la structure posée, le génogramme devient un support de relance : répétitions, absences, alliances, conflits, ressources et événements marquants apparaissent plus facilement.', 'Le praticien peut alors distinguer les faits établis des hypothèses, ce qui rend l’outil utile pour la suite de l’accompagnement.'] },
    ]}
    examples={[
      { title: 'Entretien de 45 minutes', text: 'Limiter la saisie à trois générations et noter les incertitudes permet d’obtenir une carte lisible sans ralentir la séance.' },
      { title: 'Demande centrée sur un conflit', text: 'Après la structure familiale, ajoutez seulement les liens émotionnels directement liés à la demande initiale.' },
      { title: 'Informations manquantes', text: 'Un parent inconnu ou une date approximative peut rester vide : l’absence d’information est parfois une donnée clinique en soi.' },
    ]}
    faq={[
      { q: 'Faut-il terminer le génogramme en une séance ?', a: 'Non. Un génogramme fiable se construit progressivement, surtout lorsque l’histoire familiale est complexe ou douloureuse.' },
      { q: 'Que faire si le patient ne connaît pas certaines informations ?', a: 'Laisser l’information vide ou incertaine. Il vaut mieux une carte honnête qu’un schéma artificiellement complet.' },
      { q: 'Quand ajouter les liens émotionnels ?', a: 'Après la structure de base, lorsque les relations évoquées sont suffisamment claires pour ne pas mélanger faits et interprétations.' },
    ]}
  />
);

export const ClinicalExampleArticle: React.FC = () => (
  <ArticleLayout
    title="Exemple de génogramme clinique commenté"
    canonicalPath="/ressources/exemple-genogramme-clinique"
    eyebrow="Cas fictif"
    intro="Un exemple commenté pour comprendre comment lire un génogramme au-delà de la simple représentation familiale."
    sections={[
      { heading: 'Situation de départ', body: ['Imaginons une personne qui consulte pour une difficulté à se positionner dans sa famille. Le génogramme met en évidence une fratrie nombreuse, une séparation parentale ancienne et un grand-parent très présent dans l’éducation.', 'La carte ne donne pas une explication immédiate, mais elle organise les informations et rend visibles les zones à explorer.'] },
      { heading: 'Lecture des répétitions et ruptures', body: ['Plusieurs séparations apparaissent sur deux générations, associées à des périodes de silence familial. Ces éléments peuvent orienter l’entretien vers les modes de résolution des conflits et les loyautés familiales.', 'Il reste important de formuler ces observations comme des hypothèses, jamais comme des conclusions automatiques.'] },
      { heading: 'Repérer les ressources', body: ['Un génogramme clinique ne sert pas seulement à identifier les difficultés. Il permet aussi de repérer les liens soutenants, les figures protectrices et les continuités positives dans l’histoire familiale.', 'Ces ressources peuvent devenir des points d’appui pour le travail thérapeutique ou l’accompagnement social.'] },
    ]}
    examples={[
      { title: 'Répétition transgénérationnelle', text: 'Deux séparations à des âges proches peuvent ouvrir une question clinique, sans suffire à établir une causalité.' },
      { title: 'Personne ressource', text: 'Une tante ou un grand-parent très présent peut être représenté pour ne pas réduire la carte aux seuls parents.' },
      { title: 'Lien coupé', text: 'Une rupture de contact est dessinée comme une dynamique relationnelle, distincte de la filiation qui reste inchangée.' },
    ]}
    faq={[
      { q: 'Un exemple fictif suffit-il pour apprendre ?', a: 'Il aide à comprendre la méthode, mais chaque situation réelle demande une lecture contextualisée et prudente.' },
      { q: 'Comment éviter la surinterprétation ?', a: 'En séparant clairement les faits, les ressentis exprimés et les hypothèses formulées pendant l’accompagnement.' },
      { q: 'Pourquoi noter les ressources ?', a: 'Parce qu’elles montrent les appuis disponibles et évitent une lecture uniquement centrée sur les fragilités.' },
    ]}
  />
);

export const SocialWorkCaseArticle: React.FC = () => (
  <ArticleLayout
    title="Génogramme en travail social : cas pratique"
    canonicalPath="/ressources/genogramme-travail-social-cas-pratique"
    eyebrow="Cas pratique"
    intro="Un cas d’usage pour structurer une situation familiale complexe et faciliter la coordination entre professionnels."
    sections={[
      { heading: 'Clarifier qui fait partie de la situation', body: ['En travail social, la première difficulté est souvent de savoir qui intervient réellement dans la vie de la personne ou de l’enfant : parents, beaux-parents, fratrie, grands-parents, proches aidants, institutions.', 'Le génogramme permet de poser cette structure visuellement et d’éviter les confusions lors des transmissions.'] },
      { heading: 'Distinguer faits, ressources et points de vigilance', body: ['Les unions, séparations, décès ou placements relèvent de la structure. Les soutiens réguliers, conflits, absences ou fragilités relèvent d’une lecture plus dynamique.', 'Cette distinction aide à construire un support utile en réunion sans mélanger les informations vérifiées et les interprétations.'] },
      { heading: 'Préparer une synthèse', body: ['Avant une réunion, un génogramme propre permet de présenter rapidement la situation, puis de concentrer l’échange sur les décisions ou actions à mener.', 'Il devient aussi un repère commun lorsque plusieurs professionnels accompagnent la même famille.'] },
    ]}
    examples={[
      { title: 'Famille recomposée', text: 'Représenter séparément les unions successives permet de comprendre les liens entre demi-frères, beaux-parents et enfants vivant dans différents foyers.' },
      { title: 'Placement ou relais familial', text: 'La personne qui héberge ou soutient l’enfant peut être visible comme ressource, même si elle n’est pas titulaire de l’autorité parentale.' },
      { title: 'Réunion pluridisciplinaire', text: 'Un export du génogramme sert de support neutre pour partager une base commune avant d’aborder les décisions.' },
    ]}
    faq={[
      { q: 'Peut-on utiliser un génogramme dans un rapport ?', a: 'Oui, si les règles de confidentialité et de finalité sont respectées, et si les informations sensibles sont limitées au nécessaire.' },
      { q: 'Comment représenter les personnes ressources non apparentées ?', a: 'Elles peuvent être ajoutées comme figures significatives lorsque leur rôle est important dans l’accompagnement.' },
      { q: 'Le génogramme doit-il être exhaustif ?', a: 'Non. Il doit être suffisamment complet pour comprendre la situation, mais rester lisible pour l’équipe et les personnes concernées.' },
    ]}
  />
);
