import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import ComponentPreview from "./ComponentPreview";
import { mediaComponents } from "../catalog";

const component = mediaComponents.find(item => item.slug === 'image-annotation')!;
const source = 'import { ImageAnnotation } from "media-rig";\nexport default function Demo() { return <ImageAnnotation imageUrl="/scene.png" />; }';
const mount = () => render(<ComponentPreview component={component} source={source}><input aria-label="编辑状态" defaultValue="原图" /></ComponentPreview>);

describe('preview and installation workspace', () => {
  const writeText = vi.fn();
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => false) });
  });
  it('switches between mutually exclusive panels without losing editor state', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeText);
    mount();
    fireEvent.change(screen.getByLabelText('编辑状态'), {target: {value: '已编辑'}});
    expect(screen.getByRole('tab', {name:'预览'})).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', {name:'代码'}));
    expect(screen.getByLabelText('编辑状态')).not.toBeVisible();
    await waitFor(() => expect(screen.getByText('pnpm dlx media-rig@latest add image-annotation')).toBeVisible());
    expect(window.location.hash).toBe('#installation');
    await user.click(screen.getByRole('tab', {name:'属性'}));
    expect(window.location.hash).toBe('#props');
    await waitFor(() => expect(screen.getByRole('table')).toBeVisible());
    expect(within(screen.getByRole('table')).getByText(component.api[0].name)).toBeVisible();
    expect(screen.getByText('pnpm dlx media-rig@latest add image-annotation')).not.toBeVisible();
    await user.click(screen.getByRole('tab', {name:'预览'}));
    expect(screen.getByLabelText('编辑状态')).toHaveValue('已编辑');
    await waitFor(() => expect(screen.getByLabelText('编辑状态')).toBeVisible());
  });
  it('opens installation deep links and supports keyboard tab navigation', async () => {
    window.history.replaceState(null, '', '#installation');
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeText);
    mount();
    const codeTab = screen.getByRole('tab', {name:'代码'});
    expect(codeTab).toHaveAttribute('aria-selected', 'true');
    codeTab.focus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', {name:'预览'})).toHaveFocus();
    expect(screen.getByRole('tab', {name:'预览'})).toHaveAttribute('aria-selected', 'true');
  });
  it('changes package manager and installer and copies the current command', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeText);
    mount();
    await user.click(screen.getByRole('tab', {name:'代码'}));
    await user.click(screen.getByRole('combobox', {name:'包管理器'}));
    await user.click(screen.getByRole('option', {name:/^npm$/}));
    await user.click(screen.getByRole('combobox', {name:'安装工具'}));
    await user.click(screen.getByRole('option', {name:/^shadcn$/}));
    fireEvent.click(screen.getByRole('button', {name:'复制安装命令'}));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('npx shadcn@latest add https://media-rig.vercel.app/r/image-annotation.json'));
    fireEvent.click(screen.getByRole('tab', {name:'手动'}));
    expect(await screen.findByRole('link', {name:/下载源码清单/})).toHaveAttribute('download', 'image-annotation.json');
  });
  it('copies usage with a client boundary and local source import', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeText);
    mount();
    await user.click(screen.getByRole('tab', {name:'代码'}));
    fireEvent.click(screen.getByRole('button', {name:'复制使用示例'}));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('"use client";')));
    expect(writeText.mock.calls[0][0]).toContain('from "@/components/image-annotation"');
  });
  it('reports clipboard failure instead of falsely showing success', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeText);
    mount();
    fireEvent.click(screen.getByRole('button', {name:'复制组件链接'}));
    expect(await screen.findByText('复制失败，请选择代码手动复制')).toBeInTheDocument();
  });
});
