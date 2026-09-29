# Bibliothèques hébergées sur le site

Copiées telles quelles depuis npm (les commentaires de carte source sont retirés à la construction). Empreintes SHA-256 :

| Fichier | Paquet | Version | SHA-256 |
|---|---|---|---|
| leaflet.js | leaflet | 1.9.4 | `db49d009c841f5ca34a888c96511ae936fd9f5533e90d8b2c4d57596f4e5641a` |
| leaflet.css | leaflet | 1.9.4 | `a7837102824184820dfa198d1ebcd109ff6d0ff9a2672a074b9a1b4d147d04c6` |
| leaflet.markercluster.js | leaflet.markercluster | 1.5.3 | `1e4e1d22972a3926f48598e0caf14e3fe7049835d428a344fed4f9e3665b3508` |
| MarkerCluster.css | leaflet.markercluster | 1.5.3 | `614dea0a98ff3f4ead74f04918f6b1d1b9ba435c25b5fc23b21a394d1e3e4d87` |
| maplibre-gl.mjs | maplibre-gl | 6.11.2 | `3f55566295583644617fe17d008a36c580414b8c71dd2e1fcff1309de6fdee5d` |
| maplibre-gl-shared.mjs | maplibre-gl | 6.11.2 | `76b5f55bdee928c65d592684aaff2b913d50b6b17b0ec6334e88b09b6aa47960` |
| maplibre-gl-worker.mjs | maplibre-gl | 6.11.2 | `01ad197aa7f4cec258a890febd71b7515e96309881b036a7095befc01a45296e` |
| leaflet-maplibre-gl.js | @maplibre/maplibre-gl-leaflet | 0.1.4 | `1e6cf8cb3eb5fd909879aa1bf36a383fb506c9a5b2dbbfababce65a294dd1fcb` |

Polices (site/fonts) : @fontsource/mulish 5.3.0 et @fontsource/alice 5.3.0, licence SIL OFL 1.1.

MapLibre GL 6.11.2 corrige la faille GHSA-jrc7-96c5-q579 (versions 6.4.0 et antérieures). Vérification : `npm audit` sans alerte le 30/09/2026.
