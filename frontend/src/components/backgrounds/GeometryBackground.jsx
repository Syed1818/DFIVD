import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function GeometryNodes() {
  const mesh1 = useRef();
  const mesh2 = useRef();

  useFrame((state, delta) => {
    if (mesh1.current) {
      mesh1.current.rotation.x += delta * 0.1;
      mesh1.current.rotation.y += delta * 0.15;
    }
    if (mesh2.current) {
      mesh2.current.rotation.x -= delta * 0.15;
      mesh2.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={mesh1} position={[-3, 0, 0]}>
        <icosahedronGeometry args={[2, 1]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh ref={mesh2} position={[3, 0, 0]}>
        <octahedronGeometry args={[2.5, 2]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function GeometryBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: '#020617' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <fog attach="fog" args={['#020617', 5, 20]} />
        <GeometryNodes />
      </Canvas>
    </div>
  );
}
