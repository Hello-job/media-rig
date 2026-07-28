import { createRef } from "react";
import { describe, expect, it } from "vitest";
import {
  ImageEditor,
  ImageEditorError,
  type ImageEditorDocument,
  type ImageEditorHandle,
  type ImageEditorProps,
} from "../../index";

describe("ImageEditor public API", () => {
  it("exports the component, serializable document types, and imperative handle", () => {
    const document: ImageEditorDocument = {
      version: 1,
      canvas: { width: 800, height: 600, background: null },
      objects: [],
    };
    const props: ImageEditorProps = { initialDocument: document };
    const ref = createRef<ImageEditorHandle>();
    expect(ImageEditor).toBeTruthy();
    expect(props.initialDocument).toEqual(document);
    expect(ref.current).toBeNull();
    expect(new ImageEditorError("DOCUMENT_INVALID", "bad")).toMatchObject({
      code: "DOCUMENT_INVALID",
      message: "bad",
    });
  });
});
