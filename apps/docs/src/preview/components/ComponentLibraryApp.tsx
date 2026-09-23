"use client";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import { useLocale } from "@/i18n/LocaleProvider";

import { Button } from "@/components/motion/button/base";

import { Input } from "@/components/motion/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { NumberTicker } from "@/components/motion/number-ticker";
import React, { Suspense, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownAZ,
  ArrowLeft,
  ChevronsRight,
  GitFork,
  Grid2X2,
  LayoutGrid,
  Layers3,
  List,
  Search,
} from "lucide-react";
import ComponentPreview from "./ComponentPreview";
import ClientDemo from "./ClientDemo";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/motion/select";
import CatalogEffectPreview from "./CatalogEffectPreview";
import CatalogMediaPreview from "./CatalogMediaPreview";
import CatalogStudioPreview from "./CatalogStudioPreview";
import {
  componentHref,
  mediaComponents,
  type MediaComponentMeta,
} from "../catalog";

type LibraryFrameProps = {
  children: ReactNode;
  query?: string;
  onQueryChange?: (value: string) => void;
};

function LibraryFrame({ children, query, onQueryChange }: LibraryFrameProps) {
  const { t } = useLocale();
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
            <Input type="search" aria-label={t("搜索组件")} value={query} onChange={onQueryChange}
              leftIcon={<Search size={13} aria-hidden="true" />}
              placeholder={t("Search components…")}
              className="ml-auto w-[min(270px,34vw)] max-[640px]:w-28"
              classNames={{ field: "h-9 rounded-xl border-white/10 bg-white/[0.025]", input: "text-xs" }} />
          ) : (
            <a
              className="ml-auto flex h-9 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-3 text-[11px] text-white/40 transition hover:border-white/20 hover:text-white/65"
              href="/components#components"
            >
              <Search size={13} aria-hidden="true" />
              <span className="max-[520px]:hidden">{t("Browse components…")}</span>
            </a>
          )}
          <div className="ml-3"><LanguageSwitcher /></div>
        </div>
      </header>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

type CatalogLayout = "grid" | "list" | "matrix";

const catalogCategories = ["All Components", "Image", "Video", "Lighting", "Scene", "Editor"] as const;

const catalogPreviewPaths: Record<MediaComponentMeta["slug"], string> = {
  "video-editor": "/assets/video-trim/poster.jpg",
  "video-trim": "/assets/video-trim/poster.jpg",
  "image-annotation": "/assets/image-annotation/editorial-portrait.png",
  "layer-separator": "/assets/layer-separator/poolside/scene.svg",
  "image-editor": "/assets/catalog/image-editor.jpg",
  "image-angle-rig": "/assets/studio/angle-editorial.png",
  "light-sphere": "/assets/studio/light-editorial.png",
  "director-stage": "/assets/catalog/director-stage.jpg?v=dark-2",
};

