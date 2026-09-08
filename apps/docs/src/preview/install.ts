import { SITE_URL } from "../lib/site";

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const;
export type PackageManager = (typeof packageManagers)[number];
const runners = { pnpm: "pnpm dlx", npm: "npx", yarn: "yarn dlx", bun: "bunx" };
export function registryCommand(slug: string, manager: PackageManager = "pnpm") {
  return `${runners[manager]} shadcn@latest add ${SITE_URL}/r/${slug}.json`;
}
