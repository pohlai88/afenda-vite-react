/**
 * Marketing landing entry: same component is mounted for `/` (index) and `/marketing`.
 * It randomly selects one default-export page from `pages/marketing/` per session.
 *
 * @see ./marketing/marketing-random-home.tsx
 */
export { default } from "./marketing/marketing-random-home";
