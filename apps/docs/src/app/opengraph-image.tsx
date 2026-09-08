import { ImageResponse } from "next/og";
export const alt = "MediaRig — React media components";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#121212", color: "white" }}><div style={{ fontSize: 28, color: "#91bccc", marginBottom: 35 }}>OPEN SOURCE · REACT · TYPESCRIPT</div><div style={{ fontSize: 110, fontWeight: 700 }}>MediaRig</div><div style={{ fontSize: 36, color: "#aaaaaa", marginTop: 28 }}>Image tools. Lighting. 3D direction.</div><div style={{ fontSize: 25, color: "#777777", marginTop: 65 }}>media-rig.vercel.app</div></div>, size);
}
