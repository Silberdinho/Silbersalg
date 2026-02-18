# Silbersalg

## GitHub Pages deploy

Dette repoet deployer automatisk statisk frontend fra `Silbersalg/` til GitHub Pages via workflowen:

- `.github/workflows/deploy-pages.yml`

### Aktivering i GitHub

1. Gå til **Settings → Pages** i repoet.
2. Sett **Build and deployment → Source** til **GitHub Actions**.
3. Push til `main` for å trigge deploy.

Forventet URL:

- `https://silberdinho.github.io/Silbersalg/`

## Viktig om backend

Nettsiden kjører som statiske filer på GitHub Pages. Kall i `app.js` mot `http://localhost:3000` fungerer bare lokalt, ikke på live Pages uten en separat publisert backend.