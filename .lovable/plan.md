

## Problème

Le `CORNER_INSET = 10` décale les points d'ancrage de 10px **à l'intérieur** de la carte. Comme les cartes ont un `z-index: 2` et le SVG un `z-index: 1`, les extrémités des lignes sont cachées sous la carte, créant un espace visible entre la fin de la courbe et le bord de la carte.

Pour `rounded-xl` (rayon de 12px), le point où la bordure arrondie rejoint le coin mathématique est à environ 3.5px du coin. Mettre `CORNER_INSET = 0` ferait que les lignes terminent exactement au coin géométrique de la carte — le point le plus externe — ce qui donne l'impression visuelle qu'elles touchent la carte.

## Plan

**Un seul changement dans `src/pages/GenogramEditor.tsx` ligne 31 :**

Passer `CORNER_INSET` de `10` à `0` pour que les ancres correspondent exactement aux coins de la bounding box de la carte.

