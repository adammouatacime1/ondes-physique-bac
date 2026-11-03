# Vérifications de livraison

Validation du 3 novembre 2026, dans l’environnement cloud ; les fichiers de rapport bruts et les captures sont générés dans `artifacts/` (non suivis par Git).

## Réalisé et vérifié

- `npm ci --no-audit --no-fund` : installation reproductible depuis le verrouillage.
- `npm test` : 10 tests exécutés, 10 réussis, aucun ignoré. Relations retard/période/longueur d’onde/phase, causalité de l’impulsion et sens +x, conservation de f, λ₀/n, géométrie exacte de diffraction, minima, limite du sinus cardinal, dépendances λ/D/a, virgule, formules KaTeX, structure pédagogique et barème.
- Tous les résultats numériques des 27 exercices sont recalculés indépendamment dans le test scientifique. Les questions de raisonnement utilisent une grille d’autoévaluation.
- `npm run build` : vérification TypeScript et build Vite réussis. Les formules et les polices sont locales ; aucun backend ou secret requis.
- Test navigateur exécuté sur le build statique servi sous `/ondes-physique-bac/`, avec Chromium : 94 contrôles réussis, aucune erreur JavaScript. Résolutions 390×844 avec toucher et 1440×1000, préférence de réduction des animations activée.
- Navigation sur les 21 notions, les 11 laboratoires, fiches, ressources, exercices, devoir et page d’information chimie. Absence de débordement horizontal du document et d’erreur de formule.
- Paramètres au clavier, temps manuel, lecture/pause/recommencement, paramètres initiaux, présélection d’opposition, invariance de T et λ avec l’amplitude, réponse à la fréquence, élargissement de la tache quand a diminue, progression après rechargement, réponse avec virgule, corrigé masqué, devoir et impression avec détails ouverts.
- Suspension de l’animation hors écran vérifiée ; le moteur annule aussi sa boucle quand l’onglet est masqué. Les simulations démarrent toutes en pause, sans flash stroboscopique.
- Captures de deux états de chaque simulation ; inspection visuelle de l’accueil mobile, du banc optique mobile, de la chaîne longitudinale, de la phase sur ordinateur et de l’interface lumineuse sur mobile. PDF d’exercices imprimés générés.

## Limites distinctes des résultats locaux

- Pas d’essai sur un appareil iPhone 13 physique ou Safari : le format et les interactions tactiles ont été vérifiés dans Chromium.
- Aucun cours de chimie ni document de cours n’était présent dans le dépôt initial. Son fonctionnement ne peut donc pas être testé. Aucun ancien fichier ou stockage de chimie n’a été modifié.
- Les fronts de diffraction mécanique sont illustratifs (Huygens simplifié) ; les amplitudes et les interférences ne sont pas résolues. Le prisme est qualitatif. Les couleurs et le contraste de l’écran optique sont illustratifs. Les conditions et conventions sont indiquées dans le site et README.md.
- Le programme officiel n’a pas été vérifié ; aucune conformité officielle n’est affirmée.
- La validation locale du build ne prouve ni le succès du workflow GitHub Actions ni le déploiement public. L’accès à l’API GitHub Pages est refusé par le proxy HTTP de cette session. Les domaines nécessaires (`api.github.com`, `adammouatacime1.github.io`) ont été ajoutés au brouillon de configuration, mais leur application exige la sauvegarde/publication des paramètres de l’environnement. Le workflow Pages livré reste soumis aux droits et réglages du dépôt.

## Publication distante observée

Le code a été poussé sur `main`, commit `ce0cdcf5d5c56a6ce022be2c7c36f458ca3870da`. Le workflow a effectivement démarré : https://github.com/adammouatacime1/ondes-physique-bac/actions/runs/41682804353 . Son exécution a duré 52 secondes, avec un artefact `verifications-navigateur` de 6,78 Mo. Elle a échoué à `actions/configure-pages` : le site Pages n’existe pas (`Not Found`) et le jeton Actions n’a pas le droit de le créer (`Resource not accessible by integration`). Le job deploy n’a pas été exécuté. Aucun lien de site publié n’est donc annoncé.

Action propriétaire requise : ouvrir **Settings → Pages → Build and deployment → Source : GitHub Actions**, puis **Actions → Vérifier et déployer le site → Run workflow** sur `main` (ou relancer l’exécution). Cette activation administrative n’est pas réalisable avec le jeton d’intégration disponible. Après activation, vérifier le job deploy et le site réellement servi. Le refus API par le proxy de la session reste distinct du refus de droits reçu par le runner GitHub.

Les scripts reproductibles `install_script` et `start_skill`, ainsi que les deux domaines réseau requis pour les vérifications GitHub, ont été sauvegardés dans le brouillon de l’environnement cloud. La sauvegarde du brouillon n’applique ni ne publie ses changements : ils sont à revoir et publier dans les paramètres de l’environnement.
