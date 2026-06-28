# Shadcn-Style Component Preview Design

## Goal

Change the local preview application from full-viewport component rendering to the component-preview pattern used by the current shadcn documentation. Preserve all existing DirectorStage and LightSphere interactions.

## Reference Behavior

The implementation is grounded in the current shadcn Accordion documentation and its `ComponentPreviewTabs` source:

- One rounded, bordered card contains both the live component and its source.
- The live component remains fully interactive in the upper region.
- The collapsed source region renders only the first three lines.
- A bottom-up code-background gradient covers the source preview.
- A centered `View Code` button reveals the complete source.
- Expanded source is capped at 18rem (288px) and scrolls vertically when needed.
- The copy action appears at the upper-right of the expanded code region.
- Mobile and desktop use the same interaction and card structure.

## Chosen Approach

Create one reusable preview shell in `src/preview/components` and use it from both preview routes.

The shell accepts:

- the live React component as children;
- the source string to display and copy;
- accessible component labeling;
- an optional stage-size class for complex demos.

This keeps preview mechanics independent from DirectorStage and LightSphere. The demos retain their existing state and behavior; only their containing page changes.

## Layout

The preview application uses a light documentation canvas and a centered content column. Each page includes a compact title and description followed by the preview card.

The preview card has:

1. A large live stage sized for the existing 3D UI rather than shadcn's small component default. DirectorStage receives the largest stage. LightSphere keeps enough height and width for its control panel.
2. A divider separating the live stage from code.
3. The shadcn-style collapsed or expanded code region.

At narrow viewport widths, the page loses excess outer padding while the card remains full width. Existing component-level responsive behavior remains authoritative inside the stage.

## Interaction

- `View Code` changes the code region from the three-line preview to the complete source.
- The reveal is one-way for the current page session, matching shadcn's implementation.
- `Copy` writes the full source to the clipboard and exposes a temporary copied state through its accessible label and icon.
- Keyboard focus styles remain visible on both actions.

## Source Handling

Vite raw imports provide the real preview page source instead of a manually duplicated snippet. Each route supplies its corresponding raw source string to the shared shell.

## Testing

Automated tests cover the reusable interaction state and source-line preview behavior. Type checking and both preview/library builds must pass. Browser verification covers:

- initial three-line source preview;
- code reveal and copy affordance;
- unchanged DirectorStage interaction surface;
- desktop and mobile layout;
- visual comparison against the supplied screenshot and the current official shadcn page.

## Scope Boundaries

- Do not change DirectorStage or LightSphere public APIs.
- Do not redesign the internal 3D editor controls.
- Do not add documentation navigation, sidebars, search, or unrelated shadcn page chrome.
- Preserve the user's current uncommitted fullscreen edits in DirectorStage.
