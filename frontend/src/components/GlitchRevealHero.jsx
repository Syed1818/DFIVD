import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScroll, motion, AnimatePresence, useSpring } from 'motion/react';
import * as THREE from 'three';
import { AlertTriangle, CheckCircle, ArrowRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------------------------
// 1. DATA DEFINITIONS & PROGRESSION STAGE MAPPINGS
// ---------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export const HERO_STAGES = [
  {
    id: 1,
    title: 'Baseline Organic',
    badge: 'STAGE 01 // HUMAN_ANCHOR',
    description: 'Pristine biological human portrait with 3800K studio key lighting and natural micro-texture.',
    alt: 'Stage 1: Pristine human face with warm cinematic lighting and natural skin texture.',
    src: '/assets/hero-sequence/raster/stage-01-baseline.webp',
    fallbackJpeg: '/assets/hero-sequence/raster/stage-01-baseline.jpg',
    color: 'var(--verdict-authentic-warm, #fbbf24)',
    threshold: [0.00, 0.16]
  },
  {
    id: 2,
    title: 'Subsurface Grid',
    badge: 'STAGE 02 // LATENT_FRACTURE',
    description: 'Epidermal tension lines reveal faint cyan geometric wireframe micro-fractures.',
    alt: 'Stage 2: Human face showing fine glowing cyan wireframe cracks beneath the skin on the cheek.',
    src: '/assets/hero-sequence/raster/stage-02-subsurface-grid.webp',
    fallbackJpeg: '/assets/hero-sequence/raster/stage-02-subsurface-grid.jpg',
    color: 'var(--verdict-synthetic-cool, #55b9ff)',
    threshold: [0.17, 0.32]
  },
  {
    id: 3,
    title: 'Biometric Landmark Mesh',
    badge: 'STAGE 03 // 68_POINT_SCAN',
    description: 'Split identity: organic left hemisphere vs. Caffe SSD Delaunay wireframe on the right.',
    alt: 'Stage 3: Half-human, half-cybernetic wireframe face with glowing biometric tracking nodes.',
    src: '/assets/hero-sequence/raster/stage-03-biometric-mesh.webp',
    fallbackJpeg: '/assets/hero-sequence/raster/stage-03-biometric-mesh.jpg',
    color: 'var(--verdict-synthetic-cool, #55b9ff)',
    threshold: [0.33, 0.49]
  },
  {
    id: 4,
    title: 'Voxel Disruption Glitch',
    badge: 'STAGE 04 // LATENT_SPACE_DECAY',
    description: 'Horizontal scanline dislocation, chromatic aberration (RGB split), and extruded voxel tensors.',
    alt: 'Stage 4: Heavily glitched face with RGB chromatic shift and pixelated voxel displacements.',
    src: '/assets/hero-sequence/raster/stage-04-voxel-glitch.webp',
    fallbackJpeg: '/assets/hero-sequence/raster/stage-04-voxel-glitch.jpg',
    color: 'var(--verdict-synthetic, #f87171)',
    threshold: [0.50, 0.65]
  },
  {
    id: 5,
    title: 'Volumetric Dissolution',
    badge: 'STAGE 05 // QUANTIZED_DISPERSION',
    description: 'Cranial topology disintegrates into tens of thousands of luminous floating data shards.',
    alt: 'Stage 5: Face dissolving into a floating 3D particle cloud and glowing code fragments.',
    src: '/assets/hero-sequence/raster/stage-05-particle-dissolve.webp',
    fallbackJpeg: '/assets/hero-sequence/raster/stage-05-particle-dissolve.jpg',
    color: '#c084fc',
    threshold: [0.66, 0.80]
  },
  {
    id: 6,
    title: 'Forensic Verdict Lock',
    badge: 'STAGE 06 // CLASSIFIER_VERDICT',
    description: 'Neural classifier confirms synthetic generative artifacts with 98.4% certainty.',
    alt: 'Stage 6: Holographic forensic telemetry badge displaying Synthetic Detected 98.4% confidence.',
    srcFake: '/assets/hero-sequence/raster/stage-06-verdict-fake.webp',
    srcReal: '/assets/hero-sequence/raster/stage-06-verdict-real.webp',
    fallbackJpeg: '/assets/hero-sequence/raster/stage-06-verdict-fake.jpg',
    color: 'var(--verdict-synthetic, #f87171)',
    threshold: [0.81, 0.92]
  },
  {
    id: 7,
    title: 'Atheia Neural Monolith',
    badge: 'STAGE 07 // NEURAL_SHIELD',
    description: 'Dispersed particles condense into the permanent cryptographic neural defense core.',
    alt: 'Stage 7: Atheia glowing neural shield emblem with interactive deepfake detection portal.',
    src: '/assets/hero-sequence/raster/stage-07-monolith-cta.webp',
    fallbackJpeg: '/assets/hero-sequence/raster/stage-07-monolith-cta.jpg',
    color: 'var(--blue, #55b9ff)',
    threshold: [0.93, 1.00]
  }
];

