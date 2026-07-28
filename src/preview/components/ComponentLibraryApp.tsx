import React, { Suspense, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  Check,
  CircleDot,
  Clapperboard,
  Code2,
  Command,
  Copy,
  Layers3,
  Search,
  Sparkles,
} from "lucide-react";
import ComponentPreview from "./ComponentPreview";
import {
  componentHref,
  mediaComponents,
  resolveComponentFromLocation,
  type MediaComponentMeta,
} from "../catalog";

function LibraryFrame({ activeSlug, children }: { activeSlug?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0f0c] text-[#f1f2ec]">
      <div className="grid min-h-screen grid-cols-[252px_minmax(0,1fr)] max-[900px]:grid-cols-1">
        <aside className="sticky top-0 z-20 flex h-screen flex-col border-r border-white/[0.07] bg-[#080a08] px-4 py-5 text-white max-[900px]:static max-[900px]:h-auto max-[900px]:border-r-0 max-[900px]:border-b">
          <a className="flex items-center gap-3 rounded-xl px-2 py-1.5" href="?">
            <span className="grid size-9 place-items-center rounded-lg bg-[#dfff57] font-mono text-xs font-black text-[#171914] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]">
              MR
            </span>
            <span>
              <strong className="block text-[15px] font-[680] tracking-[-0.02em]">Media Rig</strong>
              <small className="block text-[10px] uppercase tracking-[0.18em] text-white/40">Component Lab</small>
            </span>
          </a>

          <nav className="mt-8 flex-1 max-[900px]:mt-4" aria-label="组件导航">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
              Components
            </p>
            <div className="grid gap-1 max-[900px]:grid-cols-3 max-[640px]:grid-cols-1">
              {mediaComponents.map((component) => {
                const isActive = activeSlug === component.slug;
                return (
                  <a
                    key={component.slug}
                    href={componentHref(component.slug)}
                    className={[
                      "group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] transition",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#dfff57]",
                      isActive
                        ? "bg-white/[0.09] text-white"
                        : "text-white/55 hover:bg-white/[0.05] hover:text-white",
                    ].join(" ")}
                  >
                    <span className="truncate">{component.title}</span>
                    <CircleDot
                      className={isActive ? "text-[#dfff57]" : "text-white/20 group-hover:text-white/40"}
                      size={12}
                      aria-hidden="true"
                    />
                  </a>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 px-2 pt-4 text-[11px] leading-relaxed text-white/35 max-[900px]:hidden">
            React · Three.js · Tailwind
            <br />
            v0.2 component preview
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

function ComponentMotif({ slug }: { slug: MediaComponentMeta["slug"] }) {
  if (slug === "image-editor") {
    return (
      <div className="relative h-52 overflow-hidden bg-[#0b0b0d]">
        <div className="absolute inset-x-8 top-6 h-7 rounded-lg border border-white/10 bg-white/[0.045]" />
        <div className="absolute bottom-5 left-5 top-16 w-10 rounded-xl border border-white/10 bg-white/[0.055]" />
        <div className="absolute bottom-8 left-20 right-8 top-16 grid place-items-center rounded-xl border border-white/[0.08] bg-[#111310]">
          <div className="h-20 w-28 rotate-[-3deg] rounded-lg bg-[linear-gradient(135deg,#dfff57,#587328)] shadow-[0_18px_35px_rgba(0,0,0,0.45)]" />
        </div>
      </div>
    );
  }

  if (slug === "image-angle-rig") {
    return (
      <div className="relative grid h-52 place-items-center overflow-hidden bg-[#121410]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative size-28 rotate-[-8deg] rounded-[26px] border border-white/20 bg-[#252821] shadow-[22px_20px_50px_rgba(0,0,0,0.45)] before:absolute before:inset-[7px] before:rounded-[20px] before:bg-[linear-gradient(135deg,#dfff57,#7ba83d)]" />
      </div>
    );
  }

  if (slug === "light-sphere") {
    return (
      <div className="relative grid h-52 place-items-center overflow-hidden bg-[#121410]">
        <div className="absolute size-52 rounded-full border border-white/10" />
        <div className="absolute size-36 rounded-full border border-dashed border-white/15" />
        <div className="size-16 rounded-full border border-white/25 bg-white/[0.08] shadow-[0_0_50px_rgba(223,255,87,0.25)]" />
        <div className="absolute right-[26%] top-[25%] size-4 rounded-full bg-[#dfff57] shadow-[0_0_22px_#dfff57]" />
      </div>
    );
  }

  return (
    <div className="relative h-52 overflow-hidden bg-[#121410]">
      <div className="absolute inset-x-0 bottom-0 h-[62%] origin-bottom skew-y-[-8deg] border-t border-white/10 bg-[#1d211a]" />
      <div className="absolute left-[17%] top-[24%] h-24 w-14 rounded-t-full border border-white/15 bg-[#2a2e26]" />
      <div className="absolute right-[18%] top-[28%] size-20 rotate-12 border border-[#dfff57]/50 bg-[#dfff57]/10" />
      <Clapperboard className="absolute bottom-6 right-7 text-[#dfff57]" size={30} aria-hidden="true" />
    </div>
  );
}

function CatalogHome() {
  const [query, setQuery] = useState("");
  const filteredComponents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return mediaComponents;
    return mediaComponents.filter((component) =>
      [component.title, component.description, component.category, ...component.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <LibraryFrame>
      <main>
        <section className="relative overflow-hidden border-b border-white/[0.08] px-12 pb-14 pt-12 max-[760px]:px-5 max-[760px]:py-9">
          <div className="absolute right-0 top-0 h-full w-[38%] opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="relative max-w-4xl">
            <div className="mb-7 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#dfff57]/70">
              <Sparkles size={14} aria-hidden="true" />
              Media interaction primitives
            </div>
            <h1 className="max-w-3xl text-balance text-[clamp(2.8rem,7vw,6.6rem)] font-[720] leading-[0.88] tracking-[-0.075em]">
              Build the shot,
              <span className="block text-white/25">not the controls.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-white/50">
              面向图片、灯光和三维编排的 React 媒体组件。每个组件都提供实时预览、完整源码、类型接口和独立安装入口。
            </p>
          </div>
        </section>

        <section className="px-12 py-10 max-[760px]:px-5 max-[760px]:py-7">
          <div className="mb-7 flex items-end justify-between gap-5 max-[640px]:items-stretch max-[640px]:flex-col">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#dfff57]/60">Catalog</p>
              <h2 className="mt-1 text-3xl font-[680] tracking-[-0.045em]">组件目录</h2>
            </div>
            <label className="flex h-11 w-[min(340px,100%)] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] focus-within:border-[#dfff57]/40 focus-within:ring-4 focus-within:ring-[#dfff57]/[0.05]">
              <Search size={16} className="text-white/35" aria-hidden="true" />
              <span className="sr-only">搜索组件</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white/80 outline-none placeholder:text-white/25"
                placeholder="搜索名称、分类或能力"
              />
              <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/30">/</kbd>
            </label>
          </div>

          {filteredComponents.length > 0 ? (
            <div className="grid grid-cols-3 gap-5 max-[1180px]:grid-cols-2 max-[700px]:grid-cols-1">
              {filteredComponents.map((component) => (
                <article key={component.slug} className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151713] shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:border-[#dfff57]/20 hover:shadow-[0_20px_52px_rgba(0,0,0,0.36)]">
                  <ComponentMotif slug={component.slug} />
                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
                        {component.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <span className={component.status === "Stable" ? "size-1.5 rounded-full bg-[#77a826]" : "size-1.5 rounded-full bg-[#cf8b24]"} />
                        {component.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-[680] tracking-[-0.035em]">{component.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-white/45">{component.summary}</p>
                    <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#dfff57] transition group-hover:gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" href={componentHref(component.slug)}>
                      打开组件
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] text-sm text-white/40">
              没有找到匹配的组件
            </div>
          )}
        </section>
      </main>
    </LibraryFrame>
  );
}

function InstallPanel({ component }: { component: MediaComponentMeta }) {
  const [mode, setMode] = useState<"npm" | "registry">("npm");
  const [copied, setCopied] = useState(false);
  const command = mode === "npm"
    ? `npm install media-rig\nimport { ${component.title.replace(/\s+/g, "")} } from "${component.packagePath}"`
    : `npx shadcn@latest add ${window.location.origin}/r/${component.slug}.json`;

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#080a08] text-white shadow-[0_18px_46px_rgba(0,0,0,0.3)]" aria-labelledby="install-title">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Command size={15} className="text-[#dfff57]" aria-hidden="true" />
          <h2 id="install-title" className="text-xs font-semibold uppercase tracking-[0.13em] text-white/65">Install</h2>
        </div>
        <div className="flex rounded-lg bg-white/[0.06] p-1 text-[11px]">
          {(["npm", "registry"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={[
                "rounded-md px-2.5 py-1.5 uppercase transition",
                mode === item ? "bg-[#dfff57] font-semibold text-[#171914]" : "text-white/45 hover:text-white",
              ].join(" ")}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-start gap-3 px-4 py-4">
        <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-white/70"><code>{command}</code></pre>
        <button type="button" onClick={copyCommand} className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/45 transition hover:bg-white/10 hover:text-white" aria-label={copied ? "已复制安装命令" : "复制安装命令"}>
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}

function ComponentDetail({ component }: { component: MediaComponentMeta }) {
  const Preview = component.preview;

  return (
    <LibraryFrame activeSlug={component.slug}>
      <main className="px-10 pb-20 pt-9 max-[760px]:px-4 max-[760px]:pt-6">
        <div className="mx-auto max-w-[1500px]">
          <a href="?" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/40 transition hover:text-white">
            <ArrowLeft size={14} aria-hidden="true" />
            All components
          </a>

          <header className="grid grid-cols-[minmax(0,1fr)_minmax(300px,440px)] gap-10 max-[1050px]:grid-cols-1">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#dfff57] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#10120d]">{component.category}</span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">{component.status}</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#dfff57]/60">{component.eyebrow}</p>
              <h1 className="mt-2 text-[clamp(2.8rem,6vw,5.6rem)] font-[720] leading-[0.92] tracking-[-0.07em]">{component.title}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/50">{component.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {component.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-white/45">{tag}</span>
                ))}
              </div>
            </div>
            <InstallPanel component={component} />
          </header>

          <section className="mt-12" aria-labelledby="preview-heading">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#dfff57]/60">Playground</p>
                <h2 id="preview-heading" className="mt-1 text-2xl font-[680] tracking-[-0.04em]">实时预览</h2>
              </div>
              <span className="hidden items-center gap-2 text-xs text-white/35 sm:flex"><Box size={14} aria-hidden="true" /> React component</span>
            </div>
            <div className={["mx-auto", component.previewClassName].join(" ")}>
              <Suspense fallback={<div className="grid h-[480px] place-items-center rounded-2xl border border-white/10 bg-[#171914] text-xs uppercase tracking-[0.14em] text-white/35">Loading component…</div>}>
                <ComponentPreview
                  title={component.title}
                  description={component.description}
                  source={component.source}
                  stageClassName={component.stageClassName}
                >
                  <Preview />
                </ComponentPreview>
              </Suspense>
            </div>
          </section>

          <section className="mt-14" aria-labelledby="api-heading">
            <div className="mb-4 flex items-center gap-3">
              <Code2 size={18} aria-hidden="true" />
              <h2 id="api-heading" className="text-2xl font-[680] tracking-[-0.04em]">核心 API</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#151713] shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="border-b border-white/[0.08] bg-white/[0.025] text-[10px] uppercase tracking-[0.13em] text-white/40">
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
                      <td className="px-5 py-4 font-mono text-xs text-[#dfff57]/70">{property.type}</td>
                      <td className="px-5 py-4 font-mono text-xs text-white/45">{property.defaultValue}</td>
                      <td className="px-5 py-4 leading-6 text-white/50">{property.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="mt-14 flex items-center justify-between border-t border-white/[0.08] pt-6 text-xs text-white/35 max-[640px]:items-start max-[640px]:flex-col max-[640px]:gap-3">
            <span className="flex items-center gap-2"><Layers3 size={14} aria-hidden="true" /> {component.dependencies.length} runtime dependencies</span>
            <span>Media Rig · Typed React components</span>
          </footer>
        </div>
      </main>
    </LibraryFrame>
  );
}

export default function ComponentLibraryApp() {
  const component = resolveComponentFromLocation(window.location.search);
  return component ? <ComponentDetail component={component} /> : <CatalogHome />;
}
