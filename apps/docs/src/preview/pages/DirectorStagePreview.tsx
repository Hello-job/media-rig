import React from "react";
import { DirectorStage } from "media-rig";

export default function DirectorStagePreview() {
  return (
    <DirectorStage
      onClose={() => { window.location.href = "/"; }}
      storageKey={false}
      style={{ height: "100%", minHeight: 0, background: "#080808" }}
    />
  );
}
