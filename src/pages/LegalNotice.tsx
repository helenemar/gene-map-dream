import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gogyIcon from '@/assets/genogy-icon.svg';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Éditeur du site',
    content: `Le site **genogy-app.com** est édité par :\n\n• Nom / Raison sociale : Genogy\n• Statut : Auto-entrepreneur\n• Siège social : 10 Boulevard Morland\n• Email : contact.genogy@gmail.com\n• Directeur de la publication : Genogy`,
  },
  {
    title: '2. Hébergement du site',
    content: `Le site est hébergé par :\n\n• Hébergeur : **Hostinger International Ltd.**\n• Adresse : 61 Lordou Vironos Street, 6023 Larnaca, Chypre\n• Site web : www.hostinger.fr`,
  },
  {
    title: '3. Propriété intellectuelle',
    content: `L'ensemble du contenu de ce site (textes, graphismes, logos, icônes, etc.) est la propriété exclusive de l'éditeur, sauf mention contraire. Toute reproduction ou représentation, intégrale ou partielle, du site ou de l'un de ses éléments, est interdite sans autorisation préalable.`,
  },
  {
    title: '4. Données personnelles (RGPD)',
    content: `Conformément au Règlement Général sur la Protection des Données (RGPD) :\n\n• **Finalité** : Les données collectées (via Google Auth ou formulaires) servent uniquement à la gestion de votre compte utilisateur et à la création de vos génogrammes.\n• **Conservation** : Vos données sont conservées tant que votre compte est actif.\n• **Vos droits** : Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez-nous à : contact.genogy@gmail.com.\n• **Stockage** : Les données sont stockées via une solution backend sécurisée.`,
  },
  {
    title: '5. Cookies',
    content: `Le site utilise des cookies essentiels au fonctionnement de l'authentification (Google Auth) et à la navigation. En utilisant ce site, vous acceptez l'utilisation de ces cookies techniques.`,
  },
];

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="mb-1">
        {parts.map((part, j) => {
          if (j % 2 === 1) return <strong key={j} className="text-foreground font-semibold">{part}</strong>;
          // Handle markdown links [text](url)
          const linkParts = part.split(/\[([^\]]+)\]\(([^)]+)\)/g);
          if (linkParts.length > 1) {
            return linkParts.map((lp, k) => {
              if (k % 3 === 1) return <Link key={k} to={linkParts[k + 1]} className="text-primary hover:underline">{lp}</Link>;
              if (k % 3 === 2) return null;
              return lp;
            });
          }
          return part;
        })}
      </p>
    );
  });
}

const LegalNotice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>Mentions légales — Genogy</title>
        <meta name="description" content="Mentions légales du site Genogy, éditeur, hébergement, propriété intellectuelle et droit applicable." />
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
              Mentions légales
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
              <a href="mailto:contact@genogy.app" className="text-primary hover:underline">
                contact@genogy.app
              </a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalNotice;
