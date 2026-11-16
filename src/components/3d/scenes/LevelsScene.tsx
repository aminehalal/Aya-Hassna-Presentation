import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSceneSettings, type SceneProps } from '../sceneSettings';
import { smooth, useDisposable, useTweenedValue } from '../utils';
import { Glow, makeLineMaterial } from './common';

interface Layer {
  y: number;
  radius: number;
  nodes: THREE.Vector3[];
  color: string;
}

function ringOf(count: number, radius: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + offset;
    return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  });
}

const LAYERS: Layer[] = [
  { y: 1.75, radius: 0.85, nodes: [new THREE.Vector3()], color: '#7fd4ff' },
  { y: 0.15, radius: 1.65, nodes: [new THREE.Vector3(), ...ringOf(7, 1.1)], color: '#6a9bff' },
  { y: -1.55, radius: 2.6, nodes: [...ringOf(6, 0.85), ...ringOf(12, 1.6, 0.2), ...ringOf(18, 2.25, 0.1)], color: '#8f7bff' },
];

const WARM = new THREE.Color('#ffb86b');

/**
 * Scene 04 — "Les strates": individual, group and organisation as three
 * stacked layers, revealed one by one; then the two rhythms of change:
 * small regular steps (incremental) versus a full reconfiguration
 * (transformational).
 */
