import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ImageEditor from "./ImageEditor";

const { actions, controller } = vi.hoisted(() => {
  const actions = {
    setTool: vi.fn(),
    toggleLayers: vi.fn(),
    setZoom: vi.fn(),
    fitToViewport: vi.fn(),
    setSnapDisabled: vi.fn(),
    addImage: vi.fn().mockResolvedValue("image-id"),
    addText: vi.fn(),
    addRect: vi.fn(),
    addEllipse: vi.fn(),
    addLine: vi.fn(),
    addArrow: vi.fn(),
    duplicateSelection: vi.fn(),
    deleteSelection: vi.fn(),
    toggleLock: vi.fn(),
    toggleVisibility: vi.fn(),
    bringForward: vi.fn(),
    sendBackward: vi.fn(),
    bringToFront: vi.fn(),
    sendToBack: vi.fn(),
    alignHorizontalCenter: vi.fn(),
    alignVerticalCenter: vi.fn(),
    alignCenter: vi.fn(),
    clearSelection: vi.fn(),
    selectObject: vi.fn(),
    updateSelection: vi.fn(),
    setCanvasSize: vi.fn(),
    setBackground: vi.fn(),
    newDocument: vi.fn(),
    clearDocument: vi.fn(),
    loadDocument: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    save: vi.fn(),
    exportImage: vi.fn().mockResolvedValue(new Blob()),
    startCrop: vi.fn(),
    panCrop: vi.fn(),
    zoomCrop: vi.fn(),
    confirmCrop: vi.fn(),
    cancelCrop: vi.fn(),
    fitImage: vi.fn(),
    flipImage: vi.fn(),
    replaceImage: vi.fn(),
  };
  return {
    actions,
    controller: {
      canvas: null,
      canvasElementRef: { current: null },
      viewportRef: { current: null },
      document: {
        version: 1,
        canvas: { width: 1024, height: 1024, background: "#ffffff" },
        objects: [],
      },
      state: {
        activeTool: "select",
        selectedIds: [],
        zoom: 1,
        canUndo: false,
        canRedo: false,
        isDirty: false,
        isLoading: false,
        layersOpen: false,
      },
      selectedObjects: [],
      actions,
    },
  };
});

vi.mock("./hooks/useImageEditorController", () => ({
  useImageEditorController: () => controller,
}));

describe("ImageEditor", () => {
  beforeEach(() => {
    for (const action of Object.values(actions)) action.mockClear();
  });

  it("renders the complete MVP editor chrome", () => {
    render(<ImageEditor />);
    expect(screen.getByRole("application", { name: "图片编辑器" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "画布设置" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "编辑工具" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "素材和图层" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加文本" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加图片" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "撤销" })).toBeDisabled();
    expect(screen.queryByText("AI 生图")).not.toBeInTheDocument();
  });

  it("wires toolbar interactions to controller actions", async () => {
    const user = userEvent.setup();
    render(<ImageEditor />);
    await user.click(screen.getByRole("button", { name: "添加文本" }));
    await user.click(screen.getByRole("button", { name: "矩形" }));
    await user.click(screen.getAllByRole("button", { name: "图层" })[0]);
    await user.selectOptions(screen.getByRole("combobox", { name: "画布比例" }), "16:9");
    expect(actions.addText).toHaveBeenCalledOnce();
    expect(actions.addRect).toHaveBeenCalledOnce();
    expect(actions.toggleLayers).toHaveBeenCalledOnce();
    expect(actions.setCanvasSize).toHaveBeenCalledWith(1024, 576);
  });

  it("imports dropped and pasted images through the same action", () => {
    render(<ImageEditor />);
    const workspace = screen.getByTestId("image-editor-workspace");
    const file = new File(["image"], "photo.png", { type: "image/png" });
    fireEvent.drop(workspace, { dataTransfer: { files: [file] } });
    fireEvent.paste(workspace, {
      clipboardData: { items: [{ kind: "file", getAsFile: () => file }] },
    });
    expect(actions.addImage).toHaveBeenCalledTimes(2);
    expect(actions.addImage).toHaveBeenNthCalledWith(1, file);
  });
});
