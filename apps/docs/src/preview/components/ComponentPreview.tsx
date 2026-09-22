"use client";
import { useLocale } from "@/i18n/LocaleProvider";

import dynamic from "next/dynamic";
import { Button } from "@/components/motion/button/base";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, Code2, Copy, Download, Eye, Link2, SlidersHorizontal } from "lucide-react";
import type { MediaComponentMeta } from "../catalog";
import { cliCommand, localUsageSource } from "../install";
import InstallPanel from "./InstallPanel";
import { MotionConfig } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/motion/tabs";
import { MorphPopover, MorphPopoverTrigger, MorphPopoverContent } from "@/components/motion/popover-morph";
import { Tooltip } from "@/components/motion/tooltip";
import { copyText, downloadText } from "./code-actions";

const CodeBlock = dynamic(() => import("@/components/agents/code-block").then(module => module.CodeBlock));

type PreviewTab = 'preview' | 'code' | 'props';

type Props = { component: MediaComponentMeta; source: string; children: ReactNode };

export default function ComponentPreview({ component, source, children }: Props) {
  const { t } = useLocale();
  const [tab, setTab] = useState<PreviewTab>('preview');
  const [status, setStatus] = useState("");
  const usage = localUsageSource(source, component.slug);
  const [copyOptionsOpen, setCopyOptionsOpen] = useState(false);
  useEffect(() => {
    const sync = () => {
      if (['#installation', '#code'].includes(window.location.hash)) setTab('code');
      else if (['#props', '#api'].includes(window.location.hash)) setTab('props');
      else if (window.location.hash === '#preview') setTab('preview');
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const selectTab = (value: PreviewTab) => {
    setTab(value);
    window.history.replaceState(null, '', value === 'code' ? '#installation' : `#${value}`);
  };
  const copy = async (value: string, label: string) => {
    try { await copyText(value); setStatus(`${t(label)}已复制`); }
    catch { setStatus('复制失败，请选择代码手动复制'); }
  };
  const context = `# ${component.title}\n\n${t(component.description)}\n\n${t("文档")}：https://media-rig.vercel.app/components/${component.slug}\n\n${t("安装")}：\n\`\`\`sh\n${cliCommand(component.slug)}\n\`\`\`\n\n${t("React 19 / Tailwind CSS 4。首次运行 media-rig init，图片与业务接口由宿主提供。")}\n\n## ${t("使用示例")}\n\`\`\`tsx\n${usage}\n\`\`\`\n\n## API\n${component.api.map(item => `- ${item.name}: ${item.type} — ${t(item.description)}`).join('\n')}`;
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b1b1b] px-4 py-3 text-sm text-white/55 transition-colors hover:bg-[#2a2a2a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60';
  return (
    <MotionConfig reducedMotion="user">
    <Tabs value={tab} onValueChange={value => selectTab(value as PreviewTab)} className="block" variant="segment">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <TabsList wrapperClassName="w-auto max-w-full" aria-label={t("组件内容")} className="h-auto gap-1 rounded-xl bg-[#242424] p-1">
          {([['preview', '预览', Eye], ['code', '代码', Code2], ['props', 'Props', SlidersHorizontal]] as const).map(([value, label, Icon]) => <TabsTrigger key={value} value={value} className="h-8 gap-1.5 rounded-lg px-3 py-0 text-[13px]" indicatorClassName="bg-primary">
            <Icon size={15} />{t(label)}
          </TabsTrigger>)}
        </TabsList>
        <div className="flex items-center gap-2">
          <Tooltip content={t("复制组件链接")}><Button variant="ghost" type="button" className={button} aria-label={t("复制组件链接")} title={t("复制组件链接")} onClick={() => copy(`https://media-rig.vercel.app/components/${component.slug}`, '组件链接')}><Link2 size={17} /></Button></Tooltip>
          <Tooltip content={t("下载使用示例")}><Button variant="ghost" type="button" className={button} aria-label={t("下载使用示例")} title={t("下载使用示例 (.tsx)")} onClick={() => { downloadText(usage, `${component.slug}-example.tsx`); setStatus('使用示例已下载'); }}><Download size={17} /></Button></Tooltip>
          <MorphPopover open={copyOptionsOpen} onOpenChange={setCopyOptionsOpen}>
            <MorphPopoverTrigger><Button variant="ghost" type="button" className={button} aria-label={t("复制选项")}>{t("Copy for AI")} <ChevronDown size={15} className="transition-transform duration-200 [[data-state=open]>&]:rotate-180 motion-reduce:transition-none" /></Button></MorphPopoverTrigger>
            <MorphPopoverContent align="end" sideOffset={8} className="w-52 rounded-xl border-white/[0.04] p-1.5 duration-150">
              <Button variant="ghost" onClick={() => { setCopyOptionsOpen(false); void copy(context, 'AI 上下文'); }} className="w-full justify-start rounded-lg px-3 py-2.5 text-xs text-white/75">{t("复制完整上下文给 AI")}</Button>
              <Button variant="ghost" onClick={() => { setCopyOptionsOpen(false); void copy(usage, '使用示例'); }} className="w-full justify-start rounded-lg px-3 py-2.5 text-xs text-white/75">{t("仅复制使用示例")}</Button>
              <Button variant="ghost" onClick={() => { setCopyOptionsOpen(false); void copy(cliCommand(component.slug), '安装命令'); }} className="w-full justify-start rounded-lg px-3 py-2.5 text-xs text-white/75">{t("仅复制安装命令")}</Button>
            </MorphPopoverContent>
          </MorphPopover>
        </div>
      </div>
      <p role="status" className="mb-2 min-h-4 text-right text-xs text-white/50">{t(status)}</p>
      <TabsContent value="preview" className="m-0">
        <div>
        {component.slug === 'director-stage' && <a className="mb-3 inline-block text-xs text-white/60 hover:text-white" href="/playground/director-stage">{t("打开独立导演台 ↗")}</a>}
        <div className={`relative min-w-0 overflow-hidden rounded-2xl bg-[#181818] ${component.stageClassName ?? ''}`}>{component.slug === 'director-stage' ? <div style={{ zoom: 0.75, width: '100%', height: '100%' }}>{children}</div> : children}</div>
      </div>
      </TabsContent>
      <TabsContent value="code" className="m-0">
        <div className="space-y-6">
        <div id="installation" className="scroll-mt-24"><InstallPanel component={component} /></div>
        <section className="overflow-hidden rounded-2xl bg-[#181818] p-2.5" aria-label={t("使用示例")}>
          <div className="flex items-center justify-between px-2 py-3">
            <h3 className="text-sm font-semibold">{t("Usage")}</h3>
            <Button variant="ghost" type="button" aria-label={t("复制使用示例")} className={button} onClick={() => copy(usage, '使用示例')}>{status === '使用示例已复制' ? <Check size={16} /> : <Copy size={16} />}</Button>
          </div>
          {tab === "code" && <CodeBlock code={usage} language="tsx" filename={`${component.slug}-example.tsx`} maxHeight={680} copyable={false} className="bg-[#111111]" />}
        </section>
      </div>
      </TabsContent>
      <TabsContent value="props" className="m-0">
        <div id="props" className="scroll-mt-24">
            <section id="api" className="scroll-mt-24" aria-labelledby="api-heading">
              <div className="mb-4 flex items-center gap-3">
                <Code2 size={18} aria-hidden="true" />
                <h2 id="api-heading" className="text-2xl font-[680] tracking-[-0.04em]">{t("Props")}</h2>
              </div>
              <div className="overflow-x-auto rounded-2xl bg-[#181818] [scrollbar-width:thin]">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead className="border-b border-white/[0.08] bg-white/[0.025] text-[10px] tracking-[0.02em] text-white/40">
                    <tr>
                      <th className="px-5 py-3 font-semibold">{t("Property")}</th>
                      <th className="px-5 py-3 font-semibold">{t("Type")}</th>
                      <th className="px-5 py-3 font-semibold">{t("Default")}</th>
                      <th className="px-5 py-3 font-semibold">{t("Description")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07] text-sm">
                    {component.api.map((property) => (
                      <tr key={property.name} className="align-top">
                        <td className="px-5 py-4 font-mono text-xs font-semibold">{property.name}</td>
                        <td className="px-5 py-4 font-mono text-xs text-white/65">{property.type}</td>
                        <td className="px-5 py-4 font-mono text-xs text-white/45">{t(property.defaultValue)}</td>
                        <td className="px-5 py-4 leading-6 text-white/50">{t(property.description)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
        </div>
      </TabsContent>
    </Tabs>
    </MotionConfig>
  );
}
