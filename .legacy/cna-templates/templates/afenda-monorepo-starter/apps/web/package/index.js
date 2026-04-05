const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  const packageScope = setup && setup.packageScope ? String(setup.packageScope) : "";
  const trimmed = packageScope.replace(/\/$/, "");
  const name = trimmed ? `${trimmed}/web` : appName;

  const mergedDev = { ...devDependencies };
  if (trimmed) {
    mergedDev[`${trimmed}/tsconfig`] = "workspace:*";
  }

  const packageJson = {
    name,
    private: true,
    version: "0.0.0",
    type: "module",
    description: "Afenda web app (React + Vite) created by create-awesome-node-app",
    engines: {
      node: ">=18.15",
    },
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    },
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
      format: 'prettier --ignore-path .gitignore -u --write .',
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      "type-check": "tsc --noEmit",
    },
  };

  return { ...packageJson, dependencies, devDependencies: mergedDev };
};