// ---------------------------------------------------------------------------
// 2. SHADERS: CONTINUOUS CROSSFADE & LUMAKEY ALPHA EXTRACTION
// ---------------------------------------------------------------------------

const CrossfadeShader = {
  uniforms: {
    uTexA: { value: null },
    uTexB: { value: null },
    uBlend: { value: 0.0 },
    uTime: { value: 0.0 },
    uGlitch: { value: 0.0 },
    uCurvature: { value: 0.12 }
  },
  vertexShader: `
    uniform float uCurvature;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normal;

      // Subtle cylindrical surface curvature for 3D realism
      vec3 pos = position;
      float distFromCenter = length(pos.xy);
      pos.z -= (distFromCenter * distFromCenter) * uCurvature * 0.04;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexA;
    uniform sampler2D uTexB;
    uniform float uBlend;
    uniform float uTime;
    uniform float uGlitch;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vec2 uv = vUv;

      // Chromatic RGB aberration pass during glitch intervals
      vec4 colA;
      vec4 colB;

      if (uGlitch > 0.01) {
        float offset = sin(uv.y * 35.0 + uTime * 6.0) * 0.012 * uGlitch;
        colA = vec4(
          texture2D(uTexA, uv + vec2(offset, 0.0)).r,
          texture2D(uTexA, uv).g,
          texture2D(uTexA, uv - vec2(offset, 0.0)).b,
          1.0
        );
        colB = vec4(
          texture2D(uTexB, uv + vec2(offset, 0.0)).r,
          texture2D(uTexB, uv).g,
          texture2D(uTexB, uv - vec2(offset, 0.0)).b,
          1.0
        );
      } else {
        colA = texture2D(uTexA, uv);
        colB = texture2D(uTexB, uv);
      }

      // Smooth liquid crossfade interpolation between stage A and stage B
      vec4 mixedColor = mix(colA, colB, smoothstep(0.0, 1.0, uBlend));

      // Precision Lumakey: Pure black backgrounds (#000000) become transparent
      float luma = max(mixedColor.r, max(mixedColor.g, mixedColor.b));
      float alpha = smoothstep(0.015, 0.08, luma);

      gl_FragColor = vec4(mixedColor.rgb, alpha);
    }
  `
};

// ---------------------------------------------------------------------------
// 3. THREE.JS 3D PARALLAX FACE MESH COMPONENT
// ---------------------------------------------------------------------------

