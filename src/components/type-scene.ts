import {
  ACESFilmicToneMapping, Color, DirectionalLight, ExtrudeGeometry, Group,
  Mesh, MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera,
  PMREMGenerator, Scene, WebGLRenderer,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import outlines from "./sat-outlines.json";

// Outlines are from the locally licensed Mona Sans at weight 880, width 112.
export function mountType(host: HTMLDivElement) {
  const cover = host.closest("section")!;
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.setClearColor(0, 0);
  const scene = new Scene();
  const room = new RoomEnvironment();
  const generator = new PMREMGenerator(renderer);
  const env = generator.fromScene(room, .025);
  scene.environment = env.texture;
  room.dispose();
  generator.dispose();
  const camera = new PerspectiveCamera(32, 1, .1, 60);
  camera.position.z = 6;
  const enamel = new MeshPhysicalMaterial({ color: 0xf03210, metalness: .67, roughness: .23, clearcoat: 1, clearcoatRoughness: .12 });
  const edge = new MeshStandardMaterial({ color: 0xf2c0a4, metalness: 1, roughness: .16 });
  const key = new DirectionalLight(new Color("#fff1e0"), 3);
  key.position.set(-2, 3, 4);
  scene.add(key);
  const group = new Group();
  scene.add(group);
  const loader = new SVGLoader();
  const letters = outlines.map(path => {
    const [outline] = loader.parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + path + '"/></svg>').paths;
    const geometry = new ExtrudeGeometry(SVGLoader.createShapes(outline), {
      depth: 125, bevelThickness: 21, bevelSize: 18, bevelSegments: 5, curveSegments: 16,
    });
    geometry.center();
    geometry.scale(.002, .002, .002);
    geometry.rotateX(Math.PI);
    const mesh = new Mesh(geometry, [enamel, edge]);
    group.add(mesh);
    return mesh;
  });
  host.append(renderer.domElement);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0, visible = true, pointerX = 0, pointerY = 0, x = 0, y = 0;
  const start = performance.now();
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  function draw(now: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    const still = motion.matches || document.documentElement.classList.contains("reduce-motion");
    const narrow = host.clientWidth < 650;
    const scroll = still ? 0 : clamp(-cover.getBoundingClientRect().top / Math.max(320, cover.clientHeight * .8));
    x += ((still ? 0 : pointerX) - x) * .14;
    y += ((still ? 0 : pointerY) - y) * .14;
    const elapsed = now - start;
    group.rotation.set(-.12 + y * .065 - scroll * .19, -.15 + x * .13 + scroll * .35, (narrow ? .14 : .055) + scroll * .07);
    const span = narrow ? 3.45 : 4.8;
    const frustumHeight = 2 * camera.position.z * Math.tan(camera.fov * Math.PI / 360);
    const fit = Math.min(frustumHeight * camera.aspect / span, frustumHeight / (narrow ? 4.3 : 1.95));
    group.scale.setScalar(fit * .90 * (1 + scroll * .45));
    letters.forEach((letter, i) => {
      const t = still ? 1 : clamp((elapsed - i * 85) / 1220);
      const arrive = (1 - t) ** 3;
      const side = i - 1;
      letter.position.set(side * (narrow ? .91 : 1.56) + side * (scroll * 1.3 + arrive * .46),
        side * (narrow ? .94 : .025) + arrive * (.9 - i * .35) + scroll * (i === 1 ? .65 : -.36),
        side * .08 + scroll * side * .65);
      letter.rotation.set(arrive * .9 + scroll * side * .43, -arrive * 1.35 + scroll * (i - 1.2) * .94,
        arrive * side * .18 + scroll * side * .21);
    });
    scene.environmentRotation.y = -.8 + (still ? 0 : clamp(elapsed / 2100)) * .65 + x * .15 + scroll * 1.4;
    renderer.render(scene, camera);
    host.dataset.rendered = "true";
    if (!still && (elapsed < 2120 || Math.abs(pointerX - x) + Math.abs(pointerY - y) > .002)) schedule();
  }
  function schedule() { if (!frame && visible) frame = requestAnimationFrame(draw); }
  function resize() {
    const { clientWidth: w, clientHeight: h } = host;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    schedule();
  }
  function point(e: PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const r = cover.getBoundingClientRect();
    pointerX = (e.clientX - r.left) / r.width * 2 - 1;
    pointerY = (e.clientY - r.top) / r.height * 2 - 1;
    schedule();
  }
  function reset() { pointerX = pointerY = 0; schedule(); }
  function lost() { delete host.dataset.rendered; visible = false; }
  const size = new ResizeObserver(resize);
  size.observe(host);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && !renderer.getContext().isContextLost(); schedule(); });
  observer.observe(cover);
  const preferences = new MutationObserver(schedule);
  preferences.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  resize();
  cover.addEventListener("pointermove", point);
  cover.addEventListener("pointerleave", reset);
  window.addEventListener("scroll", schedule, { passive: true });
  document.addEventListener("visibilitychange", schedule);
  motion.addEventListener("change", schedule);
  renderer.domElement.addEventListener("webglcontextlost", lost);
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect(); size.disconnect(); preferences.disconnect();
    cover.removeEventListener("pointermove", point);
    cover.removeEventListener("pointerleave", reset);
    window.removeEventListener("scroll", schedule);
    document.removeEventListener("visibilitychange", schedule);
    motion.removeEventListener("change", schedule);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    letters.forEach(m => m.geometry.dispose());
    enamel.dispose(); edge.dispose(); env.dispose(); renderer.dispose();
    renderer.domElement.remove(); delete host.dataset.rendered;
  };
}
