import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider, useLocale } from "./LocaleProvider";
import { translate, LOCALE_COOKIE } from "./messages";
import { mediaComponents } from "@/preview/catalog";

function Probe() {
  const { locale, setLocale, t } = useLocale();
  return <><button onClick={() => setLocale(locale === "zh-CN" ? "en-US" : "zh-CN")}>switch</button><p>{t("预览")}</p><p>{t("Video Trim")}</p></>;
}
describe("site locale", () => {
  it("switches both ways, persists the preference, and preserves component names", () => {
    render(<LocaleProvider initialLocale="zh-CN"><Probe /></LocaleProvider>);
    expect(screen.getByText("预览")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en-US");
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=en-US`);
    expect(screen.getByText("Video Trim")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("预览")).toBeInTheDocument();
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=zh-CN`);
  });
  it("renders the saved locale immediately", () => {
    render(<LocaleProvider initialLocale="en-US"><Probe /></LocaleProvider>);
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });
  it("covers every component description and API explanation", () => {
    for (const component of mediaComponents) {
      for (const text of [component.description, component.summary, ...component.api.map(item => item.description)]) {
        expect(translate(text, "en-US")).not.toMatch(/[\u4e00-\u9fff]/);
        expect(translate(text, "zh-CN")).toBe(text);
      }
      expect(translate(component.title, "zh-CN")).toBe(component.title);
    }
  });
});
