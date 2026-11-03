# Ondes · Atelier de physique

Site pédagogique statique en français pour travailler les ondes en 2e Bac Sciences Mathématiques A au Maroc. Le dépôt initial ne contenait qu’un titre README : aucun cours de chimie ni document personnel de cours n’était disponible. La page Chimie explique cette limite ; elle ne prétend pas restituer un cours absent. Aucune conformité officielle au programme n’est revendiquée.

## Développement

Node.js 24 (22 compatible), npm :

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Utiliser le checkout existant ; un worktree n’est pas nécessaire. Aucune clé, aucun compte et aucun backend ne sont nécessaires. Formules KaTeX et polices servies localement. Les processus doivent être relancés après restauration d’une machine.

## Contenu

- 3 chapitres, 21 notions suivant neuf étapes pédagogiques, dont la stroboscopie facultative.
- 11 laboratoires : impulsion sur corde, onde longitudinale, microphones impulsionnels, onde périodique, phase, microphones périodiques, diffraction mécanique, stroboscope, interface lumineuse, fente de Fraunhofer, prisme.
- 27 exercices originaux, dont 3 synthèses ; indices progressifs, réponses numériques avec virgule et tolérance 2 %, grilles d’autoévaluation, corrigés masqués.
- Devoir blanc original de 60 minutes, barème /20 et corrigé séparé.
- Deux parcours, fiches, glossaire, unités, confusions, thèmes, progression locale et impression de la page en cours.

La progression utilise `ondes-progression-v1`, le thème `ondes-theme`. Les données restent dans le navigateur et peuvent être effacées par ses réglages. Aucune clé de chimie n’est lue ni modifiée.

## Modèles et limites

`src/physics.ts` contient les relations testées. Ondes mécaniques : petites perturbations, milieu homogène non dispersif sans amortissement sauf mention contraire. L’impulsion est un cosinus compact causal. Les ondes sinusoïdales sont montrées en régime déjà établi. Le son est une tension proportionnelle à la pression ; l’atténuation optionnelle est un gain de pression 1/r. La représentation verticale des rides d’eau est simplifiée. La diffraction mécanique montre des fronts de Huygens illustratifs, sans calcul exact des amplitudes ou des interférences.

Phase : Δφ=φ₂−φ₁=−2πd/λ, pour une onde allant vers +x. Les cercles utilisent cette même phase ; le retard absolu ne se déduit pas uniquement de sinusoïdes modulo une période. La stroboscopie représente des positions échantillonnées sans flash ; le saut apparent est réduit à [−π,π[.

Lumière : interface à incidence normale, fréquence conservée et phase raccordée, temps en fs très ralenti. Fente unique : intensité de Fraunhofer, géométrie exacte sur l’écran, comparaison petits angles et nombre de Fresnel affiché. Le champ avant la fente est un dessin non à l’échelle ; l’intensité moyenne de l’écran est stationnaire. La conversion λ/couleur et l’exposition de l’écran sont illustratives. Le prisme est explicitement qualitatif, sans calcul quantitatif des trajectoires ; ses traits mobiles représentent une propagation illustrative. Les contenus distinguent diffraction, réfraction et dispersion.

## Vérification

```sh
npm test
npm run build
# Démarrer le serveur dans un autre terminal avant cette commande :
npm run test:browser
```

Le test navigateur nécessite Chromium, par défaut `/usr/bin/chromium`. Autre option : `npx playwright-core install --with-deps chromium`, puis fournir `CHROMIUM_PATH` avec le chemin retourné par `chromium.executablePath()`. `TEST_URL` permet de tester un serveur de production ou un sous-chemin. Les rapports, captures et PDF sont générés dans `artifacts/` (ignoré par Git).

Les tests couvrent les relations physiques, les formules KaTeX, les résultats numériques, le barème, les états de simulation, les paramètres au clavier, la virgule décimale, la progression après rechargement, les corrigés, l’arrêt hors écran et l’impression. Les captures 390×844 et 1440×1000 servent à l’inspection visuelle ; ce ne sont pas des tests sur un iPhone physique ni sur Safari.

## GitHub Pages

`base: './'`, ressources relatives et routes par fragments : compatible avec le sous-chemin du dépôt. Le workflow `.github/workflows/pages.yml` installe, teste, construit, contrôle le navigateur, puis publie `dist/` via GitHub Actions. Dans les réglages du dépôt, Pages doit utiliser **GitHub Actions** ; l’activation automatique peut nécessiter des droits administrateur que le jeton Actions ne possède pas. Un push de code ou un build local ne prouve pas un déploiement réussi : vérifier le job deploy et la page réellement servie.

Voir DESIGN-KIT.md pour la provenance du kit et VALIDATION.md pour les résultats de livraison.