function FaceMeshPlane({ scrollProgress, verdictMode, reducedMotion, isMobile }) {
  const meshRef = useRef();
  const overlayMeshRef = useRef();
  const { pointer } = useThree();

  // Load and cache all textures
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const map = HERO_STAGES.map((s) => {
      const src = s.src || s.srcFake;
      const tex = loader.load(src);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      return tex;
    });
    const realVerdict = loader.load('/assets/hero-sequence/raster/stage-06-verdict-real.webp');
    realVerdict.generateMipmaps = true;
    realVerdict.minFilter = THREE.LinearMipmapLinearFilter;

    const overlay = loader.load('/assets/hero-sequence/overlays/wireframe-mesh.svg');
    overlay.generateMipmaps = true;

    return { list: map, realVerdict, overlay };
  }, []);

  // Shader Uniforms definition
  const shaderUniforms = useMemo(() => THREE.UniformsUtils.clone(CrossfadeShader.uniforms), []);
  const materialRef = useRef(null);

  // GPU Memory Management: Dispose WebGL textures on unmount
  useEffect(() => {
    return () => {
      textures.list.forEach((t) => t.dispose());
      textures.realVerdict.dispose();
      textures.overlay.dispose();
    };
  }, [textures]);

  // Frame Loop: Update Continuous Blending Uniforms & 3D Tilt
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const mat = materialRef.current;

    // 1. Calculate Continuous Stage Interpolation across normalized 0.0 - 1.0 progress
    const totalSegments = HERO_STAGES.length - 1; // 6 intervals between 7 stages
    const clampedProgress = Math.max(0, Math.min(0.999, scrollProgress));
    const rawIndex = clampedProgress * totalSegments;
    const stageA = Math.floor(rawIndex);
    const stageB = Math.min(totalSegments, stageA + 1);
    const blendFactor = rawIndex - stageA; // 0.0 to 1.0 continuous factor

    // Select textures with dynamic verdict toggle support
    let texA = textures.list[stageA] || textures.list[0];
    let texB = textures.list[stageB] || textures.list[totalSegments];

    if (stageA === 5 && verdictMode === 'real') texA = textures.realVerdict;
    if (stageB === 5 && verdictMode === 'real') texB = textures.realVerdict;

    mat.uniforms.uTexA.value = texA;
    mat.uniforms.uTexB.value = texB;
    mat.uniforms.uBlend.value = blendFactor;
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // Glitch intensity triggers during Stage 4 (rawIndex approx 2.8 - 3.8)
    const isGlitchRange = rawIndex >= 2.5 && rawIndex <= 3.9;
    mat.uniforms.uGlitch.value = isGlitchRange ? (1.0 - Math.abs(rawIndex - 3.0)) : 0.0;

    // 2. 3D Parallax Tilt with Smooth Slerp/Lerp
    if (reducedMotion || isMobile) {
      // Clamped subtle motion for mobile and reduced motion
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.06);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.06);
      return;
    }

    // 8-12 degrees max tilt (~0.15 - 0.20 radians) driven by mouse pointer and scroll progress
    const rawTiltX = -pointer.y * 0.17 + (scrollProgress - 0.5) * 0.12;
    const rawTiltY = pointer.x * 0.19;
    const targetTiltX = THREE.MathUtils.clamp(rawTiltX, -0.20, 0.20);
    const targetTiltY = THREE.MathUtils.clamp(rawTiltY, -0.20, 0.20);

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetTiltX, 0.08);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetTiltY, 0.08);

    // 3. Decoupled Wireframe Overlay Parallax: Sits at Z = 0.28 with 1.18x tilt multiplier
    if (overlayMeshRef.current) {
      overlayMeshRef.current.rotation.x = meshRef.current.rotation.x * 1.18;
      overlayMeshRef.current.rotation.y = meshRef.current.rotation.y * 1.18;
      
      // Active between Stage 2 and Stage 4
      const overlayTargetOpacity = (rawIndex >= 0.8 && rawIndex <= 3.2) ? 0.85 : 0.0;
      overlayMeshRef.current.material.opacity = THREE.MathUtils.lerp(
        overlayMeshRef.current.material.opacity,
        overlayTargetOpacity,
        0.1
      );
    }
  });

  return (
    <group>
      {/* Primary Textured Face Plane with Custom Shader */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[5.2, 5.2, 48, 48]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={shaderUniforms}
          vertexShader={CrossfadeShader.vertexShader}
          fragmentShader={CrossfadeShader.fragmentShader}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Decoupled Floating Wireframe Layer (Z = 0.28 Stereoscopic Parallax) */}
      <mesh ref={overlayMeshRef} position={[0, 0, 0.28]}>
        <planeGeometry args={[5.2, 5.2]} />
        <meshBasicMaterial
          map={textures.overlay}
          transparent={true}
          opacity={0.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. GPU PARTICLE & VOXEL DISSOLUTION SYSTEM
// ---------------------------------------------------------------------------

function pseudoRand(i) {
  let t = (i + 1) * 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function VoxelDissolveParticles({ scrollProgress, reducedMotion }) {
  const pointsRef = useRef();
  const particleCount = reducedMotion ? 150 : 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color('#55b9ff');
    const amber = new THREE.Color('#fbbf24');
    const crimson = new THREE.Color('#f87171');

    for (let i = 0; i < particleCount; i++) {
      // Facial boundary distribution
      const u = pseudoRand(i * 5);
      const theta = pseudoRand(i * 5 + 1) * Math.PI * 2;
      const radius = 2.4 * Math.sqrt(u);

      pos[i * 3] = radius * Math.cos(theta);
      pos[i * 3 + 1] = (pseudoRand(i * 5 + 2) - 0.5) * 4.6;
      pos[i * 3 + 2] = (pseudoRand(i * 5 + 3) - 0.5) * 0.4;

      // Color mapping: Core cyan/amber, periphery threat crimson
      const c = radius > 1.4 ? crimson : (pseudoRand(i * 5 + 4) > 0.4 ? cyan : amber);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Dissolve active between progress 0.55 and 0.85 (Stages 4, 5, 6)
    const inDissolveZone = scrollProgress >= 0.50 && scrollProgress <= 0.88;
    const progressFactor = THREE.MathUtils.clamp((scrollProgress - 0.50) / 0.35, 0, 1);
    const targetOpacity = inDissolveZone ? (Math.sin(progressFactor * Math.PI) * 0.95) : 0.0;

    pointsRef.current.material.opacity = THREE.MathUtils.lerp(
      pointsRef.current.material.opacity,
      targetOpacity,
      0.1
    );

    // Radial dispersion expansion
    const currentScale = 1.0 + progressFactor * 1.8;
    pointsRef.current.scale.set(currentScale, currentScale, currentScale);
    pointsRef.current.rotation.y += delta * (0.1 + progressFactor * 0.3);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors={true}
        transparent={true}
        opacity={0.0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// 5. MAIN GLITCH REVEAL HERO COMPONENT
// ---------------------------------------------------------------------------

export default function GlitchRevealHero({ onVerdictChange }) {
  const containerRef = useRef(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentProgressVal, setCurrentProgressVal] = useState(0);
  const [verdictMode, setVerdictMode] = useState('fake'); // 'fake' | 'real'
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches) : false
  );
  const [isInViewport, setIsInViewport] = useState(true);

  // Performance Viewport Gating: Freezes Three.js GPU draw loop when scrolled out of view
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { rootMargin: '120px 0px 120px 0px', threshold: 0.01 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 1. Accessibility & Environment Detection
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
    };
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // 2. Preload Asset Sequence into Browser Cache
  useEffect(() => {
    const assets = [
      ...HERO_STAGES.map((s) => s.src || s.srcFake),
      '/assets/hero-sequence/raster/stage-06-verdict-real.webp',
      '/assets/hero-sequence/overlays/wireframe-mesh.svg',
      '/assets/hero-sequence/overlays/biometric-nodes.svg',
      '/assets/hero-sequence/overlays/scanline-grid.svg'
    ];

    assets.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 3. Smooth Spring Scroll Scrubbing
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    restDelta: 0.001
  });

  // Synchronize state index and progress metrics with spring scrub
  useEffect(() => {
    return smoothProgress.on('change', (progress) => {
      setCurrentProgressVal(progress);
      const stageIdx = HERO_STAGES.findIndex((stage) => {
        return progress >= stage.threshold[0] && progress <= stage.threshold[1];
      });
      if (stageIdx !== -1 && stageIdx !== currentStageIndex) {
        setCurrentStageIndex(stageIdx);
        if (onVerdictChange) onVerdictChange(stageIdx);
      }
    });
  }, [smoothProgress, currentStageIndex, onVerdictChange]);

  const activeStage = HERO_STAGES[currentStageIndex] || HERO_STAGES[0];

  // 4. Accessible Keyboard / Manual Stage Selection (Scroll-Independent Fallback)
  const setStageManual = useCallback((index) => {
    const clamped = Math.max(0, Math.min(HERO_STAGES.length - 1, index));
    setCurrentStageIndex(clamped);
    if (containerRef.current) {
      const targetScroll = containerRef.current.offsetTop + 
        (containerRef.current.offsetHeight * HERO_STAGES[clamped].threshold[0]);
      window.scrollTo({ 
        top: targetScroll, 
        behavior: reducedMotion ? 'auto' : 'smooth' 
      });
    }
  }, [reducedMotion]);

  // Keyboard navigation: Arrow keys step through sequence when within container
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement && containerRef.current && containerRef.current.contains(document.activeElement)) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setStageManual(currentStageIndex + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setStageManual(currentStageIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStageIndex, setStageManual]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[450vh] bg-[#05070c] text-white selection:bg-[#55b9ff]/30"
      aria-label="Atheia Glitch Reveal Deepfake Forensics Sequence"
    >
      {/* Keyboard Accessibility Skip Link */}
      <a 
        href="#skip-forensics-hero"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-mono focus:text-xs focus:font-bold focus:shadow-xl focus:rounded focus:outline-none focus:ring-2 focus:ring-[#55b9ff]"
      >
        Skip Interactive Forensics Sequence
      </a>

      {/* Live Region for Screen Readers (Announces active state on scrub) */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {`Forensics Step ${activeStage.id} of 7: ${activeStage.title}. ${activeStage.description}`}
      </div>

      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-between items-center overflow-hidden px-4 md:px-12 py-6 md:py-10">
        
        {/* TOP STATUS BAR: Live Telemetry Metadata */}
        <header className="relative z-30 w-full max-w-[1400px] flex items-center justify-between border-b border-white/10 pb-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55b9ff] animate-ping" />
            <span className="text-[11px] md:text-xs font-mono uppercase tracking-[0.25em] text-slate-300">
              ATHEIA // NEURAL_FORENSIC_DECONSTRUCTION
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500">
              SCRUB: {Math.round(currentProgressVal * 100)}% // 0° ROLL // 100MM F/4.0
            </span>
            <div className="px-3 py-1 rounded border border-white/20 bg-white/5 text-[11px] font-mono uppercase tracking-widest text-[#55b9ff]">
              {activeStage.badge}
            </div>
          </div>
        </header>

        {/* CENTER VIEWPORT: Three.js 3D Canvas + Decoupled Overlays */}
        <div className="relative w-full max-w-[700px] aspect-square flex items-center justify-center my-auto">
          
          {/* THREE.JS 3D CANVAS (Continuous Shader Crossfade + 3D Tilt + GPU Particles) */}
          <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
            <Canvas
              frameloop={isInViewport ? 'always' : 'never'}
              camera={{ position: [0, 0, 7.5], fov: 45 }}
              dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <Suspense fallback={null}>
                <ambientLight intensity={1.2} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffedd5" />
                <directionalLight position={[-5, -5, -2]} intensity={0.8} color="#55b9ff" />
                
                <FaceMeshPlane 
                  scrollProgress={currentProgressVal}
                  verdictMode={verdictMode}
                  reducedMotion={reducedMotion}
                  isMobile={isMobile}
                />
                
                <VoxelDissolveParticles 
                  scrollProgress={currentProgressVal}
                  reducedMotion={reducedMotion}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* DECOUPLED OVERLAY 1: Scanline Grid & Calibration Reticles */}
          <motion.div 
            className="absolute inset-0 z-20 pointer-events-none mix-blend-screen bg-contain bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('/assets/hero-sequence/overlays/scanline-grid.svg')`,
              opacity: currentStageIndex >= 1 && currentStageIndex <= 5 ? 0.65 : 0.2
            }}
            animate={{ opacity: currentStageIndex >= 1 && currentStageIndex <= 5 ? 0.65 : 0.2 }}
            transition={{ duration: 0.4 }}
          />

          {/* DECOUPLED OVERLAY 2: Animated Laser Scanning Beam */}
          {currentStageIndex >= 1 && currentStageIndex <= 4 && (
            <motion.div
              initial={{ y: '-40%' }}
              animate={{ y: ['-40%', '40%', '-40%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-x-8 h-1 z-22 pointer-events-none bg-gradient-to-r from-transparent via-[#55b9ff] to-transparent opacity-80 shadow-[0_0_15px_#55b9ff]"
            />
          )}

          {/* DECOUPLED OVERLAY 3: 68-Point Biometric Tracking Nodes (Stage 3 Active) */}
          <AnimatePresence>
            {currentStageIndex === 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 0.95, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 z-25 pointer-events-none mix-blend-screen bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/assets/hero-sequence/overlays/biometric-nodes.svg')` }}
              />
            )}
          </AnimatePresence>

          {/* STAGE 6: Interactive Verdict Card Overlay */}
          <AnimatePresence>
            {currentStageIndex === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute z-30 bottom-4 inset-x-4 md:inset-x-8 p-4 md:p-6 rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg border ${
                    verdictMode === 'fake' 
                      ? 'border-red-500/40 bg-red-950/40 text-red-400' 
                      : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                  }`}>
                    {verdictMode === 'fake' ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <CheckCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg md:text-xl tracking-tight uppercase">
                      {verdictMode === 'fake' ? 'Synthetic Manipulation Confirmed' : 'Biological Authenticity Verified'}
                    </h3>
                    <p className="font-mono text-xs text-slate-400">
                      {verdictMode === 'fake' 
                        ? 'EfficientNet Latent Anomaly: 98.4% // Caffe-SSD Artifact' 
                        : 'Natural Spectral Hemodynamics: 99.8% // Genuine Media'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVerdictMode((m) => m === 'fake' ? 'real' : 'fake')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-wider transition-colors"
                    title="Toggle verdict demonstration"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Mode: {verdictMode.toUpperCase()}</span>
                  </button>
                  <Link
                    to="/image-detection"
                    className={`px-4 py-2 rounded text-xs font-bold font-mono uppercase tracking-widest transition-all ${
                      verdictMode === 'fake' 
                        ? 'bg-red-500 hover:bg-red-600 text-black shadow-[0_0_20px_rgba(248,113,113,0.4)]' 
                        : 'bg-emerald-400 hover:bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                    }`}
                  >
                    Scan File
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 7: Monolith Brand Portal & Deepfake Scanner CTA */}
          <AnimatePresence>
            {currentStageIndex === 6 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6 }}
                className="absolute z-30 bottom-6 inset-x-6 flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-[#55b9ff]/40 bg-[#05070c]/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(85,185,255,0.2)]"
              >
                <div className="text-xs font-mono uppercase tracking-[0.3em] text-[#55b9ff]">
                  PROVEN FORENSIC ACCURACY
                </div>
                <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight text-white uppercase">
                  Protect Your Reality With Atheia
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/image-detection"
                    className="group flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    <span>Launch Image Scanner</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/video-detection"
                    className="flex items-center gap-3 border border-white/30 hover:border-white px-6 py-3.5 rounded font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                  >
                    <span>Video Deepfake Engine</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM CONTROLS: Narrative Step Indicators & Accessibility Navigation */}
        <footer className="relative z-30 w-full max-w-[1400px] flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
          
          {/* Active Stage Narrative Description */}
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div className="text-2xl md:text-3xl font-display font-bold text-white">
              0{activeStage.id}
            </div>
            <div>
              <div className="text-xs md:text-sm font-semibold tracking-wide uppercase text-white">
                {activeStage.title}
              </div>
              <div className="text-[11px] font-mono text-slate-400 max-w-sm line-clamp-1">
                {activeStage.description}
              </div>
            </div>
          </div>

          {/* Accessible Navigation Controls (Keyboard / Screen Reader Friendly) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStageManual(currentStageIndex - 1)}
              disabled={currentStageIndex === 0}
              className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous Forensics Stage"
            >
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </button>

            <nav aria-label="Hero Sequence Stages" className="flex items-center gap-1.5 md:gap-2">
              {HERO_STAGES.map((stage, idx) => (
                <button
                  key={stage.id}
                  onClick={() => setStageManual(idx)}
                  className={`group relative flex items-center justify-center w-8 h-8 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55b9ff] ${
                    idx === currentStageIndex
                      ? 'border-[#55b9ff] bg-[#55b9ff]/20 text-white font-bold shadow-[0_0_12px_rgba(85,185,255,0.4)]'
                      : 'border-white/20 bg-white/5 text-slate-400 hover:border-white/50'
                  }`}
                  aria-label={`Jump to ${stage.title}`}
                  aria-current={idx === currentStageIndex ? 'step' : undefined}
                >
                  <span className="text-[10px] font-mono">{stage.id}</span>
                  <span className="sr-only">{stage.title}</span>
                </button>
              ))}
            </nav>

            <button
              onClick={() => setStageManual(currentStageIndex + 1)}
              disabled={currentStageIndex === HERO_STAGES.length - 1}
              className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next Forensics Stage"
            >
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Spring Scroll Scrub Progress Bar & Ethical Provenance */}
          <div className="hidden lg:flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                PROGRESS
              </span>
              <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#55b9ff] via-[#fbbf24] to-[#f87171]" 
                  style={{ scaleX: smoothProgress, transformOrigin: '0%' }}
                />
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-500 tracking-wider">
              ETHICAL AI: SYNTHETIC PROVENANCE // ZERO REAL LIKENESS
            </span>
          </div>
        </footer>

      </div>
    </section>
  );
}
