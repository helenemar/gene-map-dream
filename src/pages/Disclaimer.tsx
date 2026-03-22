import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gogyIcon from '@/assets/genogy-icon.svg';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: "Nature de l'outil",
    content: "Bien que ce projet ait été co-conçu avec **Jona Machicote, Psychologue Clinicienne**, l'utilisation de la plateforme ne constitue en aucun cas une thérapie, une consultation psychologique ou un avis médical.",
  },
  {
    title: 'Santé mentale',
    content: `L'exploration de l'histoire familiale peut faire ressurgir des émotions fortes ou des souvenirs complexes. Si vous ressentez une détresse psychologique, nous vous recommandons vivement de consulter un professionnel de santé qualifié.`,
  },
  {
    title: 'Absence de diagnostic',
    content: `Genogy ne fournit aucun diagnostic clinique. Les interprétations issues de la cartographie sont laissées à la seule discrétion de l'utilisateur.`,
  },
  {
    title: 'Limitation de responsabilité',
    content: `Les créateurs de Genogy ne pourront être tenus responsables des conséquences directes ou indirectes résultant de l'utilisation de l'outil ou de l'interprétation des données saisies par l'utilisateur.`,
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

const Disclaimer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <title>Avertissement légal — Genogy</title>
        <meta name="description" content="Clause de non-responsabilité et avertissement légal de Genogy. L'outil ne constitue pas une thérapie ou un avis médical." />
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
              Avertissement légal
            </h1>
            <p className="text-sm text-muted-foreground">
              Clause de non-responsabilité
            </p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-12">
            <p className="text-[15px] text-foreground leading-relaxed font-medium">
              Genogy est un outil numérique de visualisation et de cartographie généalogique conçu à des fins d'auto-exploration et de développement personnel.
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

export default Disclaimer;
