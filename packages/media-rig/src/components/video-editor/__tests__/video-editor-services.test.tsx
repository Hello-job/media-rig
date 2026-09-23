import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { VideoEditor } from "../video-editor";
import { EMPTY_EDIT } from "../timeline";
import { createThumbnailStrip } from "../thumbnail-strip";
import { useVideoEditorServices } from "../video-editor-context";

vi.mock("../video-editor-panel", () => ({
  VideoEditorPanel: () => {
    const services = useVideoEditorServices();
    return <span>{services.loadThumbnails === createThumbnailStrip ? "default frames" : "custom frames"}</span>;
  },
}));

it("provides thumbnail extraction without host configuration and allows an override", () => {
  const props = { value: EMPTY_EDIT, onChange: vi.fn(), sources: [] };
  const { rerender } = render(<VideoEditor {...props} />);
  expect(screen.getByText("default frames")).toBeInTheDocument();
  rerender(<VideoEditor {...props} services={{ loadThumbnails: vi.fn() }} />);
  expect(screen.getByText("custom frames")).toBeInTheDocument();
});
