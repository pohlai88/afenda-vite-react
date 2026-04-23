/**
 * lint-staged: run with `pnpm exec lint-staged --concurrent false` (see package.json
 * simple-git-hooks) to serialize tasks and avoid parallel Prettier + ESLint OOM on
 * large commits. Prettier scopes Tailwind to UI surfaces — see root prettier.config.js.
 *
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.ipynb": ["pnpm run script:check-notebook-governance --"],
  "*.{js,mjs,cjs,ts,tsx,jsx,css,scss,md,json,yml,yaml,html}": [
    "prettier --write --ignore-unknown",
  ],
  "apps/**/*.{js,mjs,cjs,ts,tsx,jsx}": [
    "node -e \"require('node:fs').mkdirSync('.artifacts/eslint',{recursive:true})\" && eslint --cache --cache-location .artifacts/eslint --fix --concurrency auto",
  ],
  "packages/**/*.{js,mjs,cjs,ts,tsx,jsx}": [
    "node -e \"require('node:fs').mkdirSync('.artifacts/eslint',{recursive:true})\" && eslint --cache --cache-location .artifacts/eslint --fix --concurrency auto",
  ],
}
