import React from "react";
import { DirectorStage } from "media-rig";

export default function DirectorStagePreview() {
  return (
    <DirectorStage
      initialComposition={{
        environment: {
          showGround: true,
          groundOpacity: 0.3,
          skyColor: "#161616",
        },
      }}
      storageKey={false}
      style={{ height: "100%", background: "#121212" }}
    />
  );
}
