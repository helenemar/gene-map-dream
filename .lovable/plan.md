

## Diagnostic

L'export produit des pages quasi-blanches car **html2canvas ne sait pas rendre les SVGs complexes** utilisés pour les liens familiaux et émotionnels. Les problèmes concrets :

1. **Couleurs CSS variables** : les strokes utilisent `hsl(var(--foreground))` que html2canvas ne résout pas
2. **SVGs overflow:visible** : les SVGs ont `width:1, height:1` avec `overflow:visible` -- html2canvas clip au dimensions déclarées  
3. **Masques SVG** : le `<mask id="card-depth-mask">` rend les liens invisibles dans la capture
4. **Fondamentalement** : html2canvas est conçu pour le HTML, pas pour des SVGs complexes avec Bézier, defs/masks, etc.

## Approche : Remplacement complet de la stratégie d'export

Abandonner html2canvas au profit d'un **rendu SVG natif** converti en image via le navigateur :

### Etape 1 -- Construire un SVG complet programmatiquement

Créer une fonction `buildExportSvg()` dans `exportCanvas.ts` qui :
- Collecte tous les SVGs enfants du content div (liens familiaux, émotionnels, guides)
- Clone et résout toutes les couleurs CSS variables en valeurs concrètes (rgb/hex)
- Capture les cartes membres via `<foreignObject>` avec leurs styles inline complets
- Assemble le tout dans un seul SVG avec le bon viewBox

### Etape 2 -- SVG → Canvas via Image native

```text
SVG string → Blob URL → new Image() → canvas.drawImage()
```

Le navigateur rend le SVG nativement (il gère parfaitement les Bézier, masks, etc.), puis on dessine l'image résultante sur un canvas HTML5 standard.

### Etape 3 -- Canvas → PNG / PDF

- PNG : `canvas.toBlob()` comme avant
- PDF : `canvas.toDataURL()` + jsPDF comme avant  
- SVG : télécharger directement le SVG assemblé

### Fichiers modifiés

- **`src/utils/exportCanvas.ts`** : Réécriture complète de `captureCanvas()` avec la nouvelle approche SVG→Image→Canvas. Conservation de l'API publique (`exportAsPng`, `exportAsPdf`, `exportAsSvg`).

### Détail technique de la résolution des couleurs

Pour chaque élément SVG cloné, on itère sur les attributs `stroke`, `fill`, `opacity` et on résout les `var()` via un élément temporaire injecté dans le DOM. On résout aussi les classes Tailwind (`fill-muted-foreground`, etc.) en lisant `getComputedStyle` sur l'élément original.

### Gestion des foreignObject (cartes)

Pour chaque `[data-member-card]`, on sérialise le HTML avec les styles computés inlinés (pas de classes CSS, tout en `style="..."`) pour que le SVG soit auto-suffisant. Cela inclut les couleurs de fond, bordures, polices, tailles.

