import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthModal from '@/components/AuthModal';

const HowToGenogram: React.FC = () => {
  const { t } = useLanguage();
  const [authModal, setAuthModal] = React.useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'login' });

  const openAuth = (view: 'login' | 'signup') => setAuthModal({ open: true, view });

  return (
    <div className="min-h-screen bg-page-bg text-foreground">
      <Helmet>
        <title>Comment faire un génogramme en ligne ? Guide étape par étape | Genogy</title>
        <meta name="description" content="Apprenez comment faire un génogramme en ligne étape par étape avec Genogy. Guide complet pour psychologues et travailleurs sociaux : symboles, relations, pathologies." />
        <link rel="canonical" href="https://genogy.app/comment-faire-un-genogramme" />
        <meta property="og:title" content="Comment faire un génogramme en ligne ? Guide complet | Genogy" />
        <meta property="og:description" content="Guide étape par étape pour créer un génogramme professionnel en ligne avec Genogy. Symboles McGoldrick, relations émotionnelles et pathologies." />
        <meta property="og:url" content="https://genogy.app/comment-faire-un-genogramme" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'Comment faire un génogramme en ligne',
          description: 'Guide étape par étape pour créer un génogramme professionnel en ligne avec Genogy.',
          totalTime: 'PT15M',
          tool: { '@type': 'HowToTool', name: 'Genogy - Outil de génogramme en ligne' },
          step: [
            { '@type': 'HowToStep', position: 1, name: 'Créer un compte Genogy', text: "Inscrivez-vous gratuitement sur genogy.app. L'inscription prend quelques secondes." },
            { '@type': 'HowToStep', position: 2, name: 'Identifier le patient index', text: 'Commencez par le patient ou la personne au centre du génogramme.' },
            { '@type': 'HowToStep', position: 3, name: 'Ajouter les membres de la famille', text: 'Ajoutez parents, grands-parents, fratrie, enfants sur au moins 3 générations.' },
            { '@type': 'HowToStep', position: 4, name: 'Définir les unions et filiations', text: 'Reliez les membres par des unions (mariage, concubinage) et des liens de filiation.' },
            { '@type': 'HowToStep', position: 5, name: 'Ajouter les relations émotionnelles', text: 'Indiquez les liens émotionnels : fusionnel, conflictuel, distant, coupé, violent…' },
            { '@type': 'HowToStep', position: 6, name: 'Renseigner les pathologies', text: 'Ajoutez les pathologies médicales et psychologiques pertinentes pour chaque membre.' },
            { '@type': 'HowToStep', position: 7, name: 'Exporter et partager', text: 'Exportez en PDF/PNG ou partagez via un lien sécurisé avec vos collègues.' },
          ],
        })}</script>
      </Helmet>

      <LandingHeader onAuth={openAuth} />

      <article className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        <header className="mb-12">
          <p className="text-primary text-sm font-medium mb-3">Guide pratique</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
            Comment faire un génogramme en ligne ?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Guide étape par étape pour créer votre premier génogramme professionnel avec Genogy.
          </p>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h2>Pourquoi utiliser un outil de génogramme en ligne ?</h2>
          <p>
            Créer un génogramme à la main sur papier est fastidieux, difficile à modifier et impossible à partager facilement. Un <strong>outil de génogramme en ligne</strong> comme Genogy vous permet de :
          </p>
          <ul>
            <li>Créer et modifier votre génogramme en quelques clics</li>
            <li>Sauvegarder automatiquement chaque modification</li>
            <li>Exporter en PDF ou PNG pour vos comptes-rendus</li>
            <li>Partager avec des collègues en lecture seule ou en mode collaboratif</li>
            <li>Accéder à vos génogrammes depuis n'importe quel appareil</li>
          </ul>

          <h2>Étape 1 : Créer votre compte Genogy</h2>
          <p>
            Rendez-vous sur <strong>genogy.app</strong> et inscrivez-vous en quelques secondes avec votre email ou votre compte Google. L'accès est <strong>gratuit pendant la phase bêta</strong>.
          </p>

          <h2>Étape 2 : Identifier le patient index</h2>
          <p>
            Le <strong>patient index</strong> (ou personne index) est la personne au centre du génogramme, celle pour laquelle vous réalisez l'analyse. Dans Genogy, créez un nouveau génogramme et ajoutez ce premier membre.
          </p>
          <p>
            Renseignez les informations de base : nom, prénom, date de naissance, profession. Ces informations s'affichent directement sur la carte du membre dans le génogramme.
          </p>

          <h2>Étape 3 : Ajouter les membres de la famille</h2>
          <p>
            Un génogramme couvre généralement <strong>au moins trois générations</strong>. Ajoutez progressivement :
          </p>
          <ul>
            <li>Les <strong>parents</strong> du patient index</li>
            <li>Les <strong>grands-parents</strong> maternels et paternels</li>
            <li>La <strong>fratrie</strong> (frères et sœurs)</li>
            <li>Le/la <strong>conjoint(e)</strong> et les enfants</li>
            <li>Les <strong>oncles, tantes, cousins</strong> si pertinent</li>
          </ul>
          <p>
            Dans Genogy, utilisez le bouton <em>"Ajouter un membre"</em> dans la barre latérale ou directement depuis le canvas.
          </p>

          <h2>Étape 4 : Définir les unions et filiations</h2>
          <p>
            Reliez les membres entre eux avec les différents types d'unions :
          </p>
          <ul>
            <li><strong>Mariage</strong> — ligne horizontale pleine</li>
            <li><strong>Concubinage</strong> — ligne horizontale pointillée</li>
            <li><strong>Séparation</strong> — une barre oblique sur la ligne</li>
            <li><strong>Divorce</strong> — deux barres obliques sur la ligne</li>
          </ul>
          <p>
            Les enfants sont reliés aux unions par des lignes verticales descendantes. Genogy gère automatiquement le positionnement des générations.
          </p>

          <h2>Étape 5 : Ajouter les relations émotionnelles</h2>
          <p>
            C'est ce qui distingue le génogramme de l'arbre généalogique. Dans Genogy, glissez d'un membre à un autre pour créer un <strong>lien émotionnel</strong>, puis choisissez le type :
          </p>
          <ul>
            <li><strong>Fusionnel</strong> — relation d'attachement excessif</li>
            <li><strong>Conflictuel</strong> — tensions et disputes récurrentes</li>
            <li><strong>Distant</strong> — peu de communication ou de contact</li>
            <li><strong>Coupé / Rompu</strong> — rupture totale de la relation</li>
            <li><strong>Ambivalent</strong> — alternance entre rapprochement et conflit</li>
            <li><strong>Violent</strong> — violence physique ou psychologique</li>
            <li><strong>Abus</strong> — abus émotionnel, physique ou sexuel</li>
          </ul>

          <h2>Étape 6 : Renseigner les pathologies</h2>
          <p>
            Ajoutez les <strong>pathologies médicales et psychologiques</strong> pour chaque membre concerné. Genogy affiche les pathologies directement sur les cartes des membres avec un code couleur personnalisable :
          </p>
          <ul>
            <li>Maladies cardiovasculaires</li>
            <li>Cancers</li>
            <li>Dépression, troubles anxieux</li>
            <li>Addictions (alcool, drogues, jeux…)</li>
            <li>Maladies neurodégénératives</li>
            <li>Troubles alimentaires</li>
          </ul>
          <p>
            Vous pouvez créer des <strong>pathologies personnalisées</strong> avec leur propre couleur pour adapter le génogramme à chaque cas clinique.
          </p>

          <h2>Étape 7 : Exporter et partager votre génogramme</h2>
          <p>
            Une fois votre génogramme terminé, vous pouvez :
          </p>
          <ul>
            <li><strong>Exporter en PDF</strong> — idéal pour les comptes-rendus et les dossiers patients</li>
            <li><strong>Exporter en PNG</strong> — pour intégrer dans une présentation ou un rapport</li>
            <li><strong>Partager via un lien</strong> — en lecture seule ou en mode édition collaborative</li>
          </ul>

          <h2>Conseils pour un bon génogramme</h2>
          <ul>
            <li>Commencez toujours par <strong>3 générations minimum</strong></li>
            <li>Placez la <strong>génération la plus ancienne en haut</strong></li>
            <li>Utilisez les <strong>symboles standardisés</strong> de McGoldrick</li>
            <li>Ajoutez des <strong>notes cliniques</strong> pour contextualiser les informations</li>
            <li>Mettez à jour le génogramme <strong>au fil des séances</strong></li>
          </ul>

          <div className="not-prose mt-10 flex flex-col sm:flex-row gap-4">
            <Button variant="brand" size="lg" onClick={() => openAuth('signup')} className="rounded-full px-8">
              Créer mon génogramme maintenant
            </Button>
            <Link to="/genogramme">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary">
                ← Qu'est-ce qu'un génogramme ?
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />

      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        defaultView={authModal.view}
      />
    </div>
  );
};

export default HowToGenogram;
