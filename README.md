# Sud'perbe

**Vue mer, prix mistral.** Site : https://alexandrecavaillon-afk.github.io/rivages-sud/

Toutes les maisons, villas et appartements avec vue mer à vendre qu'on peut lire en ligne, de Menton à Cerbère : photos, fiches détaillées, carte, filtres par équipement.

## Comment il se met à jour

Deux fois par jour (7 h et 19 h à Paris l'été, 6 h et 18 h l'hiver), GitHub lance Claude avec les consignes de `CLAUDE.md`. Claude relit les sites d'annonces, ajoute les nouveautés, retire les biens vendus et met les prix à jour. Un garde-fou (`scripts/verifier.js`) contrôle tout avant la mise en ligne : un passage raté ne peut pas vider le site.

- Lancer un passage tout de suite : onglet **Actions** → « Mise à jour des annonces » → **Run workflow**.
- Voir ce qui a changé : onglet **Actions**, ou l'historique des commits « Annonces : … ».
- Le code d'accès Claude (`CLAUDE_CODE_OAUTH_TOKEN`, dans Settings → Secrets and variables → Actions) est valable un an. Pour le renouveler : `claude setup-token` sur ton ordinateur, puis remplace la valeur du secret.

## Fichiers

- `data/biens.json` : les biens en ligne · `data/attente.json` : biens sans photo, retentés à chaque passage pendant une semaine
- `data/sources.json` : les pages surveillées · `data/communes.json` : positions pour la carte
- `site/modele.html` : le site · `scripts/build.js` : construit `index.html`
