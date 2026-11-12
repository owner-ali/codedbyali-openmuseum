import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useArtTexture } from './artTexture';
import usePointer from './usePointer';
import { mulberry32 } from '../../lib/seed';

// ---------------------------------------------------------------------------
// Virtual museum hall. Artwork hangs on both long walls; the camera glides from
// one artwork to the next. Lights are kept to a minimum so phones stay smooth:
// artwork uses emissive maps, so it is visible without per-artwork lights.
// ---------------------------------------------------------------------------
const SPACING = 3.6;
const HALL_W = 10;
const WALL_X = HALL_W / 2;
const H = 4.4;
const ART_Y = 1.95;
const FRAME_W = 2.3;
const FRAME_H = 2.9;
const ENTRY_Z = 6.5;

const sideOf = (i) => (i % 2 === 0 ? -1 : 1);
const zOf = (i) => -i * SPACING;

function station(i, aspect) {
  const side = sideOf(i);
  const dist = aspect < 0.8 ? 6.3 : aspect < 1.3 ? 5.1 : 4.3;
  return { side, z: zOf(i), cx: side * (WALL_X - dist), lx: side * WALL_X };
}

function canvasTexture(draw, w, h, rx, ry) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function Hall({ count, palette, low }) {
  const zEnd = zOf(count - 1) - 5;
  const len = ENTRY_Z - zEnd;
  const zc = (ENTRY_Z + zEnd) / 2;

  const wallTex = useMemo(
    () =>
      canvasTexture(
        (ctx, w, h) => {
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, '#15151f');
          g.addColorStop(1, '#0b0b12');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(0, 0, 3, h);
          ctx.fillRect(0, h - 40, w, 3);
        },
        256,
        256,
        len / 3.6,
        1,
      ),
    [len],
  );
  const floorTex = useMemo(
    () =>
      canvasTexture(
        (ctx, w, h) => {
          ctx.fillStyle = '#0a0a10';
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 2;
          ctx.strokeRect(0, 0, w, h);
        },
        256,
        256,
        HALL_W / 2,
        len / 2,
      ),
    [len],
  );

  useEffect(
    () => () => {
      wallTex.dispose();
      floorTex.dispose();
    },
    [wallTex, floorTex],
  );

  const accent = palette[0];
  const accent2 = palette[1];

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zc]}>
        <planeGeometry args={[HALL_W, len]} />
        <meshStandardMaterial map={floorTex} color="#ffffff" roughness={0.22} metalness={0.55} />
      </mesh>
      {/* centre light strip in floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, zc]}>
        <planeGeometry args={[0.05, len]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, zc]}>
        <planeGeometry args={[HALL_W, len]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.9} />
      </mesh>
      {/* side walls */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-WALL_X, H / 2, zc]}>
        <planeGeometry args={[len, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.85} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[WALL_X, H / 2, zc]}>
        <planeGeometry args={[len, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.85} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, H / 2, zEnd]}>
        <planeGeometry args={[HALL_W, H]} />
        <meshStandardMaterial color="#0d0d15" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.9, zEnd + 0.05]}>
        <planeGeometry args={[0.05, 3.4]} />
        <meshBasicMaterial color={accent2} toneMapped={false} />
      </mesh>

      {/* entrance portal */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 3.4, H / 2, ENTRY_Z]}>
            <boxGeometry args={[3.2, H, 0.5]} />
            <meshStandardMaterial color="#0d0d15" roughness={0.8} />
          </mesh>
          <mesh position={[s * 1.8, 1.8, ENTRY_Z + 0.1]}>
            <cylinderGeometry args={[0.16, 0.16, 3.6, low ? 16 : 32]} />
            <meshStandardMaterial color="#d8d4e2" roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.2 + (H - 3.2) / 2, ENTRY_Z]}>
        <boxGeometry args={[3.6, H - 3.2, 0.5]} />
        <meshStandardMaterial color="#0d0d15" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.2, ENTRY_Z - 0.27]}>
        <boxGeometry args={[3.6, 0.04, 0.04]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>

      {/* ceiling light strips and beams */}
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[0, H - 0.05, zOf(i)]}>
          <mesh>
            <boxGeometry args={[3.2, 0.05, 0.22]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.12, 1.8]}>
            <boxGeometry args={[HALL_W, 0.2, 0.14]} />
            <meshStandardMaterial color="#12121a" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* benches */}
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[0, 0.25, zOf(i) - SPACING / 2]}>
          <boxGeometry args={[1.8, 0.5, 0.55]} />
          <meshStandardMaterial color="#17171f" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function ArtFrame({ art, i, active, onSelect, onInspect }) {
  const tex = useArtTexture(art);
  const side = sideOf(i);
  return (
    <group position={[side * (WALL_X - 0.08), ART_Y, zOf(i)]} rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[FRAME_W + 0.28, FRAME_H + 0.28, 0.1]} />
        <meshStandardMaterial color="#14141c" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.09]}>
        <planeGeometry args={[FRAME_W + 0.7, FRAME_H + 0.7]} />
        <meshBasicMaterial color={active ? '#00e5ff' : '#a855f7'} transparent opacity={active ? 0.22 : 0.07} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh
        position={[0, 0, 0.04]}
        onClick={(e) => {
          e.stopPropagation();
          if (active) onInspect(art);
          else onSelect(i);
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshStandardMaterial
          map={tex || null}
          color={tex ? '#ffffff' : '#20202a'}
          emissive="#ffffff"
          emissiveMap={tex || null}
          emissiveIntensity={tex ? (active ? 0.6 : 0.32) : 0}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, -FRAME_H / 2 - 0.5, 0.03]}>
        <boxGeometry args={[0.9, 0.14, 0.02]} />
        <meshStandardMaterial color="#1b1b25" metalness={0.8} roughness={0.3} />
      </mesh>
      {active && (
        <Html position={[0, 0, 0.12]} center zIndexRange={[20, 0]}>
          <button
            type="button"
            onClick={() => onInspect(art)}
            aria-label={`Inspect ${art.title}`}
            className="relative flex h-12 w-12 items-center justify-center"
          >
            <span className="absolute inset-0 animate-pulseRing rounded-full border border-neon" />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-lg font-bold leading-none text-neon backdrop-blur">+</span>
          </button>
        </Html>
      )}
    </group>
  );
}

