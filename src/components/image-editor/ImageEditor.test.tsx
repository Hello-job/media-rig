import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ImageEditor from "./ImageEditor";

describe("ImageEditor", () => {
  it("renders a named editor region", () => {
    render(<ImageEditor />);
    expect(screen.getByRole("application", { name: "图片编辑器" })).toBeInTheDocument();
  });
});
