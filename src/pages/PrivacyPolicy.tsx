import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gogyIcon from '@/assets/genogy-icon.svg';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Responsable du traitement',
    content: `Le responsable du traitement des données personnelles collectées via Genogy est la société éditrice de l'application. Pour toute question relative à la protection de vos données, vous pouvez nous contacter à l'adresse suivante : contact.genogy@gmail.com.`,
  },
  {
    title: '2. Données collectées',
    content: `Nous collectons les données suivantes dans le cadre de l'utilisation de Genogy :\n\n• **Données d'identification** : adresse e-mail, nom d'utilisateur.\n• **Données de génogrammes** : les informations saisies dans vos génogrammes (noms, relations, pathologies, notes cliniques).\n• **Données techniques** : adresse IP, type de navigateur, pages consultées, durée de session.\n\nAucune donnée sensible relative aux patients réels n'est traitée par Genogy. L'utilisateur est seul responsable du contenu qu'il saisit dans ses génogrammes.`,
  },
  {
    title: '3. Finalités du traitement',
    content: `Vos données sont traitées pour les finalités suivantes :\n\n• Création et gestion de votre compte utilisateur.\n• Sauvegarde et synchronisation de vos génogrammes dans le cloud.\n• Amélioration continue de l'outil et de l'expérience utilisateur.\n• Communication relative à votre compte (notifications, mises à jour).`,
  },
  {
    title: '4. Base légale du traitement',
    content: `Le traitement de vos données repose sur :\n\n• **Votre consentement** lors de la création de votre compte.\n• **L'exécution du contrat** (conditions générales d'utilisation) lié à l'utilisation du service.\n• **Notre intérêt légitime** pour l'amélioration de nos services et la sécurité de la plateforme.`,
  },
  {
    title: '5. Durée de conservation',
    content: `Vos données personnelles sont conservées pendant toute la durée d'utilisation de votre compte. En cas de suppression de votre compte, vos données sont effacées dans un délai de 30 jours, sauf obligation légale de conservation.`,
  },
  {
    title: '6. Partage des données',
    content: `Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :\n\n• Nos sous-traitants techniques (hébergement, base de données) dans le strict cadre de la fourniture du service.\n• Les autorités compétentes en cas d'obligation légale.\n\nTous nos sous-traitants sont situés dans l'Union Européenne et sont conformes au RGPD.`,
  },
  {
    title: '7. Sécurité des données',
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :\n\n• Chiffrement des données en transit (HTTPS/TLS) et au repos.\n• Politiques d'accès strictes (Row Level Security).\n• Sauvegardes régulières et redondantes.\n• Audits de sécurité périodiques.`,
  },
  {
    title: '8. Vos droits',
    content: `Conformément au RGPD, vous disposez des droits suivants :\n\n• **Droit d'accès** : obtenir une copie de vos données personnelles.\n• **Droit de rectification** : corriger vos données inexactes.\n• **Droit à l'effacement** : demander la suppression de vos données.\n• **Droit à la portabilité** : recevoir vos données dans un format structuré.\n• **Droit d'opposition** : vous opposer au traitement de vos données.\n• **Droit de limitation** : limiter le traitement de vos données.\n\nPour exercer ces droits, contactez-nous à contact.genogy@gmail.com. Nous répondrons dans un délai de 30 jours.`,
  },
  {
    title: '9. Cookies',
    content: `Genogy utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification, préférences de session). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.`,
  },
  {
    title: '10. Modifications',
    content: `Nous nous réservons le droit de modifier cette politique de confidentialité. Toute modification substantielle vous sera notifiée par e-mail ou via l'application. La date de dernière mise à jour est indiquée en haut de cette page.`,
  },
];

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <br key={i} />;
    // Bold markers
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

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>Politique de confidentialité — Genogy</title>
        <meta name="description" content="Politique de confidentialité et protection des données personnelles de Genogy, conforme au RGPD." />
        <link rel="canonical" href="https://genogy-app.com/privacy" />
        <link rel="alternate" hrefLang="fr" href="https://genogy-app.com/" />
        <link rel="alternate" hrefLang="en" href="https://genogy-app.com/en" />
        <link rel="alternate" hrefLang="de" href="https://genogy-app.com/de" />
        <link rel="alternate" hrefLang="x-default" href="https://genogy-app.com/" />
        <meta property="og:title" content="Politique de confidentialité — Genogy" />
        <meta property="og:description" content="Politique de confidentialité et protection des données personnelles de Genogy, conforme au RGPD." />
        <meta property="og:url" content="https://genogy-app.com/privacy" />
      </Helmet>

      {/* Header */}
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

      {/* Content */}
      <main className="flex-1 py-16 lg:py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
              Politique de confidentialité
            </h1>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : 28 février 2026
            </p>
          </div>

          <div className="text-muted-foreground leading-relaxed mb-12">
            <p>
              Chez Genogy, la protection de vos données personnelles est une priorité. Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD).
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
              Pour toute question concernant cette politique, contactez-nous à{' '}
              <a href="mailto:contact.genogy@gmail.com" className="text-primary hover:underline">
                contact.genogy@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
