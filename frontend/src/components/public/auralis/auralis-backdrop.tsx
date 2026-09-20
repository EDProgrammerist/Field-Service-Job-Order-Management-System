import { useEffect, useRef } from "react";
import type { PlaneGeometry, ShaderMaterial, WebGLRenderer } from "three";

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;

  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );

    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);

    vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0)
    );

    vec3 m = max(
      0.5 - vec3(
        dot(x0, x0),
        dot(x12.xy, x12.xy),
        dot(x12.zw, x12.zw)
      ),
      0.0
    );

    m = m * m;
    m = m * m;

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159
      - 0.85373472095314 * (a0 * a0 + h * h);

    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;

    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    float n = snoise(
      uv * 2.5 + vec2(u_time * 0.4, u_time * 0.5)
    );
    float n2 = snoise(
      uv * 1.5 - vec2(u_time * 0.3, u_time * 0.2)
    );

    vec3 colorIndigo = vec3(0.31, 0.27, 0.90);
    vec3 colorCyan = vec3(0.02, 0.71, 0.83);
    vec3 colorDeep = vec3(0.15, 0.10, 0.50);

    float mixVal = smoothstep(-0.6, 0.8, n);
    vec3 finalColor = mix(colorDeep, colorIndigo, mixVal);

    float mixVal2 = smoothstep(-0.4, 0.9, n2);
    finalColor = mix(finalColor, colorCyan, mixVal2 * 0.8);

    float alphaFade = smoothstep(-0.2, 0.6, uv.x);
    gl_FragColor = vec4(finalColor, alphaFade);
  }
`;

export function AuralisBackdrop() {
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let canvas: HTMLCanvasElement | null = null;
    let renderer: WebGLRenderer | null = null;
    let geometry: PlaneGeometry | null = null;
    let material: ShaderMaterial | null = null;
    let frame: number | null = null;
    let resize: (() => void) | null = null;
    let handleVisibility: (() => void) | null = null;
    let startVersion = 0;

    const stop = () => {
      startVersion += 1;

      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }

      if (resize) window.removeEventListener("resize", resize);
      if (handleVisibility) {
        document.removeEventListener("visibilitychange", handleVisibility);
      }

      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      canvas?.remove();

      canvas = null;
      renderer = null;
      geometry = null;
      material = null;
      resize = null;
      handleVisibility = null;
    };

    const start = async () => {
      if (reducedMotion.matches) return;

      const version = ++startVersion;

      try {
        const {
          Mesh,
          OrthographicCamera,
          PlaneGeometry,
          Scene,
          ShaderMaterial,
          Vector2,
          WebGLRenderer,
        } = await import("three");

        if (
          version !== startVersion ||
          reducedMotion.matches ||
          !host.isConnected
        ) {
          return;
        }

        const nextCanvas = document.createElement("canvas");
        nextCanvas.className = "auralis-backdrop__canvas";
        host.appendChild(nextCanvas);
        canvas = nextCanvas;

        const nextRenderer = new WebGLRenderer({
          canvas: nextCanvas,
          alpha: true,
          antialias: true,
        });
        renderer = nextRenderer;

        const scene = new Scene();
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const nextGeometry = new PlaneGeometry(2, 2);
        geometry = nextGeometry;

        const resolution = new Vector2(1, 1);
        const nextMaterial = new ShaderMaterial({
          uniforms: {
            u_time: { value: 0 },
            u_resolution: { value: resolution },
          },
          vertexShader,
          fragmentShader,
          transparent: true,
        });
        material = nextMaterial;

        scene.add(new Mesh(nextGeometry, nextMaterial));

        resize = () => {
          const bounds = host.getBoundingClientRect();
          const width = Math.max(1, Math.round(bounds.width));
          const height = Math.max(1, Math.round(bounds.height));

          nextRenderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2),
          );
          nextRenderer.setSize(width, height, false);
          nextRenderer.getDrawingBufferSize(resolution);
        };

        window.addEventListener("resize", resize);
        resize();

        const animate = (time: number) => {
          nextMaterial.uniforms.u_time.value = time * 0.002;
          nextRenderer.render(scene, camera);
          frame = requestAnimationFrame(animate);
        };

        handleVisibility = () => {
          if (document.hidden && frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
          } else if (!document.hidden && frame === null) {
            frame = requestAnimationFrame(animate);
          }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        if (!document.hidden) frame = requestAnimationFrame(animate);
      } catch {
        // The CSS gradient remains visible if loading or WebGL fails.
        if (version === startVersion) stop();
      }
    };

    const handleMotionChange = () => {
      stop();
      start();
    };

    reducedMotion.addEventListener("change", handleMotionChange);
    start();

    return () => {
      reducedMotion.removeEventListener("change", handleMotionChange);
      stop();
    };
  }, []);

  return (
    <div className="auralis-backdrop" aria-hidden="true">
      <div ref={canvasHostRef} className="auralis-backdrop__host" />
      <div className="auralis-backdrop__slices">
        <div className="auralis-backdrop__slice" />
        <div className="auralis-backdrop__slice" />
        <div className="auralis-backdrop__slice" />
        <div className="auralis-backdrop__slice" />
        <div className="auralis-backdrop__slice" />
      </div>
    </div>
  );
}