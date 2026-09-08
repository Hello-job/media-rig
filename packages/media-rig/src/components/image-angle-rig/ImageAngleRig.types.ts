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
  /** Camera advance from 0 (base size) to 10 (2× preview scale). */
  zoom: number;
  /** Wide-angle output option; does not change the preview's field of view. */
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
  disabled: boolean;
  loading: boolean;
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
  /** Disables the action and shows its pending state. */
  actionLoading?: boolean;
  actionDisabled?: boolean;
  /** Shows a close control when provided; the host owns visibility. */
  onClose?: () => void;
  onAction?: (
    payload: ImageAngleActionPayload,
    event: Parameters<MouseEventHandler<HTMLButtonElement>>[0],
  ) => void;
  /** Movement in pixels before a free two-axis drag starts. Defaults to 3. */
  dragThreshold?: number;
  /** @deprecated Use dragThreshold. Kept as a threshold alias; drags no longer lock axes. */
  dragAxisLockThreshold?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
};
