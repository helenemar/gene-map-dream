Le résultat montré dans la capture ne correspond pas à la page d’accueil : Google affiche la page `/comment-faire-un-genogramme`. C’est donc normal que la modification du `<title>` principal n’ait pas changé ce résultat précis.

Plan de correction :

1. Mettre à jour les métadonnées SEO de la page `/comment-faire-un-genogramme`
   - Remplacer le titre actuel par un titre aligné avec votre demande, par exemple :
     `Genogy — Créez vos génogrammes en ligne`
   - Remplacer la meta description actuelle par :
     `Outil simple et professionnel pour créer vos génogrammes en ligne. Conçu pour psychologues et thérapeutes : standards McGoldrick, export PDF, partage sécurisé.`
   - Appliquer la même version aux balises Open Graph/Twitter de cette page.

2. Corriger le texte que Google extrait dans le snippet
   - Le snippet de votre capture vient du contenu de l’étape 1 :
     `Rendez-vous sur genogy-app.com et inscrivez-vous...`
   - Je remplacerai ce passage par un texte moins “mode d’emploi inscription” et plus orienté valeur produit, par exemple :
     `Avec Genogy, créez un génogramme clinique en ligne en quelques minutes : ajoutez les membres, visualisez les liens familiaux et émotionnels, puis exportez votre travail en PDF.`

3. Harmoniser les sources SEO internes
   - Mettre à jour `src/i18n/fr.ts`, car la page guide tire son titre, sa description et son contenu depuis ce fichier.
   - Vérifier que la page d’accueil, la preview SERP et le guide n’envoient pas de signaux contradictoires pour le texte principal.

4. Clarifier la limite Google
   - Une fois corrigé, Google peut encore afficher l’ancien texte pendant plusieurs jours/semaines, jusqu’au prochain crawl.
   - Mais la source HTML servie par le site sera correcte après publication, ce qui permettra à Google de remplacer progressivement l’ancien résultat.