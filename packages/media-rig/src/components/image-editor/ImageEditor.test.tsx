import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ImageEditor from "./ImageEditor";

const { actions, controller } = vi.hoisted(() => {
  const actions = {
    setTool: vi.fn(),
    setPaintMode: vi.fn(),
    setDrawColor: vi.fn(),
    setDrawWidth: vi.fn(),
    setDrawOpacity: vi.fn(),
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
        paintMode: "brush",
        drawColor: "#ff2d20",
        drawWidth: 4,
        drawOpacity: 1,
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
    controller.state.activeTool = "select";
    controller.state.paintMode = "brush";
    controller.state.drawColor = "#ff2d20";
    controller.state.drawWidth = 4;
    controller.state.drawOpacity = 1;
  });

  it("renders the complete MVP editor chrome", () => {
    render(<ImageEditor />);
    expect(screen.getByRole("application", { name: "图片编辑器" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "画布设置" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "编辑工具" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "素材和图层" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加文本" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加图片" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "矩形" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "椭圆" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "直线" })).not.toBeInTheDocument();
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

  it("opens the paint palette with brush, eraser, and a red color control", async () => {
    const user = userEvent.setup();
    controller.state.activeTool = "draw";
    render(<ImageEditor />);

    expect(screen.getByRole("toolbar", { name: "绘色板设置" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "画笔" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("画笔颜色")).toHaveValue("#ff2d20");
    expect(screen.getByRole("slider", { name: "画笔大小" })).toHaveValue("4");
    expect(screen.getByRole("slider", { name: "画笔不透明度" })).toHaveValue("100");
    await user.click(screen.getByRole("button", { name: "橡皮擦" }));
    fireEvent.change(screen.getByLabelText("画笔颜色"), { target: { value: "#14b8a6" } });
    fireEvent.change(screen.getByRole("slider", { name: "画笔大小" }), {
      target: { value: "18" },
    });
    fireEvent.change(screen.getByRole("slider", { name: "画笔不透明度" }), {
      target: { value: "45" },
    });

    expect(actions.setPaintMode).toHaveBeenCalledWith("eraser");
    expect(actions.setDrawColor).toHaveBeenCalledWith("#14b8a6");
    expect(actions.setDrawWidth).toHaveBeenCalledWith(18);
    expect(actions.setDrawOpacity).toHaveBeenCalledWith(0.45);
  });

  it("collapses the paint palette when the active palette button is clicked again", async () => {
    const user = userEvent.setup();
    controller.state.activeTool = "draw";
    render(<ImageEditor />);

    await user.click(screen.getByRole("button", { name: "收起绘色板" }));

    expect(actions.setTool).toHaveBeenCalledWith("select");
  });

  it("enters drag-to-point arrow mode instead of inserting a preset arrow", async () => {
    const user = userEvent.setup();
    render(<ImageEditor />);
    await user.click(screen.getByRole("button", { name: "箭头" }));
    expect(actions.setTool).toHaveBeenCalledWith("arrow");
    expect(actions.addArrow).not.toHaveBeenCalled();
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
