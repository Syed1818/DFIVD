import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RippleNodes() {
  const count = 1000;
  const mesh = useRef();
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const dist = Math.sqrt(x*x + z*z);
      temp.push({ x, z, dist });
    }
    return temp;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    particles.forEach((particle, i) => {
      const y = Math.sin(particle.dist * 0.5 - time * 2) * 1.5;
      
      dummy.position.set(particle.x, y, particle.z);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

export default function RippleBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: '#020617' }}>
      <Canvas camera={{ position: [0, 5, 20], fov: 60, rotation: [-Math.PI / 8, 0, 0] }}>
        <fog attach="fog" args={['#020617', 5, 30]} />
        <RippleNodes />
      </Canvas>
    </div>
  );
}
