"use client";
import { useLocale } from "@/i18n/LocaleProvider";
export default function NotFound() {
  const { t, locale } = useLocale();
  return <main className="grid min-h-screen place-content-center gap-5 text-center"><h1 className="text-3xl font-semibold">{t("找不到这个组件")}</h1><p className="text-white/50">{t("页面可能已移动，请从组件目录重新选择。")}</p><a href="/components" className="text-white underline">{t("返回组件目录")}</a></main>;
}
