import { describe, expect, it } from "vitest";
import packageJson from "../../../package.json";
import { DirectorStage } from "../../index";
import { DEFAULT_CHARACTER_MODEL_URL, defaultCharacter } from "./DirectorStage.constants";

describe("DirectorStage package surface", () => {
  it("exports the DirectorStage component", () => {
    expect(DirectorStage).toBeTypeOf("function");
  });

  it("does not depend on the preview app model path", () => {
    expect(DEFAULT_CHARACTER_MODEL_URL).not.toBe("/assets/static-mixamo-rigged.glb");
    expect(defaultCharacter(0).modelUrl).toBe(DEFAULT_CHARACTER_MODEL_URL);
  });

  it("publishes the DirectorStage stylesheet in version 0.2.0", () => {
    expect(packageJson.version).toBe("0.2.0");
    expect(packageJson.exports?.["./style.css"]).toBe("./dist/style.css");
  });
});
