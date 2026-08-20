// 发光网格线着色器
export const glowLineVertex = `
  uniform vec3 uLightPos;
  uniform float uGlowRadius;
  uniform float uGlowIntensity;
  uniform float uBaseOpacity;

  varying float vGlow;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float dist = distance(worldPos.xyz, uLightPos);
    float proximity = 1.0 - smoothstep(0.0, uGlowRadius, dist);
    vGlow = uBaseOpacity + pow(proximity, 2.0) * uGlowIntensity;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const glowLineFragment = `
  uniform vec3 uLightColor;
  varying float vGlow;

  void main() {
    vec3 color = mix(vec3(1.0), uLightColor, smoothstep(0.08, 0.6, vGlow));
    gl_FragColor = vec4(color, vGlow);
  }
`;

// 玻璃球体着色器
export const glassSphereVertex = `
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const glassSphereFragment = `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorld);
    vec3 n = gl_FrontFacing ? normalize(vNormal) : -normalize(vNormal);
    float NdotV = max(dot(n, viewDir), 0.0);
    float fresnel = pow(1.0 - NdotV, 2.5);
    float alpha = 0.008 + fresnel * 0.24;
    // 背面降低透明度，避免侧视角出现叠加过亮。
    if (!gl_FrontFacing) alpha *= 0.3;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// 灯光手柄球体着色器
export const lightHandleVertex = `
  uniform vec3 uBeamDir;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vBeamFace;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    vec3 worldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vBeamFace = max(dot(worldNormal, uBeamDir), 0.0);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const lightHandleFragment = `
  uniform vec3 uBeamColor;
  uniform vec3 uBeamDir;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vBeamFace;
  void main() {
    vec3 baseColor = vec3(0.02, 0.02, 0.02);
    float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.5);
    vec3 rimLight = vec3(0.4) * fresnel * 0.15;
    float beamGlow = pow(vBeamFace, 5.0) * 3.0;
    vec3 beamContrib = uBeamColor * beamGlow;
    vec3 finalColor = baseColor + rimLight + beamContrib;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// 灯光手柄光晕圆片着色器
export const glowDiscVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glowDiscFragment = `
  uniform vec3 uBeamColor;
  varying vec2 vUv;
  void main() {
    float dist = distance(vUv, vec2(0.5));
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 1.8);
    vec3 color = uBeamColor * 1.5;
    gl_FragColor = vec4(color, glow * 0.7);
  }
`;

// 光束锥体着色器
export const beamVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const beamFragment = `
  uniform vec3 color;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float openAtSource = smoothstep(0.02, 0.16, vUv.y);
    float fadeToImage = 1.0 - smoothstep(0.25, 0.98, vUv.y);
    float sourceHotspot = 1.0 - smoothstep(0.0, 0.22, vUv.y);
    float beam = openAtSource * (0.035 + fadeToImage * 0.54 + sourceHotspot * 0.46);
    gl_FragColor = vec4(color, beam * uIntensity);
  }
`;

// 照片平面着色器
export const photoPlaneVertex = `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const photoPlaneFragment = `
  uniform sampler2D uMap;
  uniform vec3 uLight;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vec3 tex = texture2D(uMap, vUv).rgb;
    vec3 toLight = normalize(uLight - vWorld);
    float lambert = clamp(dot(toLight, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    vec2 lightUv = vec2(0.5 - uLight.x * 0.16, 0.52 + uLight.y * 0.18);
    float spot = 1.0 - smoothstep(0.0, 0.78, distance(vUv, lightUv));
    float sweep = smoothstep(-2.35, 2.35, uLight.x) * (1.0 - vUv.x) + (1.0 - smoothstep(-2.35, 2.35, uLight.x)) * vUv.x;
    vec3 lit = tex * (0.58 + lambert * 0.52 + spot * 0.82 + sweep * 0.18);
    vec3 coolShadow = vec3(0.035, 0.045, 0.05) * (1.0 - spot) * 0.45;
    gl_FragColor = vec4(lit + coolShadow, 1.0);
  }
`;
