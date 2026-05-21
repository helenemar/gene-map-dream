## Analyse concurrentielle (Semrush)

### Ce qui fait gagner les concurrents

**genopro.com** (~12 k visites/mois sur le marché US, plus gros acteur) — son trafic vient à 95 % de **6 pages très précises** :

| Page concurrente | % du trafic | Mot-clé moteur |
|---|---|---|
| `/genogram/` (page pilier "qu'est-ce qu'un génogramme") | 25 % | genogram |
| Home | 12 % | genopro (marque) |
| `/genogram/examples/` | 6 % | genogram example |
| `/genogram/symbols/` | 6 % | genogram symbols |
| `/genogram/templates/` | 3 % | genogram maker / template |
| `/genogram/rules/` (how-to) | 2 % | how to make a genogram |

**genogramanalytics.com** (~280 visites/mois US, beaucoup plus petit) gagne surtout sur le combo **genogram + ecomap (écocarte)** — un angle que genopro ignore.

### Lecture pour Genogy

- Le SEO du génogramme est dominé par **6 archétypes de pages** : *définition*, *exemples*, *symboles*, *modèles/templates*, *comment faire*, *écocarte*.
- Tu en couvres déjà 3 (`/genogramme`, `/symboles-genogramme`, `/comment-faire-un-genogramme`) mais tu te positionnes en **page 2-7** (positions 19-64) → contenu existant insuffisamment optimisé.
- 3 archétypes manquent côté FR : **exemples**, **modèles vierges à télécharger**, **génogramme + écocarte**.

### Mots-clés FR vérifiés (Semrush, base fr)

| Mot-clé | Volume/mois | Difficulté | Statut Genogy |
|---|---|---|---|
| génogramme gratuit | 170 | 18 (facile) | non ciblé |
| génogramme vierge | 110 | 24 (facile) | pos. 45 |
| génogramme exemple | 110 | 14 (très facile) | non ciblé |
| génogramme en ligne | 90 | 18 (facile) | pos. 10 ✓ |
| génogramme famille | 70 | 21 (facile) | pos. 64 |
| comment faire un génogramme | 40 | 0 (très facile) | pos. ~20 |
| génogramme psychologie | 40 | 0 (très facile) | déjà une page |
| symboles génogramme | 20 | 0 (très facile) | pos. 25 |
| logiciel génogramme | 20 | 0 (très facile) | non ciblé |
| écocarte | 20 | 0 (très facile) | non ciblé |

Tous ces mots-clés ont une difficulté ≤ 25/100 = **réalistes pour Genogy**, même jeune.

---

## Plan d'action SEO

### 1. Créer 3 nouvelles pages (gros potentiel, manquantes)

- **`/exemples-genogramme`** — galerie de 4-6 exemples cliniques commentés (famille recomposée, addiction, deuil, etc.). Cible : *génogramme exemple* (110) + *exemple génogramme clinique*. Réutilise tes ressources blog existantes en les regroupant.
- **`/genogramme-vierge`** — page d'atterrissage avec CTA "créer un génogramme vierge en 1 clic" + aperçu du canvas vide. Cible : *génogramme vierge* (110) + *génogramme gratuit* (170) en H2 secondaire. Insister sur "modèle vierge en ligne, sans téléchargement".
- **`/genogramme-ecocarte`** — page comparative + outil. Cible : *écocarte* (20) + *génogramme et écocarte* (10) — petit volume mais zéro concurrence FR sérieuse, et c'est l'angle qui fait vivre genogramanalytics.

### 2. Optimiser 3 pages existantes (positions 19-64 → page 1)

- **`/genogramme`** (pilier définition) — actuellement pos. 19-64 sur 4 mots-clés à fort volume. Action : enrichir avec une intro plus dense, ajouter FAQ (PAA Google), table des matières, internal linking vers les nouvelles pages. Title à intégrer "génogramme famille" et "symboles".
- **`/symboles-genogramme`** — pos. 25 sur *symboles génogramme* (20) et *symboles du génogramme* (140). Action : passer en page de référence visuelle exhaustive (légende + PDF téléchargeable, comme le fait genopro avec son PDF qui rank #1).
- **`/comment-faire-un-genogramme`** — déjà retravaillé récemment. Vérifier que le H1 et l'intro contiennent exactement "comment faire un génogramme" + "en ligne" (currently pos. 10 sur "génogramme en ligne", très proche du top 3).

### 3. Quick win : asset téléchargeable

genopro classe au top 1 sur "genogram key" grâce à un simple **PDF de symboles**. Action : générer un **`genogramme-symboles.pdf`** (légende McGoldrick) lié depuis `/symboles-genogramme`, indexable, qui peut grappiller du trafic et des backlinks éducatifs.

---

## Récapitulatif technique

- 3 nouvelles routes React + entrées sitemap.xml + traductions fr/en/de + composants `SeoLinks` & `Helmet`.
- 3 pages existantes à enrichir (contenu + meta).
- 1 PDF à générer et héberger dans `/public/`.
- Pas de changement backend, pas de migration DB.

## Hors périmètre

- Versions EN/DE des nouvelles pages : à faire dans un second temps, une fois la version FR validée et indexée.
- Acquisition de backlinks (hors-codebase).
