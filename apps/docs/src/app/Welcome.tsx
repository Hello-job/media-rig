"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import GridDistortion from "@/components/GridDistortion";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import { useLocale } from "@/i18n/LocaleProvider";
import CatalogMediaPreview from "@/preview/components/CatalogMediaPreview";
import CatalogStudioPreview from "@/preview/components/CatalogStudioPreview";
import { mediaComponents } from "@/preview/catalog";
import styles from "./welcome.module.css";

const featured = [
  { slug: "video-trim", title: "Video Trim", caption: "选取片段，保留精彩" },
  { slug: "image-annotation", title: "Image Annotation", caption: "画出想法，标记重点" },
  { slug: "light-sphere", title: "Light Sphere", caption: "让每一束光恰到好处" },
] as const;

export default function Welcome() {
  const { t } = useLocale();
  return <main className={styles.welcome}>
    <div className={styles.background} aria-hidden="true">
      <GridDistortion imageSrc="/assets/welcome/grid-distortion.jpg" grid={10} mouse={0.25} strength={0.08} relaxation={0.9} />
    </div>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>MediaRig</Link>
      <nav className={styles.navigation} aria-label={t("首页导航")}>
        <Link href="/components">{t("组件")}</Link>
        <Link href="/components/video-trim#installation">{t("文档")}</Link>
        <span className={styles.divider} aria-hidden="true" />
        <LanguageSwitcher />
      </nav>
    </header>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>{t("为创意工作流而生")}</p>
      <h1>{t("让创作灵感")}<br />{t("即刻成为交互")}</h1>
      <p className={styles.description}>{t("为图片、视频与 3D 创作打造的 React 交互组件。")}</p>
      <div className={styles.actions}>
        <Link href="/components" className={styles.primary}>{t("开始使用")}<ArrowRight size={20} /></Link>
        <Link href="/components#components" className={styles.secondary}>{t("浏览组件")}<ArrowUpRight size={17} /></Link>
      </div>
      <p className={styles.facts}>{mediaComponents.length} {t("个组件")}<span>·</span>TypeScript<span>·</span>{t("shadcn 安装")}</p>
    </section>
    <section className={styles.featured} aria-labelledby="featured-heading">
      <div className={styles.sectionHeading}>
        <h2 id="featured-heading">{t("从一个组件开始")}</h2>
        <Link href="/components">{t("查看全部")}<ArrowUpRight size={17} /></Link>
      </div>
      <div className={styles.cards}>
        {featured.map(item => <Link key={item.slug} href={`/components/${item.slug}`} className={styles.card}>
          <div className={styles.preview} aria-hidden="true">
            {item.slug === "light-sphere"
              ? <CatalogStudioPreview kind="light-sphere" className={styles.studio} />
              : <CatalogMediaPreview kind={item.slug} className={styles.media} />}
          </div>
          <div className={styles.cardCopy}><div><h3>{item.title}</h3><p>{t(item.caption)}</p></div><ArrowUpRight size={20} aria-hidden="true" /></div>
        </Link>)}
      </div>
    </section>
    <footer className={styles.footer}>MediaRig <span>·</span> {t("为创作提供更多可能")}</footer>
  </main>;
}