export function LevelsScene({ step }: SceneProps) {
  const { reducedMotion } = useSceneSettings();
  const layerRefs = useRef<(THREE.Group | null)[]>([]);
  const whole = useRef<THREE.Group>(null);
  const wave = useRef<THREE.Mesh>(null);
  const shown = [
    useTweenedValue(1, { from: 0, duration: 1.4, delay: 0.3 }),
    useTweenedValue(step >= 1 ? 1 : 0, { duration: 1.4 }),
    useTweenedValue(step >= 2 ? 1 : 0, { duration: 1.4 }),
  ];
  const incremental = useTweenedValue(step === 3 ? 1 : 0, { duration: 0.8 });
  const transform = useTweenedValue(step >= 4 ? 1 : 0, { duration: 2.2, ease: 'power3.inOut' });
  const tick = useRef({ angle: 0 });

  const discGeos = useDisposable(() => LAYERS.map((l) => new THREE.CylinderGeometry(l.radius, l.radius, 0.05, 72)));
  const discMats = useDisposable(() =>
    LAYERS.map(
      (l) =>
        new THREE.MeshStandardMaterial({
          color: l.color,
          emissive: l.color,
          emissiveIntensity: 0.12,
          transparent: true,
          opacity: 0.2,
          roughness: 0.2,
          metalness: 0.4,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
    ),
  );
  const nodeGeo = useDisposable(() => new THREE.SphereGeometry(1, 16, 16));
  const nodeMats = useDisposable(() =>
    LAYERS.map((l) => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: l.color, emissiveIntensity: 1.2, transparent: true })),
  );
  const ringMats = useDisposable(() => LAYERS.map((l) => new THREE.MeshBasicMaterial({ color: l.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));

  // Vertical links: the individual inside the group, the group inside the organisation
  const links = useMemo(() => {
    const pairs: [number, number, number, number][] = []; // [layerA, nodeA, layerB, nodeB]
    LAYERS[1].nodes.forEach((_, i) => pairs.push([0, 0, 1, i]));
    LAYERS[1].nodes.forEach((_, i) => pairs.push([1, i, 2, (i * 5) % LAYERS[2].nodes.length]));
    return pairs;
  }, []);
  const linkGeo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(links.length * 6), 3));
    return g;
  });
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const linkMat = useDisposable(() => makeLineMaterial('#9fc2ff', 0));
  const nodeScale = useMemo(() => [0.2, 0.11, 0.075], []);

  useFrame((state, dt) => {
    const speed = reducedMotion ? 0.3 : 1;
    const t = state.clock.elapsedTime;
    const T = smooth(transform.value);
    const inc = incremental.value;

    // Incremental rhythm: the stack advances by small regular clicks.
    const stepped = Math.floor(t / 1.3) * 0.26 + smooth((t % 1.3) / 0.35) * 0.26;
    tick.current.angle = THREE.MathUtils.damp(tick.current.angle, inc > 0.5 ? stepped : tick.current.angle + dt * 0.05 * speed, 6, dt);

    LAYERS.forEach((layer, i) => {
      const g = layerRefs.current[i];
      if (!g) return;
      const s = smooth(shown[i].value);
      const spread = 1 + T * 0.22;
      g.position.y = layer.y * spread - (1 - s) * 1.6 + T * Math.sin(t * 0.8 + i) * 0.12;
      g.scale.setScalar(0.4 + 0.6 * s + T * (i === 2 ? -0.06 : 0.05));
      g.rotation.y = tick.current.angle * (i % 2 === 0 ? 1 : -1) + T * (i - 1) * 0.9;
      g.rotation.x = T * (i - 1) * 0.35;
      g.rotation.z = T * (1 - i) * 0.2;
      g.visible = s > 0.01;
      discMats[i].opacity = 0.18 * s;
      discMats[i].color.set(layer.color).lerp(WARM, T * 0.7);
      discMats[i].emissive.set(layer.color).lerp(WARM, T * 0.7);
      nodeMats[i].opacity = s;
      ringMats[i].opacity = 0.6 * s;
      nodeMats[i].emissive.set(layer.color).lerp(WARM, T * 0.85);
      ringMats[i].color.set(layer.color).lerp(WARM, T * 0.85);
    });
    // Links follow the layers (computed in the parent space of the stack)
    const lp = linkGeo.attributes.position.array as Float32Array;
    links.forEach(([la, na, lb, nb], k) => {
      const ga = layerRefs.current[la];
      const gb = layerRefs.current[lb];
      if (!ga || !gb) return;
      ga.updateMatrix();
      gb.updateMatrix();
      const a = LAYERS[la].nodes[na];
      const b = LAYERS[lb].nodes[nb];
      tmpA.set(a.x, 0.08, a.z).applyMatrix4(ga.matrix);
      tmpB.set(b.x, 0.08, b.z).applyMatrix4(gb.matrix);
      lp.set([tmpA.x, tmpA.y, tmpA.z, tmpB.x, tmpB.y, tmpB.z], k * 6);
    });
    linkGeo.attributes.position.needsUpdate = true;
    linkGeo.computeBoundingSphere();
    linkMat.opacity = smooth(shown[2].value) * 0.4 * (1 - T * 0.6);

    if (wave.current) {
      const w = (t * 0.6) % 1;
      wave.current.scale.setScalar(0.5 + w * 4.5);
      (wave.current.material as THREE.MeshBasicMaterial).opacity = T * (1 - w) * 0.5;
    }
    if (whole.current) whole.current.rotation.y += dt * 0.03 * speed * (1 - inc);
  });

  return (
    <group position={[3.6, 0, 0]}>
      <Glow color="#4d6bff" size={8} opacity={0.18} />
      <group ref={whole}>
        {LAYERS.map((layer, i) => (
          <group key={layer.y} ref={(el) => void (layerRefs.current[i] = el)}>
            <mesh geometry={discGeos[i]} material={discMats[i]} />
            <mesh rotation={[Math.PI / 2, 0, 0]} material={ringMats[i]}>
              <torusGeometry args={[layer.radius, 0.016, 6, 120]} />
            </mesh>
            {layer.nodes.map((n, k) => (
              <mesh key={k} geometry={nodeGeo} material={nodeMats[i]} position={[n.x, 0.08, n.z]} scale={nodeScale[i]} />
            ))}
          </group>
        ))}
        <lineSegments geometry={linkGeo} material={linkMat} />
      </group>
      <mesh ref={wave} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.012, 6, 120]} />
        <meshBasicMaterial color="#ffb86b" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
