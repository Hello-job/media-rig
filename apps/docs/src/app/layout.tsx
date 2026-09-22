import { cookies } from "next/headers";
import { LocaleProvider } from "../i18n/LocaleProvider";
import { LOCALE_COOKIE } from "../i18n/messages";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_DESCRIPTION, SITE_URL } from "../lib/site";
import "../preview/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "MediaRig — React 图片与 3D 媒体组件库", template: "%s | MediaRig" },
  description: SITE_DESCRIPTION,
  openGraph: { type: "website", siteName: "MediaRig", locale: "zh_CN", title: "MediaRig — React 媒体组件库", description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image" },
};
export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = (await cookies()).get(LOCALE_COOKIE)?.value === "en-US" ? "en-US" : "zh-CN";
  return <html lang={locale} className="dark"><body><LocaleProvider initialLocale={locale}>{children}</LocaleProvider></body></html>;
}
