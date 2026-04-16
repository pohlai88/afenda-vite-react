/**
 * lint-staged: run with `pnpm exec lint-staged --concurrent false` (see package.json
 * simple-git-hooks) to serialize tasks and avoid parallel Prettier + ESLint OOM on
 * large commits. Prettier scopes Tailwind to UI surfaces — see root prettier.config.js.
 *
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{js,mjs,cjs,ts,tsx,jsx,css,scss,md,json,yml,yaml,html}": [
    "prettier --write --ignore-unknown",
  ],
  "apps/**/*.{js,mjs,cjs,ts,tsx,jsx}": [
    "eslint --cache --cache-location .eslintcache --fix --concurrency auto",
  ],
  "packages/**/*.{js,mjs,cjs,ts,tsx,jsx}": [
    "eslint --cache --cache-location .eslintcache --fix --concurrency auto",
  ],
}
