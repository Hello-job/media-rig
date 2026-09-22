# Poolside layer separator assets

Mode: built-in image_gen. Fictional adult model.

- reference.png: original generated editorial.
- background.png: pool and sea background.
- model.png: transparent portrait layer.
- skincare.png: transparent skincare and plinth layer.
- scene.svg: full-canvas assembly of these three generated PNG layers, matching the editor's initial composition.

## Reference prompt

Photorealistic luxury Korean resort fashion editorial, landscape 3:2, 1536x1024. A fictional adult Korean female fashion model age 28 with long dark hair and elegant natural makeup, wearing an opaque white linen sleeveless midi summer dress, standing barefoot in a relaxed fashion pose on a pale limestone swimming pool terrace. Full figure visible with headroom and feet in frame, model occupying left-center x 28-50%, y 12-90%. In far right foreground x 72-90%, a separate low cream stone cylindrical plinth holding two unbranded ivory sunscreen skincare bottles, an amber perfume bottle and neatly folded white towel. Clear open space separates the woman from this skincare still-life. Background: turquoise infinity swimming pool, distant sea horizon, warm white resort architecture, distant empty lounger and ivory parasol, soft palm shadows, sunlit high-end travel magazine photography, natural skin texture, soft rich colors. Sophisticated fashion and beauty campaign, calm and tasteful. No lettering, logos or watermarks. Foreground model and skincare plinth are distinct subjects that can be extracted separately.

## Extraction prompts

### background

Edit this exact photograph. Remove the woman completely and remove the entire foreground stone cylindrical pedestal with all bottles and towel. Seamlessly reconstruct the pool and terrace behind them. Preserve every other scene detail, framing, lighting, architecture, sea and pool. Output same landscape 1536x1024 dimensions. No new subjects.

### model

Extract only the adult woman in white linen dress from this photograph as a transparent PNG cutout. Preserve exact identity, pose, dress, size and position on original full landscape 1536x1024 canvas. All surroundings including ground, shadows, sea, objects must be fully transparent alpha. Do not crop or recenter. Clean detailed hair edges, preserve feet. No painted checkerboard.

### skincare

Extract only the foreground right stone cylindrical pedestal and all skincare bottles perfume and towel resting on it as one transparent PNG cutout. Preserve exact size and position on the original landscape 1536x1024 canvas (pedestal touches right edge). Remove woman and all surroundings to fully transparent alpha. Do not crop or recenter. No painted checkerboard.

