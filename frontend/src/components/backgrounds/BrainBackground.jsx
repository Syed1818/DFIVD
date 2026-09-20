import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function BrainNodes() {
  const points = useRef();
  const lines = useRef();
  
  const particleCount = 800;
  
  // Create positions in a roughly spherical/brain shape with dual hemispheres
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const colorA = new THREE.Color('#38bdf8'); // sky-400
    const colorB = new THREE.Color('#818cf8'); // indigo-400
    
    for (let i = 0; i < particleCount; i++) {
      // Hemisphere offset (left/right)
      const isRight = Math.random() > 0.5;
      const xOffset = isRight ? 2 + Math.random() * 0.5 : -2 - Math.random() * 0.5;
      
      const r = 5 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta) * 0.6 + xOffset; // Compress X, separate
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi) * 1.2; // Elongate Z

      pos[i*3] = x;
      pos[i*3+1] = y;
      pos[i*3+2] = z;
      
      const mixedColor = colorA.clone().lerp(colorB, Math.random());
      col[i*3] = mixedColor.r;
      col[i*3+1] = mixedColor.g;
      col[i*3+2] = mixedColor.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.1;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Pulse size
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      points.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} vertexColors transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export default function BrainBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: '#020617' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <fog attach="fog" args={['#020617', 10, 25]} />
        <ambientLight intensity={0.5} />
        <BrainNodes />
      </Canvas>
    </div>
  );
}
