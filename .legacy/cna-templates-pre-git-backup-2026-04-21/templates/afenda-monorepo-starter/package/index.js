const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(_setup, { appName, runCommand, usePnpm }) {
  const packageJson = {
    name: appName,
    private: true,
    type: "module",
    packageManager: "pnpm@10.33.0",
    engines: {
      node: "^20.19.0 || >=22.12.0",
    },
    scripts: {
      preinstall: "npx only-allow pnpm",
      postinstall: "simple-git-hooks",
      build: "turbo run build",
      dev: "turbo run dev",
      lint: "turbo run lint",
      typecheck: "turbo run typecheck",
      test: "turbo run test",
      "test:run": "turbo run test:run",
      "test:coverage": "turbo run test:coverage",
      format: "turbo run format",
      "format:check": "turbo run format:check",
      check: "turbo run lint typecheck test:run build",
      preview: "turbo run preview",
    },
    devDependencies,
    "simple-git-hooks": {
      "pre-commit": "pnpm exec lint-staged",
    },
    "lint-staged": {
      "*.{js,mjs,cjs,ts,tsx,jsx,css,scss,md,json,yml,yaml,html}": [
        "prettier --write --ignore-unknown",
      ],
      "apps/**/*.{js,mjs,cjs,ts,tsx,jsx}": [
        "eslint --cache --cache-location .eslintcache --fix --concurrency auto",
      ],
      "packages/**/*.{js,mjs,cjs,ts,tsx,jsx}": [
        "eslint --cache --cache-location .eslintcache --fix --concurrency auto",
      ],
    },
  };

  if (!usePnpm) {
    packageJson.workspaces = ["apps/*", "packages/*"];
  }

  return packageJson;
};
