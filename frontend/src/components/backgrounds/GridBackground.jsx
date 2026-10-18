import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function GridNodes() {
  const grid = useRef();

  useFrame((state) => {
    if (grid.current) {
      grid.current.position.z = (state.clock.elapsedTime * 2) % 2;
    }
  });

  return (
    <group rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -5, 0]}>
      <gridHelper ref={grid} args={[100, 100, '#38bdf8', '#0ea5e9']} />
    </group>
  );
}

export default function GridBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: '#020617' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <fog attach="fog" args={['#020617', 5, 40]} />
        <GridNodes />
      </Canvas>
    </div>
  );
}
