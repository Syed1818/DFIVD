import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function DataStreamNodes() {
  const count = 500;
  const mesh = useRef();
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 40 - 20;
      const z = (Math.random() - 0.5) * 40;
      const speed = 0.5 + Math.random() * 2;
      temp.push({ x, y, z, speed });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    particles.forEach((particle, i) => {
      particle.y -= particle.speed * delta * 5;
      if (particle.y < -20) particle.y = 20;
      
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.scale.setScalar(Math.max(0.1, Math.sin(state.clock.elapsedTime * particle.speed)));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <boxGeometry args={[0.05, 0.5, 0.05]} />
      <meshBasicMaterial color="#10b981" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

export default function DataStreamBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: '#020617' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <fog attach="fog" args={['#020617', 5, 25]} />
        <DataStreamNodes />
      </Canvas>
    </div>
  );
}
