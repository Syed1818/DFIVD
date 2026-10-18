import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 1000;
const PARTICLE_POSITIONS = (() => {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  return pos;
})();

function ParticleNodes() {
  const points = useRef();

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.05;
      points.current.rotation.x -= delta * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_POSITIONS.length / 3} array={PARTICLE_POSITIONS} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#38bdf8" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function ParticleBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: '#020617' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <fog attach="fog" args={['#020617', 5, 30]} />
        <ambientLight intensity={0.5} />
        <ParticleNodes />
      </Canvas>
    </div>
  );
}
