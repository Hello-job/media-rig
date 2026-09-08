"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import type { MediaComponentMeta } from "../catalog";
import { packageManagers, registryCommand, type PackageManager } from "../install";

export default function InstallPanel({ component }: { component: MediaComponentMeta }) {
  const [manager, setManager] = useState<PackageManager>("pnpm");
  const [copiedCommand, setCopiedCommand] = useState("");
  const [copyError, setCopyError] = useState(false);
  const command = registryCommand(component.slug, manager);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-white/50">在已初始化 shadcn 的 React 项目根目录运行。命令会添加组件源码、样式与所需依赖，之后可以直接修改源码。</p>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]" aria-label={`${component.title} 命令行安装`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <span className="flex items-center gap-2 text-xs text-white/65"><Terminal size={15} aria-hidden="true" /> shadcn CLI</span>
          <div className="flex gap-1" role="group" aria-label="包管理器">
            {packageManagers.map((item) => <button key={item} type="button" aria-pressed={manager === item} onClick={() => { setManager(item); setCopyError(false); }} className={`rounded-md px-2.5 py-1.5 text-xs transition focus-visible:outline focus-visible:outline-white/70 ${manager === item ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}>{item}</button>)}
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <pre className="min-w-0 flex-1 overflow-x-auto pb-2 text-xs leading-6 text-white/80"><code>{command}</code></pre>
          <button type="button" onClick={copy} aria-label={copiedCommand === command ? "已复制安装命令" : "复制安装命令"} className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-white/70">{copiedCommand === command ? <Check size={15} /> : <Copy size={15} />}</button>
        </div>
        <p role="status" className="px-4 pb-3 text-xs text-white/40">{copyError ? "复制失败，请选中上方命令手动复制。" : copiedCommand === command ? "安装命令已复制" : "只安装当前组件及其依赖。"}</p>
      </section>
      <div className="rounded-xl border border-white/10 p-4 text-xs leading-6 text-white/50">
        <p>安装后从本地组件目录导入：</p>
        <pre className="mt-2 overflow-x-auto text-white/75"><code>{`import { ${component.exportName ?? component.title.replace(/\s+/g, "")} } from "@/components/${component.slug}";`}</code></pre>
        <p className="mt-2">使用 React 19；目录跟随 components.json 的 components 别名。Next.js 中请在客户端组件中使用。示例图片和业务接口由宿主提供。</p>
      </div>
      <details className="rounded-xl border border-white/10 px-4 py-3 text-xs leading-6 text-white/50">
        <summary className="cursor-pointer text-white/70">首次使用 shadcn？</summary>
        <p className="mt-2">先在项目根目录初始化，再运行上面的组件安装命令。使用 Tailwind CSS 4 配置项目。</p>
        <pre className="mt-2 overflow-x-auto text-white/75"><code>pnpm dlx shadcn@latest init</code></pre>
        <a href="https://ui.shadcn.com/docs/installation" target="_blank" rel="noreferrer" className="mt-2 inline-block underline underline-offset-4">查看 shadcn 初始化指南 ↗</a>
      </details>
      <details className="rounded-xl border border-white/10 px-4 py-3 text-xs leading-6 text-white/50">
        <summary className="cursor-pointer text-white/70">pnpm 11 接入配置</summary>
        <p className="mt-2">使用图片编辑 / 涂鸦时，浏览器端不需要 canvas 原生构建；使用 3D 组件时，统一 Three.js 类型版本。在 pnpm-workspace.yaml 中合并以下配置，再安装组件：</p>
        <pre className="mt-2 overflow-x-auto text-white/75"><code>{`allowBuilds:
  canvas: false
overrides:
  '@types/three': '^0.168.0'`}</code></pre>
        <p className="mt-2">保留项目已有配置；若已有其他 Three.js 组件，请统一检查版本兼容性。</p>
      </details>
    </div>
  );
}
