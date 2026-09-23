import type { IconGraphicProps } from "../icon.types";
import { IconBase } from "../internal/icon-base";

export function ClipTrimBeforeIcon(props: IconGraphicProps) {
  return (
    <IconBase strokeLinecap="square" strokeLinejoin="miter" {...props}>
      <path d="M3 2h6v20H3" strokeDasharray="1 2" strokeLinecap="butt" />
      <path d="M21 2h-6v20h6" />
    </IconBase>
  );
}
