import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { mulberry32 } from '../../lib/seed';

// ---------------------------------------------------------------------------
// Original procedural marble bust. No external model, texture or licence needed.
// Tweak LIGHTS below to change the cyan / purple mood.
// ---------------------------------------------------------------------------
const LIGHTS = {
  cyan: { color: '#00e5ff', intensity: 85 },
  purple: { color: '#b45cff', intensity: 85 },
  rim: { color: '#c9b8ff', intensity: 60 },
  key: { color: '#fff4e6', intensity: 22 }, // soft warm-white fill so the stone reads as marble, not tinted plastic
  ambient: 0.16,
};

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const gauss = (x, s) => Math.exp(-(x * x) / (s * s));

// Sculpts a unit sphere into a classical head: brow, nose, cheekbones, lips, jaw and chin.
function createHeadGeometry(seg) {
  const geo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let { x, y, z } = v;
    const front = smooth(0.0, 0.5, z);

    const jaw = smooth(-0.15, -0.95, y);
    x *= 1 - 0.32 * jaw;
    z *= 1 - 0.1 * jaw;

    z += 0.1 * gauss(y + 0.82, 0.18) * front; // chin
    z += 0.07 * gauss(y - 0.22, 0.1) * front; // brow ridge
    z += 0.05 * gauss(y + 0.02, 0.14) * gauss(Math.abs(x) - 0.5, 0.16) * front; // cheekbones
    z -= 0.075 * gauss(Math.abs(x) - 0.34, 0.15) * gauss(y - 0.1, 0.09) * front; // eye sockets

    const bridge = smooth(-0.4, -0.15, y) * (1 - smooth(0.1, 0.25, y));
    z += 0.16 * gauss(x, 0.085) * bridge; // nose
    z += 0.05 * gauss(x, 0.11) * gauss(y + 0.3, 0.07) * front; // nose tip
    z += 0.04 * gauss(Math.abs(x) - 0.13, 0.05) * gauss(y + 0.32, 0.06) * front; // nostrils
    z += 0.035 * gauss(x, 0.2) * gauss(y + 0.52, 0.05) * front; // lips
    z -= 0.02 * gauss(x, 0.2) * gauss(y + 0.565, 0.012) * front; // mouth line

    pos.setXYZ(i, x * 0.58, y * 0.74, z * 0.68);
  }
  geo.computeVertexNormals();
  return geo;
}

function createMarbleTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e4ee';
  ctx.fillRect(0, 0, size, size);
  const rng = mulberry32(7);
  for (let i = 0; i < 40; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 40 + rng() * 120;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${(200 + rng() * 30) | 0},${(196 + rng() * 30) | 0},${(210 + rng() * 30) | 0},0.35)`);
    gr.addColorStop(1, 'rgba(232,228,238,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    let x = rng() * size;
    let y = rng() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segs = 6 + ((rng() * 6) | 0);
    for (let s = 0; s < segs; s++) {
      const nx = x + (rng() - 0.5) * 160;
      const ny = y + (rng() - 0.2) * 120;
      ctx.quadraticCurveTo(x + (rng() - 0.5) * 90, y + (rng() - 0.5) * 90, nx, ny);
      x = nx;
      y = ny;
    }
    ctx.strokeStyle = `rgba(110,110,135,${0.08 + rng() * 0.18})`;
    ctx.lineWidth = 0.5 + rng() * 2;
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// Classical curls, instanced for performance.
function Hair({ count, material, shadows }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const rng = mulberry32(21);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    let placed = 0;
    let tries = 0;
    while (placed < count && tries < count * 60) {
      tries++;
      const u = rng() * 2 - 1;
      const t = rng() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const dx = r * Math.cos(t);
      const dy = u;
      const dz = r * Math.sin(t);
      const allowed = (dy > 0.45 && (dz < 0.2 || dy > 0.7)) || (dz < 0.1 && dy > -0.3);
      if (!allowed) continue;
      p.set(dx * 0.6, 0.85 + dy * 0.77, dz * 0.71);
      const sc = 0.065 + rng() * 0.06;
      s.set(sc * 1.15, sc * 0.95, sc * 1.15);
      e.set(rng() * 3, rng() * 3, rng() * 3);
      q.setFromEuler(e);
      m.compose(p, q, s);
      ref.current.setMatrixAt(placed, m);
      placed++;
    }
    ref.current.count = placed;
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={ref} args={[null, null, count]} material={material} castShadow={shadows} receiveShadow={shadows}>
      <icosahedronGeometry args={[1, 3]} />
    </instancedMesh>
  );
}

function Bust({ quality, reduced, pointer, shadows }) {
  const group = useRef();
  const low = quality === 'low';
  const headGeo = useMemo(() => createHeadGeometry(low ? 56 : 112), [low]);
  const marbleMap = useMemo(() => createMarbleTexture(), []);
  const marble = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        map: marbleMap,
        bumpMap: marbleMap,
        bumpScale: 0.6,
        roughness: 0.5,
        clearcoat: low ? 0 : 0.15,
        clearcoatRoughness: 0.3,
      }),
    [marbleMap, low],
  );

  useEffect(
    () => () => {
      headGeo.dispose();
      marbleMap.dispose();
      marble.dispose();
    },
    [headGeo, marbleMap, marble],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, p.x * 0.45 + (reduced ? 0 : Math.sin(t * 0.3) * 0.08), 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -p.y * 0.14, 3, dt);
    const intro = reduced ? 1 : Math.min(1, t / 2.2);
    const e = 1 - Math.pow(1 - intro, 3);
    g.scale.setScalar(0.92 + 0.08 * e);
  });

  const visorProps = { castShadow: shadows };

  return (
    <group ref={group}>
      <Float speed={reduced ? 0 : 1.2} rotationIntensity={reduced ? 0 : 0.12} floatIntensity={reduced ? 0 : 0.5} floatingRange={[-0.05, 0.08]}>
        <group position={[0, 0.05, 0]}>
          {/* head */}
          <mesh geometry={headGeo} material={marble} position={[0, 0.85, 0]} castShadow={shadows} receiveShadow={shadows} />
          <Hair count={low ? 70 : 170} material={marble} shadows={shadows} />
          {/* neck */}
          <mesh material={marble} position={[0, -0.1, 0]} castShadow={shadows} receiveShadow={shadows}>
            <cylinderGeometry args={[0.27, 0.34, 0.9, low ? 28 : 48]} />
          </mesh>
          {/* chest */}
          <mesh material={marble} position={[0, -0.82, 0]} scale={[1.45, 0.62, 0.78]} castShadow={shadows} receiveShadow={shadows}>
            <sphereGeometry args={[1, low ? 36 : 64, low ? 24 : 40]} />
          </mesh>

          {/* futuristic visor */}
          <group position={[0, 0.94, 0]} scale={[0.6, 1, 0.72]}>
            <mesh {...visorProps}>
              <cylinderGeometry args={[1, 1, 0.2, 48, 1, true, -1.25, 2.5]} />
              <meshStandardMaterial color="#020205" metalness={0.9} roughness={0.12} emissive="#00e5ff" emissiveIntensity={0.22} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[1.003, 1.003, 0.014, 48, 1, true, -1.25, 2.5]} />
              <meshBasicMaterial color="#00e5ff" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[1.003, 1.003, 0.014, 48, 1, true, -1.25, 2.5]} />
              <meshBasicMaterial color="#b45cff" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
          <mesh position={[0.56, 0.94, 0.225]} rotation={[0, -0.145, 0]}>
            <boxGeometry args={[0.02, 0.035, 0.56]} />
            <meshBasicMaterial color="#00e5ff" toneMapped={false} />
          </mesh>
          <mesh position={[-0.56, 0.94, 0.225]} rotation={[0, 0.145, 0]}>
            <boxGeometry args={[0.02, 0.035, 0.56]} />
            <meshBasicMaterial color="#b45cff" toneMapped={false} />
          </mesh>
        </group>
      </Float>

      {/* plinth */}
      <mesh position={[0, -1.55, 0]} receiveShadow={shadows}>
        <cylinderGeometry args={[1.25, 1.32, 0.5, 64]} />
        <meshStandardMaterial color="#0b0b10" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.012, 8, 96]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Lights({ pointer, shadows }) {
  const cyan = useRef();
  const purple = useRef();
  useFrame((_, dt) => {
    const p = pointer.current;
    if (cyan.current) {
      cyan.current.position.x = THREE.MathUtils.damp(cyan.current.position.x, -4 + p.x * 1.6, 3, dt);
      cyan.current.position.y = THREE.MathUtils.damp(cyan.current.position.y, 2.5 + p.y * 1.0, 3, dt);
    }
    if (purple.current) {
      purple.current.position.x = THREE.MathUtils.damp(purple.current.position.x, 4 + p.x * 1.6, 3, dt);
      purple.current.position.y = THREE.MathUtils.damp(purple.current.position.y, 1.5 + p.y * 1.0, 3, dt);
    }
  });
  return (
    <>
      <ambientLight intensity={LIGHTS.ambient} />
      <spotLight ref={cyan} position={[-4, 2.5, 3.5]} angle={0.7} penumbra={1} color={LIGHTS.cyan.color} intensity={LIGHTS.cyan.intensity} decay={2} castShadow={shadows} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
      <spotLight ref={purple} position={[4, 1.5, 3.5]} angle={0.7} penumbra={1} color={LIGHTS.purple.color} intensity={LIGHTS.purple.intensity} decay={2} />
      <spotLight position={[0, 3.5, -3.5]} angle={0.8} penumbra={1} color={LIGHTS.rim.color} intensity={LIGHTS.rim.intensity} decay={2} />
      <spotLight position={[0, 1.5, 7]} angle={0.6} penumbra={1} color={LIGHTS.key.color} intensity={LIGHTS.key.intensity} decay={2} />
    </>
  );
}

function Dust({ count, reduced }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const rng = mulberry32(99);
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (rng() - 0.5) * 9;
      a[i * 3 + 1] = (rng() - 0.5) * 6;
      a[i * 3 + 2] = (rng() - 0.5) * 6 - 0.5;
    }
    return a;
  }, [count]);
  useFrame((s, dt) => {
    if (reduced || !ref.current) return;
    ref.current.rotation.y += dt * 0.02;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.2) * 0.15;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#bfefff" transparent opacity={0.55} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Cinematic camera: slow dolly-in on load, then gentle pointer parallax.
function Rig({ pointer, reduced }) {
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const aspect = state.size.width / state.size.height;
    const baseZ = aspect < 0.8 ? 10 : aspect < 1.4 ? 8.6 : 7.6;
    const intro = reduced ? 1 : Math.min(1, t / 2.6);
    const e = 1 - Math.pow(1 - intro, 3);
    const p = pointer.current;
    const cam = state.camera;
    cam.position.z = baseZ + (1 - e) * 3;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, p.x * 0.35, 2.5, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 0.4 + p.y * 0.2 + (reduced ? 0 : Math.sin(t * 0.25) * 0.05), 2.5, dt);
    cam.lookAt(0, 0.1, 0);
  });
  return null;
}

function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);
  return p;
}

export default function Statue3D({ quality = 'high', active = true, reduced = false }) {
  const pointer = usePointer();
  const low = quality === 'low';
  const shadows = !low;
  return (
    <Canvas
      shadows={shadows}
      dpr={low ? [1, 1.5] : [1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 32, position: [0, 0.5, 12] }}
      gl={{ antialias: !low, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
      aria-label="Interactive 3D marble bust"
    >
      <Rig pointer={pointer} reduced={reduced} />
      <Lights pointer={pointer} shadows={shadows} />
      <Bust quality={quality} reduced={reduced} pointer={pointer} shadows={shadows} />
      <Dust count={low ? 70 : 220} reduced={reduced} />
    </Canvas>
  );
}
