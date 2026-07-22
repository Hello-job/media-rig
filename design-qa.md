# Design QA: Image Angle Rig Interaction and Action Slot Revision

Source visual truth:

- User-provided solid rounded-cube screenshot and interaction corrections in the current conversation.
- Local representative crop: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-cube-reference.png`
- Original interaction reference: `/Users/admin/Downloads/飞书20260721-143634.mp4`

Implementation evidence:

- Browser-rendered default component: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-whole-scale-default.png`
- Right-drag state: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-drag-right.png`
- Default/diagonal-drag comparison: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-diagonal-drag-comparison.png`
- Zoom `0 / 10` comparison: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-whole-scale-comparison.png`
- Full source/implementation comparison: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-whole-scale-full-comparison.png`
- Focused cube comparison: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-whole-scale-focused-comparison.png`
- Reset/action layout and clicked-state comparison: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-action-slot-comparison.png`
- Source/layout comparison: `/Users/admin/Desktop/Hello word/项目/media-rig/docs/references/image-angle-action-slot-full-comparison.png`

Viewport and state:

- 1920 × 958 browser viewport at `http://localhost:4319/?demo=angle`.
- Default state: `yaw 34° / pitch -25° / zoom 0`, standard lens.
- The source uses a different portrait; comparison is structural. The implementation uses the project's real samurai asset while preserving the requested rounded solid, front-only image, and `T/R` face presentation.

## Findings

No actionable P0, P1, or P2 issues remain.

- Horizontal and vertical pointer movement use grab-style direction: the face under the pointer travels with the drag instead of rotating against it.
- Three drag modes now coexist: dominant horizontal movement controls yaw, dominant vertical movement controls pitch, and a deliberate diagonal gesture controls both.
- Each axis must clear the configurable 8 px threshold before it can participate. A 2:1-or-greater dominant direction remains single-axis, so incidental cross-axis movement does not alter the other angle.
- Zoom no longer changes texture repeat or crop. The complete group—body, image plane, rounded mask, and face letters—scales together from `1×` at `0` to `1.35×` at `10`.
- Camera distance was adjusted so the larger whole-cube zoom state remains inside the manipulation canvas.
- Reset is now anchored inside the canvas at a 16 px left/bottom inset. The injected action component is aligned at the bottom-right of the controls with one rendered instance.
- The action slot receives the current normalized `value`, the caller's arbitrary `input`, and a default `onClick`. Its callback receives `{ value, input }` plus the original click event.

## Required Fidelity Surfaces

- Fonts and typography: existing Geist UI text, monospaced readouts, and bold system-sans face marks remain unchanged and legible. Passed.
- Spacing and layout rhythm: the base cube is centered with enough surrounding space for the `1.35×` maximum state. Reset sits at canvas `(266, 685)` against canvas origin `(250, 177)`, and the 132 × 36 action sits at the control area's lower-right edge. Passed.
- Colors and visual tokens: graphite cube, near-black canvas, white slider emphasis, and restrained face shading remain aligned to the source. Passed.
- Image quality and asset fidelity: the real project image remains center-cropped, sRGB, anisotropically filtered, and rounded without halos. Its subject framing is identical at zoom `0` and `10`; only the full object size changes. Passed.
- Copy and content: the visible `缩放` control, `0–10` range, `S` readout, `重置角度`, and caller-owned action label remain consistent with the compact source UI. Passed.
- Accessibility and semantics: both footer actions are native `button` elements with visible focus styling; the injected action preserves the caller's content while receiving the component's class and click behavior. Passed.

## Interaction Evidence

- A diagonal drag from `(650,600)` to `(770,500)` changed both axes from `Y 34° / X -25°` to `Y -6.8° / X 5°`.
- A nearly horizontal drag with 10 px vertical wobble changed yaw to `Y -23.8°` while pitch stayed at `X -25°`.
- A nearly vertical drag with 10 px horizontal wobble changed pitch to `X 14°` while yaw stayed at `Y 34°`.
- Zoom `0` rendered the group at `1×`; zoom `10` rendered it at `1.35×`. The front-image crop and the cube-to-image proportions remained identical.
- Reset restores `yaw 34° / pitch -25° / zoom 0`.
- With yaw set to `-24°`, clicking the injected preview button changed its label from `应用参数` to `已应用 Y -24°`, confirming the live value and input payload reached the caller callback.
- Browser console checked: zero errors originated from the `localhost:4319` preview.

## Comparison History

- Earlier revision: user review identified opposite-feeling drag direction (P1 interaction) and texture-only zoom instead of whole-object zoom (P1 behavior).
- Fixes applied: inverted drag-to-angle deltas for the existing negative scene rotations, removed zoom from texture repeat, applied zoom to the full cube group, and increased camera distance to preserve canvas fit.
- Diagonal revision: user review identified that hard single-axis locking prevented diagonal manipulation (P1 interaction). The resolver now promotes a gesture to dual-axis once both directions exceed the dead zone and neither dominates by 2:1.
- Action-slot revision: user review requested reset in the lower-left and a caller-supplied button component in the lower-right (P1 layout/API). Reset moved into the canvas overlay; the action slot now injects `className`, `value`, `input`, and `onClick`, with `onAction` exposing the payload and event.
- Final pass: source/default, focused-cube, horizontal, vertical, diagonal, zoom-state, action layout, and callback-state checks show the corrected behavior with no actionable P0/P1/P2 differences remaining.

## Implementation Checklist

- [x] Grab-style horizontal and vertical drag direction.
- [x] Dominant horizontal and vertical gestures remain single-axis.
- [x] Deliberate diagonal gestures update yaw and pitch together.
- [x] Configurable movement threshold filters minor cross-axis noise.
- [x] Whole-cube zoom for values `0–10`.
- [x] Image crop remains fixed during zoom.
- [x] Maximum zoom stays within the canvas.
- [x] Reset action anchored to the canvas lower-left.
- [x] Caller-supplied action component anchored to the controls lower-right.
- [x] Default click handler exposes current value, arbitrary input, and original event.
- [x] Typecheck, unit tests, preview build, and library build.

## Follow-up Polish

- No P3 visual issue is required for this interaction revision.

final result: passed
