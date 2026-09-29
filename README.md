# Sud'perbe

**Vue mer, prix mistral.** Site : https://alexandrecavaillon-afk.github.io/rivages-sud/

Maisons, villas et appartements avec vue mer à vendre sur la côte méditerranéenne française : photos, fiches détaillées, carte, filtres par équipement.

## Comment il se met à jour

Deux fois par jour (7 h et 19 h à Paris l'été, 6 h et 18 h l'hiver), GitHub lance Claude avec les consignes de `CLAUDE.md`. Claude relit les sites d'annonces, ajoute les nouveautés, retire les biens vendus et met les prix à jour. Un garde-fou (`scripts/verifier.js`) contrôle tout avant la mise en ligne : un passage raté ne peut pas vider le site.

- Lancer un passage tout de suite : onglet **Actions** → « Mise à jour des annonces » → **Run workflow**.
- Voir ce qui a changé : onglet **Actions**, ou l'historique des commits « Annonces : … ».
- Le code d'accès Claude (`CLAUDE_CODE_OAUTH_TOKEN`, dans Settings → Secrets and variables → Actions) est valable un an. Pour le renouveler : `claude setup-token` sur ton ordinateur, puis remplace la valeur du secret.

## Fichiers

- `data/biens.json` : les biens en ligne · `data/attente.json` : biens sans photo, retentés à chaque passage pendant une semaine
- `data/sources.json` : les pages surveillées · `data/communes.json` : positions pour la carte
- `site/modele.html`, `site/style.css`, `site/app.js` : le site · `site/pages/` : mentions légales, confidentialité, conditions, page 404
- `site/vendor/` et `site/fonts/` : bibliothèques de la carte et polices, hébergées sur le site (versions dans `site/vendor/VERSIONS.md`)
- `site/lancement.json` : `public` passe à `true` au lancement (le site devient indexable), `domaine` reçoit le nom de domaine
- `scripts/build.js` : construit le site dans `_site/` (seul ce dossier est mis en ligne)

## Sécurité

- Site statique : pas de serveur, pas de base de données, pas de compte, pas de formulaire, aucune clé dans le code.
- Politique de sécurité du contenu stricte (aucun script ni style venant d'ailleurs), liens et photos filtrés (`http`/`https` uniquement), textes des annonces nettoyés par `scripts/commun.js`.
- Dans GitHub Actions, Claude tourne avec un jeton en lecture seule et des droits limités ; seuls quatre fichiers de données passent à l'étape de publication, qui les contrôle avant de construire le site. Actions figées sur l'empreinte de leur version.
