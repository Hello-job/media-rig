"use client";

import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { useLocale } from "./LocaleProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return <Select value={locale} onValueChange={value => setLocale(value === "en-US" ? "en-US" : "zh-CN")} className="relative z-50 shrink-0">
    <SelectTrigger aria-label={t("切换语言")} className="h-9 min-w-28 gap-2 border-white/10 bg-white/5 px-3 text-xs">
      <Languages size={15} aria-hidden="true" /><SelectValue />
    </SelectTrigger>
    <SelectContent className="min-w-32 border-white/10 bg-[#242424]">
      <SelectItem value="zh-CN">简体中文</SelectItem>
      <SelectItem value="en-US">English</SelectItem>
    </SelectContent>
  </Select>;
}
