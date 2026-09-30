# Deployment

**Public demo:** https://dual1208.github.io/unspool/

**Source:** https://github.com/dual1208/unspool

The app is hosted on GitHub Pages with HTTPS enforced. The `main` branch builds, runs the context-integrity tests, and publishes `dist/` using `.github/workflows/pages.yml`. The browser demo requires no API key or account.

## Domain configuration

On September 30, 2026, the owner authorized removal of the stale `immersivelanguagelearning.me` custom domain from the account's existing `dual1208.github.io` Pages site. GitHub removed its CNAME file and restored the default HTTPS domain. Unspool now uses `https://dual1208.github.io/unspool/` directly.

This account-level change also restores the default `dual1208.github.io` URLs for other project sites that inherited that domain. The Unspool repository has no custom CNAME and requires no separately registered domain.

## Local preview

```sh
npm ci
npm run dev
```

For the production bundle, run `npm run build` and `npm run preview`.
