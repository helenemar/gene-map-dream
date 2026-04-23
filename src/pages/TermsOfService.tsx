import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gogyIcon from '@/assets/genogy-icon.webp';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Objet',
    content: `Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités d'accès et d'utilisation du service **Genogy**, accessible à l'adresse genogy-app.com.\n\nEn créant un compte ou en utilisant le service, l'utilisateur accepte sans réserve les présentes CGU.`,
  },
  {
    title: '2. Description du service',
    content: `Genogy est un outil en ligne permettant aux professionnels de santé et aux particuliers de créer, modifier et partager des génogrammes (arbres familiaux systémiques).\n\nLe service propose notamment :\n\n• La création et l'édition de génogrammes interactifs.\n• La sauvegarde automatique dans le cloud.\n• Le partage de génogrammes via des liens sécurisés.\n• L'export des génogrammes en format image ou PDF.`,
  },
  {
    title: '3. Accès au service',
    content: `L'accès au service nécessite la création d'un compte utilisateur avec une adresse e-mail valide.\n\nGenogy se réserve le droit de suspendre ou de supprimer un compte en cas de violation des présentes CGU, sans préavis ni indemnité.`,
  },
  {
    title: "4. Obligations de l'utilisateur",
    content: `L'utilisateur s'engage à :\n\n• Fournir des informations exactes lors de son inscription.\n• Ne pas utiliser le service à des fins illicites ou contraires aux bonnes mœurs.\n• Ne pas tenter de compromettre la sécurité ou le fonctionnement du service.\n• Respecter la confidentialité des données qu'il saisit, notamment les données relatives à des tiers.\n• Ne pas partager ses identifiants de connexion avec des tiers.`,
  },
  {
    title: "5. Responsabilité de l'utilisateur",
    content: `L'utilisateur est seul responsable du contenu qu'il saisit dans ses génogrammes. Il lui appartient de s'assurer que les informations saisies respectent le droit à la vie privée des personnes concernées et la réglementation en vigueur.\n\nGenogy ne saurait être tenu responsable de l'utilisation faite par l'utilisateur des informations saisies dans le service.`,
  },
  {
    title: '6. Propriété intellectuelle',
    content: `Le service Genogy, son interface, son code source, ses fonctionnalités et son design sont protégés par le droit de la propriété intellectuelle.\n\nL'utilisateur conserve la propriété des données qu'il saisit dans ses génogrammes. En utilisant le service, il accorde à Genogy une licence limitée et non exclusive pour stocker et traiter ces données dans le seul but de fournir le service.`,
  },
  {
    title: '7. Disponibilité du service',
    content: `Genogy s'efforce d'assurer la disponibilité du service 24h/24, 7j/7. Toutefois, l'éditeur ne garantit pas une disponibilité ininterrompue et ne pourra être tenu responsable des interruptions temporaires liées à la maintenance, aux mises à jour ou à des circonstances indépendantes de sa volonté.`,
  },
  {
    title: '8. Tarification',
    content: `Genogy est actuellement en phase bêta avec un accès gratuit à l'ensemble des fonctionnalités. L'éditeur se réserve le droit d'introduire des offres payantes à la fin de la phase bêta. Les utilisateurs seront informés de tout changement tarifaire avec un préavis raisonnable.`,
  },
  {
    title: '9. Résiliation',
    content: `L'utilisateur peut supprimer son compte à tout moment depuis les paramètres de son compte. La suppression entraîne l'effacement définitif de toutes les données associées dans un délai de 30 jours.\n\nGenogy se réserve le droit de résilier l'accès d'un utilisateur en cas de manquement aux présentes CGU.`,
  },
  {
    title: '10. Modification des CGU',
    content: `Genogy se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par e-mail ou via l'application. L'utilisation continue du service après notification vaut acceptation des nouvelles CGU.`,
  },
  {
    title: '11. Droit applicable et juridiction',
    content: `Les présentes CGU sont régies par le droit français. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, les tribunaux français seront seuls compétents.`,
  },
];

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="mb-1">
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-foreground font-semibold">{part}</strong> : part
        )}
      </p>
    );
  });
}

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>Conditions Générales d'Utilisation — Genogy</title>
        <meta name="description" content="Genogy est l'outil en ligne pour créer des génogrammes cliniques professionnels. Conçu pour psychologues, thérapeutes et travailleurs sociaux. Gratuit en bêta." />
        <link rel="canonical" href="https://www.genogy-app.com/" />
        <link rel="alternate" hrefLang="fr" href="https://www.genogy-app.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.genogy-app.com/en" />
        <link rel="alternate" hrefLang="de" href="https://www.genogy-app.com/de" />
        <link rel="alternate" hrefLang="x-default" href="https://www.genogy-app.com/" />
        <meta property="og:title" content="Genogy — outil pour créer des génogrammes cliniques professionnels" />
        <meta property="og:description" content="Genogy est l'outil en ligne pour créer des génogrammes cliniques professionnels. Conçu pour psychologues, thérapeutes et travailleurs sociaux. Gratuit en bêta." />
        <meta property="og:url" content="https://www.genogy-app.com/" />
        <meta property="og:image" content="https://www.genogy-app.com/og-image.webp" />
      </Helmet>

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
            <span className="text-[15px] font-semibold tracking-tight">Genogy</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>
      </header>

      <main className="flex-1 py-16 lg:py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : 22 mars 2026
            </p>
          </div>

          <div className="space-y-12">
            {SECTIONS.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
                  {section.title}
                </h2>
                <div className="text-[15px] text-muted-foreground leading-relaxed">
                  {renderContent(section.content)}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Pour toute question, contactez-nous à{' '}
              <a href="mailto:contact@genogy-app.com" className="text-primary hover:underline">
                contact@genogy-app.com
              </a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
