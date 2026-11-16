import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { fibonacciSphere, smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeGlowPointsMaterial } from './common';

const R = 2.45;
const NODES = [
  { label: 'Changement', angle: Math.PI / 2, color: '#4f8cff' },
  { label: 'Innovation', angle: Math.PI / 2 - (Math.PI * 2) / 3, color: '#a98bff' },
  { label: 'Apprentissage', angle: Math.PI / 2 - (Math.PI * 4) / 3, color: '#3fe0c5' },
];
const nodePos = (angle: number, y = 0, r = R) => new THREE.Vector3(Math.cos(angle) * r, y, -Math.sin(angle) * r);

/** Arc on the cycle between two node angles, slightly lifted at its middle. */
function arcCurve(a0: number, a1: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    const a = a0 + (a1 - a0) * k;
    pts.push(nodePos(a, Math.sin(k * Math.PI) * 0.35, R * (1 + Math.sin(k * Math.PI) * 0.08)));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function colouredTube(curve: THREE.Curve<THREE.Vector3>, from: string, to: string, segments: number, radius: number) {
  const geo = new THREE.TubeGeometry(curve, segments, radius, 8, false);
  const uv = geo.getAttribute('uv');
  const colors = new Float32Array(uv.count * 3);
  const a = new THREE.Color(from);
  const b = new THREE.Color(to);
  const c = new THREE.Color();
  for (let i = 0; i < uv.count; i++) {
    c.copy(a).lerp(b, uv.getX(i));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

/**
 * Scene 10 — "L'écosystème": three structures (change, innovation,
 * learning) connect one arc at a time into a cycle; the cycle then opens
 * into an ascending spiral of continuous evolution.
 */
export function RelationshipScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const system = useRef<THREE.Group>(null);
  const gyro = useRef<THREE.Group>(null);
  const crystals = useRef<THREE.Group>(null);
  const brain = useRef<THREE.Points>(null);
  const pulses = useRef<THREE.Group>(null);
  const arcs = [
    useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.6, ease: 'power2.inOut' }),
    useTweenedValue(step >= 2 ? 1 : 0, { duration: 1.6, ease: 'power2.inOut' }),
    useTweenedValue(step >= 3 ? 1 : 0, { duration: 1.6, ease: 'power2.inOut' }),
  ];
  const spiral = useTweenedValue(step >= 4 ? 1 : 0, { duration: 3, ease: 'power2.inOut' });
  const appear = useTweenedValue(1, { from: 0, duration: 1.8, delay: 0.3, ease: 'power3.out' });

  const curves = useMemo(
    () => NODES.map((n, i) => arcCurve(n.angle - 0.32, NODES[(i + 1) % 3].angle + (i === 2 ? -Math.PI * 2 : 0) + 0.32)),
    [],
  );
  // Ensure every arc travels clockwise (decreasing angle)
  const arcGeos = useDisposable(() =>
    curves.map((c, i) => colouredTube(c, NODES[i].color, NODES[(i + 1) % 3].color, 96, 0.03)),
  );
  const arcMat = useDisposable(
    () => new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }),
  );

  // Ascending spiral: 2.5 turns rising above the cycle
  const spiralGeo = useDisposable(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 2.5;
    for (let i = 0; i <= 300; i++) {
      const k = i / 300;
      const a = Math.PI / 2 - k * turns * Math.PI * 2;
      pts.push(nodePos(a, k * 3.6, R * (1 + k * 0.18)));
    }
    return colouredTube(new THREE.CatmullRomCurve3(pts), '#4f8cff', '#3fe0c5', 420, 0.018);
  });
  const spiralMat = useDisposable(
    () => new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const ghostGeo = useDisposable(() => {
    const pts: THREE.Vector3[] = [];
    for (let level = 1; level <= 2; level++)
      NODES.forEach((n) => {
        const k = (level * 3 + NODES.indexOf(n)) / 7.5;
        pts.push(nodePos(n.angle, k * 3.6, R * (1 + k * 0.18)));
      });
    return new THREE.BufferGeometry().setFromPoints(pts);
  });
  const ghostMat = useDisposable(() => makeGlowPointsMaterial(0.9, 0, '#cfe6ff', false));

  const brainGeo = useDisposable(() => new THREE.BufferGeometry().setFromPoints(fibonacciSphere(220, 0.62)));
  const brainMat = useDisposable(() => makeGlowPointsMaterial(0.12, 0.95, '#7ff7e0', false));
  const crystalGeo = useDisposable(() => new THREE.OctahedronGeometry(0.2, 0));
  const crystalMat = useDisposable(
    () => new THREE.MeshStandardMaterial({ color: '#e6dcff', emissive: '#8a5cff', emissiveIntensity: 1.1, roughness: 0.15, metalness: 0.4, flatShading: true }),
  );

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime * speed;
    const sp = smooth(spiral.value);

    arcGeos.forEach((g, i) => {
      const total = g.index ? g.index.count : 0;
      const ring = 8 * 6; // indices per tubular segment
      g.setDrawRange(0, Math.floor((total / ring) * arcs[i].value) * ring);
    });
    const sTotal = spiralGeo.index ? spiralGeo.index.count : 0;
    spiralGeo.setDrawRange(0, Math.floor((sTotal / 48) * sp) * 48);
    ghostMat.opacity = sp * 0.8;

    if (gyro.current) {
      gyro.current.children[0].rotation.x += dt * 1.1 * speed;
      gyro.current.children[1].rotation.y += dt * 0.8 * speed;
      gyro.current.children[2].rotation.z -= dt * 0.5 * speed;
    }
    if (crystals.current) {
      crystals.current.rotation.y += dt * 0.6 * speed;
      crystals.current.children.forEach((c, i) => {
        c.rotation.x += dt * (0.5 + i * 0.2) * speed;
        c.position.y = Math.sin(t * 1.4 + i * 1.3) * 0.14;
      });
    }
    if (brain.current) {
      brain.current.rotation.y -= dt * 0.35 * speed;
      brain.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.04);
    }

    if (pulses.current) {
      pulses.current.children.forEach((p, i) => {
        const arc = i % 3;
        const k = (t * 0.32 + Math.floor(i / 3) * 0.5) % 1;
        curves[arc].getPoint(k, p.position);
        (p as THREE.Sprite).material.opacity = arcs[arc].value > 0.98 ? Math.sin(k * Math.PI) : 0;
      });
    }

    if (system.current) {
      const a = appear.value;
      system.current.scale.setScalar(0.6 + 0.4 * a);
      system.current.rotation.y = sp * t * 0.18 + Math.sin(t * 0.15) * 0.08 * (1 - sp);
    }
  });

  const [change, innovation, learning] = NODES.map((n) => nodePos(n.angle));

  return (
    <group position={[3.7, -0.15, 0]} rotation={[0.62, 0, 0]} scale={0.88}>
      <group ref={system}>
        <Glow color="#3567ff" size={9} opacity={0.14} />

        {/* Changement — a gyroscope: forces in motion */}
        <group position={change}>
          <Glow color="#4f8cff" size={2.6} opacity={0.6} />
          <group ref={gyro}>
            <mesh>
              <torusGeometry args={[0.55, 0.03, 10, 64]} />
              <meshStandardMaterial color="#cfe0ff" emissive="#4f8cff" emissiveIntensity={1.2} />
            </mesh>
            <mesh>
              <torusGeometry args={[0.42, 0.03, 10, 64]} />
              <meshStandardMaterial color="#cfe0ff" emissive="#2f6bff" emissiveIntensity={1.1} />
            </mesh>
            <mesh>
              <octahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial color="#ffffff" emissive="#6fa2ff" emissiveIntensity={1.4} flatShading />
            </mesh>
          </group>
        </group>

        {/* Innovation — crystals: new solutions */}
        <group position={innovation}>
          <Glow color="#a98bff" size={2.6} opacity={0.6} />
          <group ref={crystals}>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2;
              return (
                <mesh
                  key={i}
                  geometry={crystalGeo}
                  material={crystalMat}
                  position={[Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42]}
                  scale={i === 0 ? 1.4 : 1}
                />
              );
            })}
          </group>
        </group>

        {/* Apprentissage — a sphere of knowledge */}
        <group position={learning}>
          <Glow color="#3fe0c5" size={2.6} opacity={0.6} />
          <points ref={brain} geometry={brainGeo} material={brainMat} />
          <mesh>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshBasicMaterial color="#d8fff6" toneMapped={false} />
          </mesh>
        </group>

        {arcGeos.map((g, i) => (
          <mesh key={i} geometry={g} material={arcMat} />
        ))}
        <group ref={pulses}>
          {Array.from({ length: 6 }, (_, i) => (
            <Glow key={i} color="#ffffff" size={0.5} opacity={0} />
          ))}
        </group>

        <mesh geometry={spiralGeo} material={spiralMat} />
        <points geometry={ghostGeo} material={ghostMat} />
      </group>
    </group>
  );
}
