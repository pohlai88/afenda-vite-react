import rootConfig from '../../prettier.config.js'

/** Prettier + Tailwind v4: point the class sorter at the package CSS entry (theme + @source). */
export default {
  ...rootConfig,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet:
    './design-architecture/src/prettier-tailwind-stylesheet.css',
}
