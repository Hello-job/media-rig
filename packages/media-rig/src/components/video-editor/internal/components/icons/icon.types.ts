import type { ComponentType, SVGProps } from "react";

export const ICON_TYPES = [
  "speechPace",
  "speechPause",
  "speechEmotion",
  "speechInterjection",
  "redraw",
  "erase",
  "annotate",
  "hd",
  "enhance",
  "expand",
  "multiAngle",
  "lighting",
  "crop",
  "cutout",
  "nineGrid",
  "elementEdit",
  "layerSeparate",
  "skeletonSplit",
  "clipSplit",
  "clipTrimBefore",
  "clipTrimAfter",
  "videoEdit",
] as const;

export type IconType = (typeof ICON_TYPES)[number];

export type IconSize = number | string;

export type IconGraphicProps = Omit<
  SVGProps<SVGSVGElement>,
  "children" | "height" | "type" | "width"
> & {
  size?: IconSize;
};

export type IconComponent = ComponentType<IconGraphicProps>;

export type IconProps = IconGraphicProps & {
  type: IconType;
};
