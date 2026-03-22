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
    content: `Le site **Genogy** (accessible à l'adresse genogy.app) est édité par :\n\n• Raison sociale : Genogy\n• Adresse e-mail : contact@genogy.app\n• Directeur de la publication : le représentant légal de la société éditrice.`,
  },
  {
    title: '2. Hébergement',
    content: `Le site est hébergé par :\n\n• **Lovable Cloud** (infrastructure Supabase)\n• Les données sont hébergées au sein de l'Union Européenne, conformément au RGPD.`,
  },
  {
    title: '3. Propriété intellectuelle',
    content: `L'ensemble des contenus présents sur le site Genogy (textes, images, logos, icônes, logiciels, base de données) sont protégés par le droit de la propriété intellectuelle.\n\nToute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie du site est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.`,
  },
  {
    title: '4. Données personnelles',
    content: `Genogy collecte et traite des données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).\n\nPour en savoir plus sur la collecte et le traitement de vos données, consultez notre [Politique de confidentialité](/privacy).`,
  },
  {
    title: '5. Cookies',
    content: `Le site utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification, préférences de session). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.`,
  },
  {
    title: '6. Limitation de responsabilité',
    content: `Genogy s'efforce de fournir des informations aussi précises que possible. Toutefois, l'éditeur ne pourra être tenu responsable des omissions, des inexactitudes ou des carences dans la mise à jour des informations.\n\nL'utilisateur est seul responsable du contenu qu'il saisit dans ses génogrammes. Genogy ne saurait être tenu responsable de l'utilisation qui est faite des informations saisies par les utilisateurs.`,
  },
  {
    title: '7. Droit applicable',
    content: `Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.`,
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
