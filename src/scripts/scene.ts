import * as THREE from 'three';

export function mountScene(host: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: window.innerWidth > 640, alpha: true, powerPreference: 'low-power' }); } catch { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 641 ? 1.3 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(host.clientWidth, host.clientHeight);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, host.clientWidth / host.clientHeight, .1, 100);
  camera.position.set(0, 0, 10.8);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9f9183, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 4.2); key.position.set(-3, 5, 7); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe9d2, 1.4); fill.position.set(5, -2, 3); scene.add(fill);
  const group = new THREE.Group(); scene.add(group);
  // Six adjacent, closed ribbon surfaces follow one softly twisted loop.
  const colors = ['#e87d70','#edac5d','#e6cf73','#89ac94','#88a8cd','#b09bc8'];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  colors.forEach((color, band) => {
    const vertices: number[] = [], indices: number[] = [];
    const segments = window.innerWidth < 641 ? 150 : 240;
    for (let j = 0; j <= segments; j++) {
      const t = j / segments * Math.PI * 2;
      const center = new THREE.Vector3(1.8 * Math.cos(t), 2.02 * Math.sin(t), .43 * Math.sin(t * 2));
      const outward = new THREE.Vector3(Math.cos(t), Math.sin(t), 0);
      const twist = .72 * Math.sin(t) + .42;
      const width = outward.multiplyScalar(Math.cos(twist)).add(new THREE.Vector3(0, 0, Math.sin(twist)));
      for (let edge = 0; edge < 2; edge++) {
        const offset = -.78 + (band + edge * .96) * .26;
        const point = center.clone().addScaledVector(width, offset);
        vertices.push(point.x, point.y, point.z);
      }
      if (j < segments) { const k = j * 2; indices.push(k,k+1,k+2,k+1,k+3,k+2); }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals(); geometries.push(geometry);
    const material = new THREE.MeshPhysicalMaterial({ color, metalness: .08, roughness: .32, side: THREE.DoubleSide, clearcoat: .25, clearcoatRoughness: .4 });
    materials.push(material); group.add(new THREE.Mesh(geometry, material));
  });
  group.rotation.set(.2, -.38, -.52);
  let inView = false, disposed = false;
  const pointer = new THREE.Vector2();
  const fine = window.matchMedia('(pointer: fine)');
  const start = performance.now();
  const frame = (now: number) => {
    const t = (now - start) * .00015;
    group.rotation.y = -.38 + Math.sin(t) * .32 + pointer.x * .1;
    group.rotation.x = .2 + Math.cos(t * .8) * .1 - pointer.y * .07;
    group.rotation.z = -.52 + Math.sin(t * .6) * .055;
    group.position.y = Math.sin(t * 1.6) * .065;
    renderer.render(scene, camera);
  };
  const updateLoop = () => {
    if (disposed) return;
    renderer.setAnimationLoop(inView && !document.hidden && !reduced.matches ? frame : null);
  };
  const visibility = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; updateLoop(); }, { threshold: 0 });
  visibility.observe(host);
  const resize = new ResizeObserver(() => {
    if (disposed || !host.clientWidth || !host.clientHeight) return;
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix();
    if (!document.hidden) frame(performance.now());
  });
  resize.observe(host);
  const move = (e: PointerEvent) => { if (!fine.matches) return; const box = host.getBoundingClientRect(); pointer.set((e.clientX - box.left)/box.width-.5,(e.clientY-box.top)/box.height-.5); };
  const leave = () => pointer.set(0,0);
  host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', updateLoop);
  const cleanup = () => {
    if (disposed) return; disposed = true; renderer.setAnimationLoop(null);
    visibility.disconnect(); resize.disconnect(); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose();
    renderer.domElement.remove(); host.classList.remove('is-ready');
    host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave);
    document.removeEventListener('visibilitychange', updateLoop); reduced.removeEventListener('change', onMotion);
    window.removeEventListener('pagehide', pageHide);
  };
  const onMotion = () => { if (reduced.matches) cleanup(); };
  const pageHide = (e: PageTransitionEvent) => { if (!e.persisted) cleanup(); };
  reduced.addEventListener('change', onMotion); window.addEventListener('pagehide', pageHide);
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); cleanup(); }, { once: true });
  try { frame(performance.now()); host.classList.add('is-ready'); } catch { cleanup(); }
  return cleanup;
}
