"use client";
import { useLocale } from "@/i18n/LocaleProvider";

import { Button } from "@/components/motion/button/base";

import { useState } from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import type { MediaComponentMeta } from "../catalog";
import { packageManagers, registryCommand, cliCommand, type PackageManager } from "../install";
import { copyText } from "./code-actions";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/motion/select";

export default function InstallPanel({ component }: { component: MediaComponentMeta }) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const [manager, setManager] = useState<PackageManager>("pnpm");
  const [installer, setInstaller] = useState("media-rig");
  const [mode, setMode] = useState("cli");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState(false);
  const command = installer === "media-rig" ? cliCommand(component.slug, manager) : registryCommand(component.slug, manager);
  const copy = async () => {
    try { await copyText(command); setCopied(command); setError(false); }
    catch { setError(true); }
  };
  const control = "rounded-lg bg-[#242424] px-3 py-2 text-xs text-white/65 outline-none transition-colors hover:bg-[#303030] focus-visible:ring-2 focus-visible:ring-white/50";
  return (
    <section className="rounded-2xl bg-[#181818] p-2.5" aria-label={`${component.title} ${t("安装")}`}>
      <div className="flex flex-wrap items-center gap-3 px-2 py-3">
        <h3 className="mr-auto text-sm font-semibold">{t("Install")}</h3>
        <Tabs value={mode} onValueChange={setMode} variant="segment">
          <TabsList aria-label={t("安装方式")} className="bg-transparent">
            {([['cli', 'CLI'], ['manual', '手动']] as const).map(([value, label]) => <TabsTrigger key={value} value={value} className="px-3 py-2 text-xs" indicatorClassName="bg-primary">{t(label)}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        {mode === "cli" && <>
          <Select value={manager} onValueChange={value => { setManager(value as PackageManager); setError(false); }}>
            <SelectTrigger aria-label={t("包管理器")} className="h-9 min-w-24 rounded-lg border-0 bg-[#242424] text-xs text-white/65 shadow-none hover:bg-[#303030] dark:bg-[#242424] dark:hover:bg-[#303030]"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl border-white/[0.04] duration-150">
              {packageManagers.map(item => <SelectItem key={item} value={item} className="rounded-lg py-2 text-xs">{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={installer} onValueChange={value => { setInstaller(value); setError(false); }}>
            <SelectTrigger aria-label={t("安装工具")} className="h-9 min-w-28 rounded-lg border-0 bg-[#242424] text-xs text-white/65 shadow-none hover:bg-[#303030] dark:bg-[#242424] dark:hover:bg-[#303030]"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl border-white/[0.04] duration-150">
              <SelectItem value="media-rig" className="rounded-lg py-2 text-xs">MediaRig</SelectItem>
              <SelectItem value="shadcn" className="rounded-lg py-2 text-xs">shadcn</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" type="button" onClick={copy} aria-label={t("复制安装命令")} className={control}>{copied === command ? <Check size={16} /> : <Copy size={16} />}</Button>
        </>}
      </div>
      <AnimatePresence initial={false} mode="wait">
      {mode === "cli" ? <motion.pre key="cli" initial={{opacity:0, y:reduceMotion ? 0 : 4}} animate={{opacity:1, y:0}} exit={{opacity:0}} transition={{duration:reduceMotion ? 0 : 0.14}} className="overflow-x-auto rounded-xl bg-[#111111] p-5 font-mono text-sm leading-7 text-white/80 [scrollbar-width:thin]" tabIndex={0}><AnimatePresence initial={false} mode="wait"><motion.code key={command} className="block" initial={{opacity:0, y:reduceMotion ? 0 : 3}} animate={{opacity:1, y:0}} exit={{opacity:0}} transition={{duration:reduceMotion ? 0 : 0.1}}>{command}</motion.code></AnimatePresence></motion.pre> :
        <motion.div key="manual" initial={{opacity:0, y:reduceMotion ? 0 : 4}} animate={{opacity:1, y:0}} exit={{opacity:0}} transition={{duration:reduceMotion ? 0 : 0.14}} className="space-y-3 rounded-xl bg-[#111111] p-5 text-sm leading-6 text-white/60">
          <p>{t("1. 下载源码清单，将 files 中的 content 按 target 路径保存；@components 对应项目的组件目录。")}</p>
          <p>{t("2. 安装清单中的 dependencies 和 devDependencies，保留组件的 CSS 文件和相对引用。")}</p>
          <p>{t("3. 使用下方示例接入，并替换示例图片与业务回调。")}</p>
          <div className="flex flex-wrap gap-4">
            <a className="inline-flex items-center gap-2 text-white/80 hover:text-white" href={`/r/${component.slug}.json`} download={`${component.slug}.json`}><Download size={15} />{t("下载源码清单 (.json)")}</a>
            <a className="inline-flex items-center gap-2 text-white/80 hover:text-white" href={`https://github.com/Hello-job/media-rig/tree/main/packages/media-rig/src/components/${component.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={15} />{t("查看组件源码")}</a>
          </div>
        </motion.div>}
      </AnimatePresence>
      <p role="status" className="px-2 pt-2 text-xs text-white/45">{t(error ? "复制失败，请手动选择命令复制。" : copied === command && mode === 'cli' ? "安装命令已复制" : "")}</p>
      <BouncyAccordion className="mt-2" classNames={{ trigger: "py-3 text-xs", description: "text-xs leading-6 text-muted-foreground" }} items={[{ id: "setup", title: t("首次安装与环境配置"), description: <>
        <p className="mt-3">{t("目标项目使用 React 19 / Tailwind CSS 4。没有 components.json 时先运行")} <code>pnpm dlx media-rig@latest init</code>{t("。CLI 需要 Node.js 22.12+ 和 npm/npx。")}</p>
        <p className="mt-2">{t("pnpm 11 项目在 pnpm-workspace.yaml 合并以下配置，跳过浏览器不需要的 canvas 原生构建并统一 Three.js 类型：")}</p>
        <pre className="my-2 overflow-x-auto rounded-lg bg-[#111111] p-3"><code>{`allowBuilds:\n  canvas: false\noverrides:\n  '@types/three': '^0.168.0'`}</code></pre>
        <p>{t("保留项目已有配置；已有 Three.js 依赖时先检查兼容性。示例素材和业务接口由宿主提供。")}</p>
      </> }]} />
    </section>
  );
}
