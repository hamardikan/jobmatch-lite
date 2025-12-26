'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

interface ParticlesProps {
  count: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

function Particles({ count, mouse }: ParticlesProps) {
  const ref = useRef<THREE.Points>(null);
  const { resolvedTheme } = useTheme();

  // Generate random positions for particles
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread particles in a sphere-like distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 4;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  // Store original positions for wave effect
  const originalPositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state) => {
    if (!ref.current) return;

    const time = state.clock.getElapsedTime();
    const positionArray = ref.current.geometry.attributes.position.array as Float32Array;

    // Animate particles with subtle wave motion
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      // Subtle wave effect
      positionArray[i3] = ox + Math.sin(time * 0.3 + i * 0.01) * 0.1;
      positionArray[i3 + 1] = oy + Math.cos(time * 0.2 + i * 0.01) * 0.1;
      positionArray[i3 + 2] = oz + Math.sin(time * 0.4 + i * 0.01) * 0.05;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;

    // Gentle rotation
    ref.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    ref.current.rotation.y = time * 0.03;

    // Mouse influence - subtle rotation based on mouse position
    ref.current.rotation.x += mouse.current.y * 0.0005;
    ref.current.rotation.y += mouse.current.x * 0.0005;
  });

  // Theme-aware colors
  const color = resolvedTheme === 'dark' ? '#60a5fa' : '#3b82f6';

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.025}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Secondary particles layer for depth effect
function SecondaryParticles({ count, mouse }: ParticlesProps) {
  const ref = useRef<THREE.Points>(null);
  const { resolvedTheme } = useTheme();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 5 + Math.random() * 3;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    ref.current.rotation.y = -time * 0.02;
    ref.current.rotation.x = Math.cos(time * 0.1) * 0.05;
  });

  const color = resolvedTheme === 'dark' ? '#818cf8' : '#6366f1';

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export function ParticleScene() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  // Reduce particle count on mobile for better performance
  const particleCount = isMobile ? 600 : 2000;
  const secondaryCount = isMobile ? 200 : 800;

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <Particles count={particleCount} mouse={mouse} />
        {!isMobile && <SecondaryParticles count={secondaryCount} mouse={mouse} />}
      </Canvas>
    </div>
  );
}
