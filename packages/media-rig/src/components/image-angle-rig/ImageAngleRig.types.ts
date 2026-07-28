import type {
  ComponentType,
  CSSProperties,
  MouseEventHandler,
} from "react";

export type ImageAngleState = {
  /** Horizontal rotation in degrees. */
  yaw: number;
  /** Vertical tilt in degrees. */
  pitch: number;
  /** Whole-cube zoom from 0 (base size) to 10 (maximum size). */
  zoom: number;
  /** Uses a wider camera field of view when enabled. */
  wideAngle: boolean;
};

export type ImageAngleActionPayload = {
  value: ImageAngleState;
  input?: unknown;
};

export type ImageAngleActionButtonProps = {
  className: string;
  value: ImageAngleState;
  input?: unknown;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export type ImageAngleRigProps = {
  imageUrl?: string;
  value?: Partial<ImageAngleState>;
  defaultValue?: Partial<ImageAngleState>;
  onChange?: (value: ImageAngleState) => void;
  onChangeEnd?: (value: ImageAngleState) => void;
  /** Optional button component rendered in the bottom-right action slot. */
  actionButton?: ComponentType<ImageAngleActionButtonProps>;
  /** Arbitrary input forwarded to the action button and onAction payload. */
  actionInput?: unknown;
  onAction?: (
    payload: ImageAngleActionPayload,
    event: Parameters<MouseEventHandler<HTMLButtonElement>>[0],
  ) => void;
  /** Pixels of movement required before an axis participates in the drag. */
  dragAxisLockThreshold?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
};
