import { Button } from "../motion/button/base";
import { RangeSlider } from "../motion/range-slider";
import { useState } from "react";
import { Download, Pause, Play, Plus, Route, Trash2, X } from "lucide-react";
import { createDirectorCameraPresetPositions, DIRECTOR_CAMERA_MOTION_PRESETS, type DirectorCameraMotionPresetId } from "./camera-motion-presets";
import type { DirectorCamera, DirectorCameraMotion } from "./DirectorStage.types";

type Props = {
  cameras: DirectorCamera[];
  activeCameraId: string | null;
  motions: DirectorCameraMotion[];
  time: number;
  playing: boolean;
  onTime: (time: number) => void;
  onPlaying: (playing: boolean) => void;
  onChange: (motions: DirectorCameraMotion[]) => void;
  onClose: () => void;
  onExport: () => void;
};

export default function DirectorTimeline({ cameras, activeCameraId, motions, time, playing, onTime, onPlaying, onChange, onClose, onExport }: Props) {
  const [picker, setPicker] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(60);
  const duration = Math.max(6, ...motions.map((motion) => motion.start + motion.duration));
  const selection = motions.find((motion) => motion.id === selected);
  const addPath = (preset: DirectorCameraMotionPresetId) => {
    const camera = cameras.find((item) => item.id === activeCameraId) ?? cameras[0];
    if (!camera) return;
    const lastEnd = Math.max(0, ...motions.map((motion) => motion.start + motion.duration));
    const points = createDirectorCameraPresetPositions(preset, [camera.position.x, camera.position.y, camera.position.z], [camera.lookAt.x, 0, camera.lookAt.z]);
    const next: DirectorCameraMotion = { id: crypto.randomUUID(), cameraId: camera.id, camera: structuredClone(camera), label: DIRECTOR_CAMERA_MOTION_PRESETS.find((item) => item.id === preset)!.label, preset, points, duration: 6, start: lastEnd };
    onChange([...motions, next]); setSelected(next.id); setPicker(false); onPlaying(false); onTime(next.start);
  };
  return <section className="director-stage__timeline" aria-label="运镜时间线">
    <header>
      <Button variant="ghost" type="button" aria-label={playing ? "暂停时间轴" : "播放时间轴"} disabled={!motions.length} onClick={() => { if (time >= duration) onTime(0); onPlaying(!playing); }}>{playing ? <Pause size={16} /> : <Play size={16} />}</Button>
      <output>{time.toFixed(1)}s / {duration.toFixed(1)}s</output>
      <Button variant="ghost" type="button" className="is-primary" disabled={!cameras.length} onClick={() => setPicker(!picker)}><Plus size={14} />添加路径</Button>
      <Button variant="ghost" type="button" aria-label="删除选中路径" disabled={!selection} onClick={() => { onPlaying(false); onChange(motions.filter((motion) => motion.id !== selected)); setSelected(null); }}><Trash2 size={14} /></Button>
      {selection && <label>时长<input type="number" min={0.5} max={120} step={0.5} value={selection.duration} onChange={(event) => { const value = Number(event.target.value); if (value >= 0.5 && value <= 120) { onPlaying(false); onChange(motions.map((motion) => motion.id === selected ? { ...motion, duration: value } : motion)); } }} />秒</label>}
      <Button variant="ghost" type="button" disabled={!motions.length} onClick={onExport}><Download size={14} />导出视频</Button>
      <label className="director-stage__timeline-zoom">缩放<RangeSlider className="h-6 w-24" showTicks={false} aria-label="时间线缩放" min={30} max={120} value={zoom} onValueChange={setZoom} /></label>
      <Button variant="ghost" type="button" aria-label="关闭时间轴" onClick={onClose}><X size={16} /></Button>
    </header>
    {picker && <div className="director-stage__path-picker">{DIRECTOR_CAMERA_MOTION_PRESETS.map((preset) => <Button variant="ghost" type="button" key={preset.id} onClick={() => addPath(preset.id)}><Route size={16} /><span>{preset.label}<small>{preset.description}</small></span></Button>)}</div>}
    <div className="director-stage__timeline-scroll">
      <div style={{ minWidth: Math.max(500, duration * zoom + 150) }}>
        <div className="director-stage__time-ruler"><span>机位轨道</span><input aria-label="时间轴播放位置" type="range" min={0} max={duration} step={0.01} value={Math.min(time, duration)} onChange={(event) => { onPlaying(false); onTime(Number(event.target.value)); }} /></div>
        {cameras.map((camera) => <div className="director-stage__track" key={camera.id}><span>{camera.label}</span><div className="director-stage__track-lane">{motions.filter((motion) => motion.cameraId === camera.id).map((motion) => <button type="button" key={motion.id} className={selected === motion.id ? "is-selected" : ""} style={{ left: `${motion.start / duration * 100}%`, width: `${motion.duration / duration * 100}%` }} onClick={() => { setSelected(motion.id); onPlaying(false); onTime(motion.start); }}>{motion.label} · {motion.duration}s</button>)}<i style={{ left: `${Math.min(time / duration, 1) * 100}%` }} /></div></div>)}
        {!motions.length && <p className="director-stage__timeline-empty">为当前机位添加运镜路径，播放或拖动时间轴预览。</p>}
      </div>
    </div>
  </section>;
}
