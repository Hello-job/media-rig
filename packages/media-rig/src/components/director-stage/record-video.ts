/** Record the rendered viewport with the same centered crop as still capture. */
export function recordDirectorVideo(source: HTMLCanvasElement, seconds: number, ratio: number | null, signal: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const output = document.createElement("canvas");
    const width = ratio ? Math.min(source.width, source.height * ratio) : source.width;
    const height = ratio ? width / ratio : source.height;
    output.width = Math.max(2, Math.round(width / 2) * 2);
    output.height = Math.max(2, Math.round(height / 2) * 2);
    const context = output.getContext("2d");
    if (!context || !output.captureStream || typeof MediaRecorder === "undefined") { reject(new Error("当前浏览器不支持视频导出")); return; }
    const stream = output.captureStream(30);
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
    let recorder: MediaRecorder;
    try { recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); } catch (error) { stream.getTracks().forEach((track) => track.stop()); reject(error); return; }
    const chunks: Blob[] = [];
    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;
    const stop = () => { if (recorder.state !== "inactive") recorder.stop(); };
    const clean = () => { cancelAnimationFrame(frame); clearTimeout(timer); stream.getTracks().forEach((track) => track.stop()); signal.removeEventListener("abort", stop); };
    const draw = () => { context.drawImage(source, (source.width - width) / 2, (source.height - height) / 2, width, height, 0, 0, output.width, output.height); frame = requestAnimationFrame(draw); };
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => { clean(); reject(new Error("视频编码失败")); };
    recorder.onstop = () => { clean(); if (signal.aborted) reject(new Error("已取消视频导出")); else resolve(new Blob(chunks, { type: recorder.mimeType })); };
    signal.addEventListener("abort", stop, { once: true });
    if (signal.aborted) { clean(); reject(new Error("已取消视频导出")); return; }
    draw(); recorder.start(); timer = setTimeout(stop, seconds * 1000);
  });
}
