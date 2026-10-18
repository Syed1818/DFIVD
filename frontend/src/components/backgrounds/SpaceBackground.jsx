import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

function SpaceNodes() {
  const group = useRef();

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={group}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export default function SpaceBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: '#020617' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <fog attach="fog" args={['#020617', 20, 100]} />
        <SpaceNodes />
      </Canvas>
    </div>
  );
}
