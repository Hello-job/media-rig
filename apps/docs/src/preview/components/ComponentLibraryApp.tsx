import React, { Suspense, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownAZ,
  ArrowLeft,
  Box,
  Check,
  ChevronDown,
  ChevronsRight,
  Code2,
  Command,
  Copy,
  GitFork,
  Grid2X2,
  LayoutGrid,
  Layers3,
  List,
  Search,
} from "lucide-react";
import ComponentPreview from "./ComponentPreview";
import {
  componentHref,
  mediaComponents,
  resolveComponentFromLocation,
  type MediaComponentMeta,
} from "../catalog";

type LibraryFrameProps = {
  children: ReactNode;
  query?: string;
  onQueryChange?: (value: string) => void;
};

function LibraryFrame({ children, query, onQueryChange }: LibraryFrameProps) {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <header className="sticky inset-x-0 top-0 z-40 h-14 border-b border-white/[0.05] bg-[#121212]/95 backdrop-blur-xl">
        <div className="flex h-full w-full items-center px-5 max-[640px]:px-4">
          <a className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70" href="/">
            <span className="grid size-6 place-items-center text-white/90">
              <ChevronsRight size={20} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <strong className="text-sm font-[680] tracking-[-0.025em]">MediaRig</strong>
          </a>

          {onQueryChange ? (
            <label className="ml-auto flex h-9 w-[min(270px,34vw)] items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-3 text-[11px] text-white/40 transition focus-within:border-white/20 max-[640px]:w-40">
              <Search size={13} aria-hidden="true" />
              <span className="sr-only">搜索组件</span>
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent text-xs text-white/80 outline-none placeholder:text-white/28"
                placeholder="Search components…"
              />
              <kbd className="rounded border border-white/[0.08] px-1 font-mono text-[9px] text-white/25 max-[800px]:hidden">/</kbd>
            </label>
          ) : (
            <a
              className="ml-auto flex h-9 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-3 text-[11px] text-white/40 transition hover:border-white/20 hover:text-white/65"
              href="/#components"
            >
              <Search size={13} aria-hidden="true" />
              <span className="max-[520px]:hidden">Browse components…</span>
            </a>
          )}
        </div>
      </header>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

type CatalogLayout = "grid" | "list" | "matrix";

const catalogCategories = ["All Components", "Image", "Lighting", "Scene", "Editor"] as const;

const catalogPreviewPaths: Record<MediaComponentMeta["slug"], string> = {
  "image-editor": "/assets/catalog/image-editor.jpg",
  "image-angle-rig": "/assets/catalog/image-angle-rig.jpg",
  "light-sphere": "/assets/catalog/light-sphere.jpg",
  "director-stage": "/assets/catalog/director-stage.jpg?v=dark-2",
};

function CatalogHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof catalogCategories)[number]>("All Components");
  const [layout, setLayout] = useState<CatalogLayout>("grid");
  const [sortMode, setSortMode] = useState<"curated" | "ascending" | "descending">("curated");
  const [copiedSlug, setCopiedSlug] = useState<MediaComponentMeta["slug"] | null>(null);
  const filteredComponents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextComponents = mediaComponents.filter((component) => {
      const matchesCategory = category === "All Components" || component.category === category;
      const matchesQuery = !normalizedQuery || [component.title, component.description, component.category, ...component.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });

    if (sortMode === "curated") return nextComponents;

    return [...nextComponents].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return sortMode === "ascending" ? comparison : -comparison;
    });
  }, [category, query, sortMode]);

  const copyInstallCommand = async (component: MediaComponentMeta) => {
    try {
      await navigator.clipboard.writeText(`npm install media-rig\nimport { ${component.title.replace(/\s+/g, "")} } from "${component.packagePath}"`);
      setCopiedSlug(component.slug);
      window.setTimeout(() => setCopiedSlug(null), 1400);
    } catch {
      setCopiedSlug(null);
    }
  };

  const catalogGridClass = layout === "list"
    ? "grid grid-cols-1 gap-5"
    : layout === "matrix"
      ? "grid grid-cols-3 gap-5 max-[980px]:grid-cols-2 max-[660px]:grid-cols-1"
      : "grid grid-cols-2 gap-5 max-[760px]:grid-cols-1";

  return (
    <LibraryFrame query={query} onQueryChange={setQuery}>
      <main className="mx-auto max-w-[870px] px-5 pb-20 max-[640px]:px-4">
        <section className="pb-6 pt-14 text-center max-[640px]:pb-7 max-[640px]:pt-12">
          <h1 className="text-balance text-[clamp(2.35rem,4.7vw,3rem)] font-[650] leading-[1.04] tracking-[-0.052em]">
            MediaRig — Media primitives
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base leading-7 text-white/42">
            面向图片、灯光和三维编排的 React 媒体组件。
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 max-[430px]:flex-col">
            <a
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-[#111] transition hover:bg-[#ededed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
              href="https://github.com/Hello-job/media-rig"
              target="_blank"
              rel="noreferrer"
            >
              <GitFork size={15} aria-hidden="true" />
              GitHub Repo
            </a>
            <a className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.025] px-6 text-[13px] font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white" href="#components">
              <ArrowDownAZ size={15} aria-hidden="true" />
              Browse Components
            </a>
          </div>
        </section>

        <section id="components" className="scroll-mt-20">
          <div className="mb-7 flex items-center gap-3 max-[720px]:items-stretch max-[720px]:flex-col">
            <div className="flex w-[476px] shrink-0 rounded-full border border-white/[0.08] bg-white/[0.025] p-1.5 max-[720px]:w-full max-[640px]:hidden">
              {catalogCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={[
                    "shrink-0 rounded-full px-4 py-2 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70",
                    category === item ? "bg-white/[0.08] text-white" : "text-white/42 hover:text-white/75",
                  ].join(" ")}
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="relative hidden h-11 items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-4 text-xs text-white max-[640px]:flex">
              <span className="sr-only">组件分类</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as (typeof catalogCategories)[number])}
                className="h-full w-full appearance-none border-0 bg-transparent pr-6 text-xs font-semibold text-white outline-none"
              >
                {catalogCategories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 text-white/35" size={14} aria-hidden="true" />
            </label>

            <button
              type="button"
              className="ml-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 text-[11px] text-white/46 transition hover:text-white max-[720px]:ml-0 max-[640px]:self-center"
              onClick={() => setSortMode((current) => current === "curated" ? "ascending" : current === "ascending" ? "descending" : "curated")}
              aria-label={sortMode === "curated" ? "按名称升序排列" : sortMode === "ascending" ? "按名称降序排列" : "恢复推荐排序"}
            >
              <ArrowDownAZ size={14} aria-hidden="true" />
              {sortMode === "descending" ? "Z–A" : "A–Z"}
            </button>

            <div className="flex h-11 shrink-0 items-center rounded-full border border-white/[0.08] bg-white/[0.025] p-1 max-[640px]:hidden" aria-label="目录布局">
              {([
                ["list", List, "列表布局"],
                ["grid", Grid2X2, "网格布局"],
                ["matrix", LayoutGrid, "矩阵布局"],
              ] as const).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  className={[
                    "grid size-8 place-items-center rounded-full transition",
                    layout === value ? "bg-white/[0.08] text-white" : "text-white/32 hover:text-white/70",
                  ].join(" ")}
                  onClick={() => setLayout(value)}
                  aria-label={label}
                  aria-pressed={layout === value}
                >
                  <Icon size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {filteredComponents.length > 0 ? (
            <div className={catalogGridClass} aria-live="polite">
              {filteredComponents.map((component) => (
                <article key={component.slug} className={[
                  "group overflow-hidden rounded-[18px] border border-white/[0.075] bg-[#181818] transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.14]",
                  layout === "list" ? "grid grid-cols-[minmax(0,1.5fr)_minmax(240px,0.7fr)] max-[760px]:grid-cols-1" : "flex flex-col",
                ].join(" ")}>
                  <a className="relative block overflow-hidden bg-[#0d0d0d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white/70" href={componentHref(component.slug)}>
                    <img
                      src={catalogPreviewPaths[component.slug]}
                      alt={`${component.title} 组件预览`}
                      className={[
                        "w-full object-cover object-center transition duration-300 group-hover:scale-[1.01]",
                        layout === "list" ? "h-full min-h-72" : layout === "matrix" ? "aspect-[1.55/1]" : "aspect-[2/1] max-[760px]:aspect-[1.35/1]",
                      ].join(" ")}
                      loading="lazy"
                    />
                  </a>
                  <div className="flex min-h-16 items-start gap-4 border-t border-white/[0.065] px-4 py-3">
                    <a className="min-w-0 flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70" href={componentHref(component.slug)}>
                      <h2 className="text-sm font-[630] tracking-[-0.025em]">{component.title}</h2>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-[1.55] text-white/38">{component.summary}</p>
                    </a>
                    <button
                      type="button"
                      onClick={() => copyInstallCommand(component)}
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/40 transition hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                      aria-label={copiedSlug === component.slug ? `${component.title} 安装命令已复制` : `复制 ${component.title} 安装命令`}
                      title={copiedSlug === component.slug ? "Copied" : "Copy install command"}
                    >
                      {copiedSlug === component.slug ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center rounded-[20px] border border-dashed border-white/15 bg-white/[0.02] text-sm text-white/40">
              没有找到匹配的组件
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-white/[0.07] py-7 text-center text-[11px] text-white/28">
          MediaRig · Typed React components
        </footer>
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
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] text-white shadow-[0_18px_46px_rgba(0,0,0,0.3)]" aria-labelledby="install-title">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Command size={15} className="text-white/65" aria-hidden="true" />
          <h2 id="install-title" className="text-xs font-semibold text-white/65">Install</h2>
        </div>
        <div className="flex rounded-lg bg-white/[0.06] p-1 text-[11px]">
          {(["npm", "registry"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={[
                "rounded-md px-2.5 py-1.5 transition",
                mode === item ? "bg-white/[0.12] font-semibold text-white" : "text-white/45 hover:text-white",
              ].join(" ")}
              onClick={() => setMode(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
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
    <LibraryFrame>
      <main className="px-8 pb-20 pt-10 max-[760px]:px-4 max-[760px]:pt-6">
        <div className="mx-auto grid max-w-[1120px] grid-cols-[minmax(0,1fr)_160px] gap-12 max-[1040px]:grid-cols-1">
          <div className="min-w-0">
            <a href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.01em] text-white/40 transition hover:text-white">
              <ArrowLeft size={14} aria-hidden="true" />
              All components
            </a>

            <header className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[10px] font-bold tracking-[0.02em] text-white/80">{component.category}</span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.02em] text-white/45">{component.status}</span>
              </div>
              <p className="text-xs font-semibold tracking-[0.02em] text-white/40">{component.eyebrow}</p>
              <h1 className="mt-2 text-[clamp(2.6rem,5vw,4.8rem)] font-[720] leading-[0.94] tracking-[-0.065em]">{component.title}</h1>
              <p className="mt-5 text-base leading-7 text-white/50">{component.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {component.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-white/45">{tag}</span>
                ))}
              </div>
            </header>

            <section id="preview" className="mt-12 scroll-mt-20" aria-labelledby="preview-heading">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.02em] text-white/40">Playground</p>
                  <h2 id="preview-heading" className="mt-1 text-2xl font-[680] tracking-[-0.04em]">实时预览</h2>
                </div>
                <span className="hidden items-center gap-2 text-xs text-white/35 sm:flex"><Box size={14} aria-hidden="true" /> React component</span>
              </div>
              <div className={["mx-auto", component.previewClassName].join(" ")}>
                <Suspense fallback={<div className="grid h-[480px] place-items-center rounded-2xl border border-white/10 bg-[#181818] text-xs tracking-[0.02em] text-white/35">Loading component…</div>}>
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

            <section id="installation" className={["mx-auto mt-14 scroll-mt-20", component.previewClassName].join(" ")}>
              <div className="mb-4">
                <p className="text-xs font-semibold tracking-[0.02em] text-white/40">Installation</p>
                <h2 className="mt-1 text-2xl font-[680] tracking-[-0.04em]">安装组件</h2>
              </div>
              <InstallPanel component={component} />
            </section>

            <section id="api" className="mt-14 scroll-mt-20" aria-labelledby="api-heading">
              <div className="mb-4 flex items-center gap-3">
                <Code2 size={18} aria-hidden="true" />
                <h2 id="api-heading" className="text-2xl font-[680] tracking-[-0.04em]">核心 API</h2>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#181818] shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
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

            <footer className="mt-14 flex items-center justify-between border-t border-white/[0.08] pt-6 text-xs text-white/35 max-[640px]:items-start max-[640px]:flex-col max-[640px]:gap-3">
              <span className="flex items-center gap-2"><Layers3 size={14} aria-hidden="true" /> {component.dependencies.length} runtime dependencies</span>
              <span>Media Rig · Typed React components</span>
            </footer>
          </div>

          <aside className="sticky top-20 h-fit text-xs max-[1240px]:hidden" aria-label="页面目录">
            <p className="mb-3 font-semibold tracking-[0.01em] text-white/30">On this page</p>
            <nav className="grid gap-2.5 border-l border-white/10 pl-4 text-white/40">
              <a className="transition hover:text-white" href="#preview">Preview</a>
              <a className="transition hover:text-white" href="#installation">Installation</a>
              <a className="transition hover:text-white" href="#api">API Reference</a>
            </nav>
          </aside>
        </div>
      </main>
    </LibraryFrame>
  );
}

export default function ComponentLibraryApp() {
  const component = resolveComponentFromLocation(window.location.search, window.location.pathname);
  return component ? <ComponentDetail component={component} /> : <CatalogHome />;
}
