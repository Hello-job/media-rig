import React, { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

type ComponentPreviewProps = {
  title: string;
  description: string;
  source: string;
  stageClassName?: string;
  children: ReactNode;
};

type SourceCodeProps = {
  source: string;
};

function copySourceWithSelection(source: string) {
  const textarea = document.createElement("textarea");
  textarea.value = source;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return typeof document.execCommand === "function" && document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

function SourceCode({ source }: SourceCodeProps) {
  return (
    <pre className="m-0 max-h-80 overflow-auto overscroll-contain bg-transparent pb-5 pr-5 pt-4 font-mono text-[13px] leading-7 text-[#d8d9d3] outline-none [scrollbar-width:thin] [tab-size:2] focus-visible:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.45)]" tabIndex={0}>
      <code>
        {source.split("\n").map((line, index) => (
          <span className="grid min-w-max grid-cols-[54px_minmax(0,1fr)] whitespace-pre" key={`${index}-${line}`}>
            <span className="select-none text-center text-white/25" aria-hidden="true">
              {index + 1}
            </span>
            <span>{line || " "}</span>
          </span>
        ))}
      </code>
    </pre>
  );
}

export default function ComponentPreview({
  title,
  description,
  source,
  stageClassName = "",
  children,
}: ComponentPreviewProps) {
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const sourcePreview = source.split("\n").slice(0, 3).join("\n");
  const titleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-preview-title`;

  const copySource = async () => {
    if (copySourceWithSelection(source)) {
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1600);
      return;
    }

    try {
      await navigator.clipboard.writeText(source);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }

    window.setTimeout(() => setIsCopied(false), 1600);
  };

  return (
    <section
      className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#181818] shadow-[0_22px_64px_rgba(0,0,0,0.34)] max-[760px]:rounded-xl"
      aria-labelledby={titleId}
      aria-label={`${title} component preview`}
    >
      <h3 id={titleId} className="sr-only">{title}: {description}</h3>
      <div className={["relative min-w-0 w-full overflow-hidden", stageClassName].filter(Boolean).join(" ")}>
        {children}
      </div>

      <div className="relative overflow-hidden border-t border-white/10 bg-[#181818]" data-expanded={isCodeVisible}>
        {isCodeVisible ? (
          <div className="relative overflow-hidden">
            <button
              type="button"
              className="absolute right-3.5 top-3 z-10 grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/50 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 [&_svg]:size-4"
              aria-label={isCopied ? "Copied" : "Copy source"}
              title={isCopied ? "Copied" : "Copy source"}
              onClick={copySource}
            >
              {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </button>
            <SourceCode source={source} />
          </div>
        ) : (
          <div className="relative h-28 overflow-hidden">
            <SourceCode source={sourcePreview} />
            <div className="absolute inset-0 flex items-center justify-center pb-3">
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#181818_18%,rgba(24,24,24,0.78)_58%,transparent_100%)]" aria-hidden="true" />
              <button
                type="button"
                className="relative z-10 inline-flex h-8 items-center justify-center rounded-lg border border-white/15 bg-[#242424] px-3.5 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                onClick={() => setIsCodeVisible(true)}
              >
                View Code
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
