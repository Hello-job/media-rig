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
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="zh-CN" className="dark"><body>{children}</body></html>;
}
