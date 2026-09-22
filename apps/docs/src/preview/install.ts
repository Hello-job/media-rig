import { SITE_URL } from "../lib/site";

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const;
export type PackageManager = (typeof packageManagers)[number];
const runners = { pnpm: "pnpm dlx", npm: "npx", yarn: "yarn dlx", bun: "bunx" };
export function registryCommand(slug: string, manager: PackageManager = "pnpm") {
  return `${runners[manager]} shadcn@latest add ${SITE_URL}/r/${slug}.json`;
}

export function cliCommand(slug: string, manager: PackageManager = "pnpm") {
  return `${runners[manager]} media-rig@latest add ${slug}`;
}

export function localUsageSource(source: string, slug: string) {
  // Published examples must not depend on the documentation site's locale provider.
  const standalone = source
    .replace(/^\s*["']use client["'];?\s*/m, "")
    .replace(/^import \{ useLocale \} from ["']@\/i18n\/LocaleProvider["'];?\n/gm, "")
    .replace(/^\s*const \{ t, locale \} = useLocale\(\);\n/gm, "\n")
    .replace(/\bt\(([^()]*)\)/g, "$1")
    .replace(/locale=\{locale\}/g, 'locale="zh-CN"');
  return `"use client";\n\n${standalone.replace(/from (["'])media-rig(?:\/[^"']+)?\1/g, `from "@/components/${slug}"`)}`;
}
