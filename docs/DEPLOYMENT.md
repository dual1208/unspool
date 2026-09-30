# Deployment status

The public repository is [dual1208/unspool](https://github.com/dual1208/unspool). Its `main` branch builds, runs the eight context-integrity tests, and deploys to GitHub Pages using `.github/workflows/pages.yml`.

The initial [GitHub Actions run](https://github.com/dual1208/unspool/actions/runs/36687349394) completed successfully. The local production build also passed.

## Existing domain blocker

At verification on September 30, 2026, `https://dual1208.github.io/unspool/` returned HTTP 301 to `http://immersivelanguagelearning.me/unspool/`. The inherited domain did not resolve from the local environment.

The account's existing `dual1208.github.io` Pages site has `cname: immersivelanguagelearning.me`. This project has no separate CNAME. Removing the account site's custom domain would affect its other project-site URLs, so that setting has been left unchanged pending the owner's decision. A successful deployment does not establish a usable hosted URL while this redirect is unresolved.

## Local preview

```sh
npm ci
npm run dev
```

The current local demo is served at `http://127.0.0.1:5173/` while its development server is running. For the production bundle, run `npm run build` and `npm run preview`.

Restoring the existing domain's DNS or explicitly removing that domain from the account-level Pages site would resolve the external routing dependency. Neither requires changing the application.
