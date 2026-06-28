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
    <pre className="component-preview__pre" tabIndex={0}>
      <code>
        {source.split("\n").map((line, index) => (
          <span className="component-preview__code-line" key={`${index}-${line}`}>
            <span className="component-preview__line-number" aria-hidden="true">
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
    <main className="preview-page" aria-labelledby={titleId}>
      <div className="preview-page__content">
        <header className="preview-page__header">
          <p className="preview-page__eyebrow">Components</p>
          <h1 id={titleId}>{title}</h1>
          <p>{description}</p>
        </header>

        <section className="component-preview" aria-label={`${title} component preview`}>
          <div className={["component-preview__stage", stageClassName].filter(Boolean).join(" ")}>
            {children}
          </div>

          <div className="component-preview__code" data-expanded={isCodeVisible}>
            {isCodeVisible ? (
              <div className="component-preview__code-expanded">
                <button
                  type="button"
                  className="component-preview__copy-button"
                  aria-label={isCopied ? "Copied" : "Copy source"}
                  title={isCopied ? "Copied" : "Copy source"}
                  onClick={copySource}
                >
                  {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                </button>
                <SourceCode source={source} />
              </div>
            ) : (
              <div className="component-preview__code-collapsed">
                <SourceCode source={sourcePreview} />
                <div className="component-preview__code-reveal">
                  <div className="component-preview__code-gradient" aria-hidden="true" />
                  <button
                    type="button"
                    className="component-preview__view-code"
                    onClick={() => setIsCodeVisible(true)}
                  >
                    View Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
