import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComponentPreview from "./ComponentPreview";

const source = ["line 1", "line 2", "line 3", "line 4", "line 5", "line 6"].join("\n");

describe("ComponentPreview", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  it("shows a three-line preview before revealing the full source", () => {
    render(
      <ComponentPreview title="Demo" description="Description" source={source}>
        <div>Live demo</div>
      </ComponentPreview>,
    );

    expect(screen.getByText("line 3")).toBeInTheDocument();
    expect(screen.queryByText("line 4")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View Code" }));

    expect(screen.getByText("line 6")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy source" })).toBeInTheDocument();
  });

  it("copies the complete source", async () => {
    render(
      <ComponentPreview title="Demo" description="Description" source={source}>
        <div>Live demo</div>
      </ComponentPreview>,
    );

    fireEvent.click(screen.getByRole("button", { name: "View Code" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy source" }));

    expect(writeText).toHaveBeenCalledWith(source);
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("uses selection copy while the click still has user activation", async () => {
    const execCommand = vi.fn(() => true);
    writeText.mockRejectedValueOnce(new DOMException("Permission denied", "NotAllowedError"));
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    render(
      <ComponentPreview title="Demo" description="Description" source={source}>
        <div>Live demo</div>
      </ComponentPreview>,
    );

    fireEvent.click(screen.getByRole("button", { name: "View Code" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy source" }));

    await waitFor(() => expect(execCommand).toHaveBeenCalledWith("copy"));
    expect(writeText).not.toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
});
