import React from "react";

/** Lightweight visual examples: no editor or canvas runtime on the catalog. */
export default function CatalogEffectPreview({ kind, className }: { kind: "image-annotation" | "layer-separator"; className: string }) {
  const annotation = kind === "image-annotation";
  return <div className={`relative ${className}`} role="img" aria-label={annotation ? "图片涂鸦：红色圈线、矩形与文字标注效果" : "图层分离：室内背景与花瓶、椅子、落地灯独立图层"}>
    <svg viewBox="0 0 800 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <clipPath id={`catalog-${kind}`}><rect x="92" y="28" width="616" height="344" rx="12" /></clipPath>
      </defs>
      {annotation ? <>
        <image href="/assets/layer-separator/scene.png" x="92" y="28" width="616" height="344" preserveAspectRatio="xMidYMid slice" clipPath={`url(#catalog-${kind})`} />
        <g fill="none" stroke="#ff4545" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 370 186 C 323 192 300 262 341 324 C 377 357 502 351 531 307 C 557 261 522 191 468 179 C 421 168 368 173 352 194" />
          <rect x="556" y="67" width="70" height="265" rx="4" />
          <path d="M 431 104 Q 459 122 478 150 M 459 144 L 478 150 L 478 130" />
          <path d="M 163 334 Q 211 343 262 332" />
        </g>
        <rect x="288" y="61" width="165" height="44" rx="9" fill="#202124" />
        <text x="306" y="90" fill="#ff6969" fontSize="22" fontFamily="sans-serif" fontWeight="600">调整这个位置</text>
        <rect x="113" y="44" width="126" height="32" rx="8" fill="#17181bea" />
        <text x="129" y="65" fill="#f5f5f5" fontSize="14" fontFamily="sans-serif">✎  涂鸦与标注</text>
      </> : <>
        <rect x="42" y="84" width="345" height="248" rx="12" fill="#24262a" stroke="#ffffff25" />
        <image href="/assets/layer-separator/background.png" x="53" y="95" width="323" height="215" />
        <text x="59" y="72" fill="#a1a1aa" fontSize="15" fontFamily="sans-serif">背景层</text>
        <path d="M 402 208 H 443 M 432 197 L 444 208 L 432 219" stroke="#8c9eae" strokeWidth="3" fill="none" />
        {[
          { name: "花瓶", file: "vase", x: 458, y: 112, box: "100 250 390 640" },
          { name: "椅子", file: "chair", x: 554, y: 79, box: "550 430 510 510" },
          { name: "落地灯", file: "lamp", x: 650, y: 46, box: "1120 110 290 810" },
        ].map((layer, index) => <g key={layer.file}>
          <rect x={layer.x} y={layer.y} width="112" height="230" rx="10" fill="#20252a" stroke="#87b6d7" strokeOpacity=".6" />
          <svg x={layer.x + 9} y={layer.y + 14} width="94" height="166" viewBox={layer.box} preserveAspectRatio="xMidYMid meet">
            <image href={`/assets/layer-separator/${layer.file}.png`} width="1536" height="1024" />
          </svg>
          <text x={layer.x + 12} y={layer.y + 209} fill="#d1e8f7" fontSize="13" fontFamily="sans-serif">0{index + 1}  {layer.name}</text>
        </g>)}
        <text x="461" y="373" fill="#8da8bc" fontSize="14" fontFamily="sans-serif">独立图层 · 自由编排</text>
      </>}
    </svg>
  </div>;
}