export function CatalogHome() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof catalogCategories)[number]>("All Components");
  const [layout, setLayout] = useState<CatalogLayout>("grid");
  const [sortMode, setSortMode] = useState<"curated" | "ascending" | "descending">("curated");
  const filteredComponents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextComponents = mediaComponents.filter((component) => {
      const matchesCategory = category === "All Components" || component.category === category;
      const matchesQuery = !normalizedQuery || [component.title, component.description, t(component.description), t(component.category), component.category, ...component.tags]
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
  }, [category, query, sortMode, t]);

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
            {t("MediaRig — Media primitives")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-base leading-7 text-white/42">
            {t("面向图片、视频、灯光和三维编排的 React 媒体组件。")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 max-[430px]:flex-col">
            <a
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-[#111] transition hover:bg-[#ededed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
              href="https://github.com/Hello-job/media-rig"
              target="_blank"
              rel="noreferrer"
            >
              <GitFork size={15} aria-hidden="true" />
              {t("GitHub Repo")}
            </a>
            <a className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.025] px-6 text-[13px] font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white" href="#components">
              <ArrowDownAZ size={15} aria-hidden="true" />
              {t("Browse Components")}
            </a>
          </div>
        </section>

        <section id="components" className="scroll-mt-20">
          <div className="mb-7 flex items-center gap-3 max-[720px]:items-stretch max-[720px]:flex-col">
            <Tabs value={category} onValueChange={value => setCategory(value as typeof category)} className="min-w-0 flex-1 max-[640px]:hidden">
              <TabsList aria-label={t("组件分类")} className="border border-white/[0.08] bg-white/[0.025] p-1.5">
                {catalogCategories.map(item => <TabsTrigger key={item} value={item} className="px-4 py-2 text-[11px]" indicatorClassName="bg-primary">{t(item)}</TabsTrigger>)}
              </TabsList>
            </Tabs>

            <div className="hidden max-[640px]:block">
              <Select value={category} onValueChange={value => setCategory(value as (typeof catalogCategories)[number])}>
                <SelectTrigger aria-label={t("组件分类")} className="h-11 w-full rounded-full border-white/[0.05] bg-[#181818] px-4 text-xs shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-white/[0.04]">
                  {catalogCategories.map(item => <SelectItem key={item} value={item} className="rounded-lg py-2 text-xs">{t(item)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost"
              type="button"
              className="ml-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 text-[11px] text-white/46 transition hover:text-white max-[720px]:ml-0 max-[640px]:self-center"
              onClick={() => setSortMode((current) => current === "curated" ? "ascending" : current === "ascending" ? "descending" : "curated")}
              aria-label={t(sortMode === "curated" ? "按名称升序排列" : sortMode === "ascending" ? "按名称降序排列" : "恢复推荐排序")}
            >
              <ArrowDownAZ size={14} aria-hidden="true" />
              {sortMode === "descending" ? "Z–A" : "A–Z"}
            </Button>

            <div className="flex h-11 shrink-0 items-center rounded-full border border-white/[0.08] bg-white/[0.025] p-1 max-[640px]:hidden" aria-label={t("目录布局")}>
              {([
                ["list", List, "列表布局"],
                ["grid", Grid2X2, "网格布局"],
                ["matrix", LayoutGrid, "矩阵布局"],
              ] as const).map(([value, Icon, label]) => (
                <Button variant="ghost"
                  key={value}
                  type="button"
                  className={[
                    "grid size-8 place-items-center rounded-full transition",
                    layout === value ? "bg-white/[0.08] text-white" : "text-white/32 hover:text-white/70",
                  ].join(" ")}
                  onClick={() => setLayout(value)}
                  aria-label={t(label)}
                  aria-pressed={layout === value}
                >
                  <Icon size={15} aria-hidden="true" />
                </Button>
              ))}
            </div>
          </div>

          <p role="status" className="mb-4 text-xs text-white/40"><NumberTicker value={filteredComponents.length} startOnView={false} duration={0.35} /> {t("个组件")}</p>
          {filteredComponents.length > 0 ? (
            <div className={catalogGridClass} aria-live="polite">
              {filteredComponents.map((component) => (
                <article key={component.slug} className={[
                  "group overflow-hidden rounded-[26px] bg-[#181818] p-2.5 transition-colors duration-200 hover:bg-[#242424] focus-within:bg-[#242424] motion-reduce:transition-none",
                  layout === "list" ? "grid grid-cols-[minmax(0,1.5fr)_minmax(240px,0.7fr)] max-[760px]:grid-cols-1" : "flex flex-col",
                ].join(" ")}>
                  <a className="relative block overflow-hidden rounded-[18px] bg-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white/70" href={componentHref(component.slug)}>
                    {component.slug === "video-editor" || component.slug === "video-trim" || component.slug === "image-annotation" ? (
                      <CatalogMediaPreview kind={component.slug} className={layout === "list" ? "h-full min-h-72" : layout === "matrix" ? "aspect-[1.55/1]" : "aspect-[2/1] max-[760px]:aspect-[1.35/1]"} />
                    ) : component.slug === "layer-separator" ? (
                      <CatalogEffectPreview kind={component.slug} className={layout === "list" ? "h-full min-h-72" : layout === "matrix" ? "aspect-[1.55/1]" : "aspect-[2/1] max-[760px]:aspect-[1.35/1]"} />
                    ) : component.slug === "image-angle-rig" || component.slug === "light-sphere" ? (
                      <CatalogStudioPreview kind={component.slug} className={layout === "list" ? "h-full min-h-72" : layout === "matrix" ? "aspect-[1.55/1]" : "aspect-[2/1] max-[760px]:aspect-[1.35/1]"} />
                    ) : <img
                      src={catalogPreviewPaths[component.slug]}
                      alt={`${component.title} ${t("预览")}`}
                      className={[
                        "w-full object-contain object-center p-3",
                        layout === "list" ? "h-full min-h-72" : layout === "matrix" ? "aspect-[1.55/1]" : "aspect-[2/1] max-[760px]:aspect-[1.35/1]",
                      ].join(" ")}
                      loading="lazy"
                    />}
                  </a>
                  <div className="flex min-h-20 items-start gap-4 px-2.5 pb-2.5 pt-4">
                    <a className="min-w-0 flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70" href={componentHref(component.slug)}>
                      <h2 className="text-sm font-[630] tracking-[-0.025em]">{component.title}</h2>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-[1.6] text-white/45">{t(component.summary)}</p>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center rounded-[20px] border border-dashed border-white/15 bg-white/[0.02] text-sm text-white/40">
              {t("没有找到匹配的组件")}
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-white/[0.07] py-7 text-center text-[11px] text-white/28">
          {t("MediaRig · Typed React components")}
        </footer>
      </main>
    </LibraryFrame>
  );
}

export function ComponentDetail({ component, source }: { component: MediaComponentMeta; source: string }) {
  const { t } = useLocale();

  return (
    <LibraryFrame>
      <main className="px-8 pb-20 pt-10 max-[760px]:px-4 max-[760px]:pt-6">
        <div className="mx-auto grid max-w-[1120px] grid-cols-[minmax(0,1fr)_160px] gap-12 max-[1040px]:grid-cols-1">
          <div className="min-w-0">
            <a href="/components" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.01em] text-white/40 transition hover:text-white">
              <ArrowLeft size={14} aria-hidden="true" />
              {t("All components")}
            </a>

            <header className="max-w-3xl">
              <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-[720] leading-[1.05] tracking-[-0.055em]">{component.title}</h1>
              <p className="mt-4 text-sm leading-6 text-white/50">{t(component.description)}</p>
            </header>

            <section id="preview" className="mt-8 scroll-mt-20">
              <div className={["mx-auto", component.previewClassName].join(" ")}>
                <ComponentPreview component={component} source={source}>
                  <ClientDemo slug={component.slug} />
                </ComponentPreview>
              </div>
            </section>


            <footer className="mt-14 flex items-center justify-between border-t border-white/[0.08] pt-6 text-xs text-white/35 max-[640px]:items-start max-[640px]:flex-col max-[640px]:gap-3">
              <span className="flex items-center gap-2"><Layers3 size={14} aria-hidden="true" /> {component.dependencies.length} {t("runtime dependencies")}</span>
              <span>{t("Media Rig · Typed React components")}</span>
            </footer>
          </div>

          <aside className="sticky top-20 h-fit text-xs max-[1240px]:hidden" aria-label={t("页面目录")}>
            <p className="mb-3 font-semibold tracking-[0.01em] text-white/30">{t("On this page")}</p>
            <nav className="grid gap-2.5 border-l border-white/10 pl-4 text-white/40">
              <a className="transition hover:text-white" href="#preview">{t("Preview")}</a>
              <a className="transition hover:text-white" href="#installation">{t("Installation")}</a>
              <a className="transition hover:text-white" href="#props">{t("Props")}</a>
            </nav>
          </aside>
        </div>
      </main>
    </LibraryFrame>
  );
}

export function DirectorWorkspace() {
  const { t } = useLocale();
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#080808] text-white">
      <nav className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-[#181818] px-4 text-xs" aria-label={t("导演台导航")}>
        <a href="/components" className="inline-flex items-center gap-2 text-white/60 hover:text-white"><ArrowLeft size={14} />{t("返回组件库")}</a>
        <a href="/components/director-stage" className="text-white/50 hover:text-white">{t("组件文档与安装")}</a>
      </nav>
      <main className="min-h-0 flex-1">
        <Suspense fallback={<div className="grid h-full place-items-center text-sm text-white/50">{t("正在加载导演台…")}</div>}><ClientDemo slug="director-stage" /></Suspense>
      </main>
    </div>
  );
}
