# tamenso.com

Static site, served free by GitHub Pages (custom domain in `CNAME`).

## Change the words
Edit `src/content/en.json`, `src/content/it.json` or `src/content/fr.json`, then run:

    python3 build.py

This rebuilds `index.html` (English), `it/index.html` and `fr/index.html`. Commit everything and push.

## Change the layout
`src/template.html` (structure, shared by all three languages) and `styles.css`.
Every `{{key}}` in the template must exist in all three JSON files; the build stops and names any missing key.

## Pages
- `/` English · `/it/` Italiano · `/fr/` Français
- `/mentions-legales.html` legal notice (fill in SIREN and address)