function Rig({ index, pointer, reduced }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 1.8, 2));
  const init = useRef(false);

  useFrame((state, dt) => {
    const aspect = size.width / size.height;
    const s = station(index, aspect);
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    if (!init.current) {
      camera.position.set(0, 1.7, reduced ? s.z + 4 : ENTRY_Z + 5);
      init.current = true;
    }
    const sway = reduced ? 0 : Math.sin(t * 0.5) * 0.03;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, s.cx + p.x * 0.25, 2.2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.7 + sway + p.y * 0.12, 2.2, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, s.z, 2.2, dt);
    look.current.x = THREE.MathUtils.damp(look.current.x, s.lx, 3, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, ART_Y - 0.1 + p.y * 0.5, 3, dt);
    look.current.z = THREE.MathUtils.damp(look.current.z, s.z + p.x * 1.4 * -s.side, 3, dt);
    camera.lookAt(look.current);
  });
  return null;
}

function Lights({ index, palette }) {
  const cyan = useRef();
  const purple = useRef();
  const warm = useRef();
  useFrame((state, dt) => {
    const cam = state.camera.position;
    const s = station(index, 1.5);
    if (cyan.current) cyan.current.position.set(cam.x - 3, 3, cam.z - 1);
    if (purple.current) purple.current.position.set(cam.x + 3, 3, cam.z - 1);
    if (warm.current) {
      warm.current.position.x = THREE.MathUtils.damp(warm.current.position.x, s.side * (WALL_X - 1.8), 3, dt);
      warm.current.position.z = THREE.MathUtils.damp(warm.current.position.z, s.z, 3, dt);
    }
  });
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#bfd8ff', '#1a1030', 0.4]} />
      <pointLight ref={cyan} color={palette[0]} intensity={26} distance={14} decay={2} />
      <pointLight ref={purple} color={palette[1]} intensity={26} distance={14} decay={2} />
      <pointLight ref={warm} position={[0, 3.4, 0]} color="#fff2e0" intensity={55} distance={10} decay={2} />
    </>
  );
}

function Dust({ count, len }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const rng = mulberry32(5);
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (rng() - 0.5) * (HALL_W - 1);
      a[i * 3 + 1] = rng() * (H - 0.5);
      a[i * 3 + 2] = ENTRY_Z - rng() * len;
    }
    return a;
  }, [count, len]);
  useFrame((s) => {
    if (ref.current) ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.15) * 0.1;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#cfefff" transparent opacity={0.5} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function MuseumScene({ works, room, index, onSelect, onInspect, quality = 'high', reduced = false, active = true }) {
  const pointer = usePointer();
  const low = quality === 'low';
  const len = ENTRY_Z - (zOf(works.length - 1) - 5);

  return (
    <Canvas
      dpr={low ? [1, 1.5] : [1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 55, near: 0.1, far: 60, position: [0, 1.7, ENTRY_Z + 5] }}
      gl={{ antialias: !low, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
      aria-label={`3D gallery: ${room.name}`}
    >
      <color attach="background" args={['#07070a']} />
      <fog attach="fog" args={['#07070a', 9, low ? 24 : 34]} />
      <Rig index={index} pointer={pointer} reduced={reduced} />
      <Lights index={index} palette={room.palette} />
      <Hall count={works.length} palette={room.palette} low={low} />
      {works.map((art, i) => (
        <ArtFrame key={art.id} art={art} i={i} active={i === index} onSelect={onSelect} onInspect={onInspect} />
      ))}
      <Dust count={low ? 40 : 120} len={len} />
    </Canvas>
  );
}
