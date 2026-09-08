"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, Code2, Copy, Download, Eye, Link2, SlidersHorizontal } from "lucide-react";
import type { MediaComponentMeta } from "../catalog";
import { cliCommand, localUsageSource } from "../install";
import InstallPanel from "./InstallPanel";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { copyText, downloadText } from "./code-actions";

type PreviewTab = 'preview' | 'code' | 'props';

type Props = { component: MediaComponentMeta; source: string; children: ReactNode };

export default function ComponentPreview({ component, source, children }: Props) {
  const [tab, setTab] = useState<PreviewTab>('preview');
  const [status, setStatus] = useState("");
  const reduceMotion = useReducedMotion();
  const usage = localUsageSource(source, component.slug);
  const prefix = `${component.slug}-demo`;
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
    try { await copyText(value); setStatus(`${label}已复制`); }
    catch { setStatus('复制失败，请选择代码手动复制'); }
  };
  const context = `# ${component.title}\n\n${component.description}\n\n文档：https://media-rig.vercel.app/components/${component.slug}\n\n安装：\n\`\`\`sh\n${cliCommand(component.slug)}\n\`\`\`\n\nReact 19 / Tailwind CSS 4。首次运行 media-rig init，图片与业务接口由宿主提供。\n\n## Usage\n\`\`\`tsx\n${usage}\n\`\`\`\n\n## API\n${component.api.map(item => `- ${item.name}: ${item.type} — ${item.description}`).join('\n')}`;
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b1b1b] px-4 py-3 text-sm text-white/55 transition-colors hover:bg-[#2a2a2a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60';
  return (
    <MotionConfig reducedMotion="user">
    <Tabs value={tab} onValueChange={value => selectTab(value as PreviewTab)} className="block" aria-label={`${component.title} 预览、代码与 Props`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <TabsList aria-label="组件内容" className="h-auto gap-2 bg-transparent p-0">
          {([['preview', '预览', Eye], ['code', '代码', Code2], ['props', 'Props', SlidersHorizontal]] as const).map(([value, label, Icon]) => <TabsTrigger key={value} value={value} className="relative isolate h-11 flex-none overflow-hidden rounded-xl border-0 bg-[#1b1b1b] px-4 text-white/55 shadow-none transition-colors hover:bg-[#242424] data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent">
            {tab === value && <motion.span layoutId={reduceMotion ? undefined : `${prefix}-selected`} className="absolute inset-0 -z-10 rounded-xl bg-[#2a2a2a]" transition={{type:'spring', stiffness:450, damping:35}} />}
            <Icon size={17} />{label}
          </TabsTrigger>)}
        </TabsList>
        <div className="flex items-center gap-2">
          <button type="button" className={button} aria-label="复制组件链接" title="复制组件链接" onClick={() => copy(`https://media-rig.vercel.app/components/${component.slug}`, '组件链接')}><Link2 size={17} /></button>
          <button type="button" className={button} aria-label="下载使用示例" title="下载使用示例 (.tsx)" onClick={() => { downloadText(usage, `${component.slug}-example.tsx`); setStatus('使用示例已下载'); }}><Download size={17} /></button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button type="button" className={button} aria-label="复制选项">Copy for AI <ChevronDown size={15} className="transition-transform duration-200 [[data-state=open]>&]:rotate-180 motion-reduce:transition-none" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-xl border-white/[0.04] p-1.5 duration-150">
              <DropdownMenuItem onSelect={() => copy(context, 'AI 上下文')} className="rounded-lg px-3 py-2.5 text-xs text-white/75">复制完整上下文给 AI</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => copy(usage, '使用示例')} className="rounded-lg px-3 py-2.5 text-xs text-white/75">仅复制使用示例</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => copy(cliCommand(component.slug), '安装命令')} className="rounded-lg px-3 py-2.5 text-xs text-white/75">仅复制安装命令</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p role="status" className="mb-2 min-h-4 text-right text-xs text-white/50">{status}</p>
      <TabsContent value="preview" forceMount hidden={tab !== 'preview'} className="m-0">
        <motion.div initial={false} animate={{opacity: tab === 'preview' ? 1 : 0, y: tab === 'preview' || reduceMotion ? 0 : 6}} transition={{duration: reduceMotion ? 0 : 0.18}}>
        {component.slug === 'director-stage' && <a className="mb-3 inline-block text-xs text-white/60 hover:text-white" href="/playground/director-stage">打开独立导演台 ↗</a>}
        <div className={`relative min-w-0 overflow-hidden rounded-2xl bg-[#181818] ${component.stageClassName ?? ''}`}>{children}</div>
      </motion.div>
      </TabsContent>
      <TabsContent value="code" forceMount hidden={tab !== 'code'} className="m-0">
        <motion.div initial={false} animate={{opacity: tab === 'code' ? 1 : 0, y: tab === 'code' || reduceMotion ? 0 : 6}} transition={{duration: reduceMotion ? 0 : 0.18}} className="space-y-6">
        <div id="installation" className="scroll-mt-24"><InstallPanel component={component} /></div>
        <section className="overflow-hidden rounded-2xl bg-[#181818] p-2.5" aria-label="使用示例">
          <div className="flex items-center justify-between px-2 py-3">
            <h3 className="text-sm font-semibold">Usage</h3>
            <button type="button" aria-label="复制使用示例" className={button} onClick={() => copy(usage, '使用示例')}>{status === '使用示例已复制' ? <Check size={16} /> : <Copy size={16} />}</button>
          </div>
          <pre className="max-h-[680px] overflow-auto rounded-xl bg-[#111111] py-5 pr-5 font-mono text-[13px] leading-7 text-white/75 [scrollbar-width:thin] [tab-size:2]" tabIndex={0}><code>{usage.split('\n').map((line, index) => <span className="grid min-w-max grid-cols-[48px_minmax(0,1fr)] whitespace-pre" key={index}><span aria-hidden="true" className="select-none text-center text-white/25">{index + 1}</span><span>{line || ' '}</span></span>)}</code></pre>
        </section>
      </motion.div>
      </TabsContent>
      <TabsContent value="props" forceMount hidden={tab !== 'props'} className="m-0">
        <motion.div id="props" className="scroll-mt-24" initial={false} animate={{opacity: tab === 'props' ? 1 : 0, y: tab === 'props' || reduceMotion ? 0 : 6}} transition={{duration: reduceMotion ? 0 : 0.18}}>
            <section id="api" className="scroll-mt-24" aria-labelledby="api-heading">
              <div className="mb-4 flex items-center gap-3">
                <Code2 size={18} aria-hidden="true" />
                <h2 id="api-heading" className="text-2xl font-[680] tracking-[-0.04em]">Props</h2>
              </div>
              <div className="overflow-x-auto rounded-2xl bg-[#181818] [scrollbar-width:thin]">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead className="border-b border-white/[0.08] bg-white/[0.025] text-[10px] tracking-[0.02em] text-white/40">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Property</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold">Default</th>
                      <th className="px-5 py-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07] text-sm">
                    {component.api.map((property) => (
                      <tr key={property.name} className="align-top">
                        <td className="px-5 py-4 font-mono text-xs font-semibold">{property.name}</td>
                        <td className="px-5 py-4 font-mono text-xs text-white/65">{property.type}</td>
                        <td className="px-5 py-4 font-mono text-xs text-white/45">{property.defaultValue}</td>
                        <td className="px-5 py-4 leading-6 text-white/50">{property.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
        </motion.div>
      </TabsContent>
    </Tabs>
    </MotionConfig>
  );
}
