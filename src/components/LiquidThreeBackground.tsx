'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LiquidThreeBackgroundProps {
  theme: 'light' | 'dark';
  topScore?: number;
}

export function LiquidThreeBackground({ theme, topScore = 0.74 }: LiquidThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef(theme);
  const scoreRef = useRef(topScore);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    scoreRef.current = topScore;
  }, [topScore]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.5,
      50
    );
    camera.position.set(0, 0, 15);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
        depth: false,
        stencil: false
      });
    } catch {
      return;
    }

    // Cap pixel ratio at 1.0 so background ambient geometry never taxes high-DPI GPUs
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x93c5fd, 1.5);
    dirLight.position.set(5, 7, 10);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    // Lightweight low-poly geometry (no multi-pass transmission shader)
    const geoIcosa = new THREE.IcosahedronGeometry(1.85, 0);
    const geoOcta = new THREE.OctahedronGeometry(1.45, 0);

    const lightFillColor = new THREE.Color(0x7fb3f5);
    const darkFillColor = new THREE.Color(0x2563eb);
    const lightWireColor = new THREE.Color(0x3b82f6);
    const darkWireColor = new THREE.Color(0x60a5fa);

    const matFill = new THREE.MeshLambertMaterial({
      color: themeRef.current === 'dark' ? darkFillColor : lightFillColor,
      transparent: true,
      opacity: 0.14
    });

    const matWire = new THREE.MeshBasicMaterial({
      color: themeRef.current === 'dark' ? darkWireColor : lightWireColor,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });

    const meshLeft = new THREE.Mesh(geoIcosa, matFill);
    meshLeft.position.set(-6.2, 2.5, -3);
    const meshLeftWire = new THREE.Mesh(geoIcosa, matWire);
    meshLeftWire.scale.setScalar(1.02);
    meshLeft.add(meshLeftWire);
    group.add(meshLeft);

    const meshRight = new THREE.Mesh(geoOcta, matFill);
    meshRight.position.set(6.2, -2.2, -3.5);
    const meshRightWire = new THREE.Mesh(geoOcta, matWire);
    meshRightWire.scale.setScalar(1.02);
    meshRight.add(meshRightWire);
    group.add(meshRight);

    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 160);
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Render initial static frame
    renderer.render(scene, camera);

    let reqId = 0;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 20; // Throttled to 20 FPS for minimal GPU footprint

    const animate = (now: number) => {
      reqId = requestAnimationFrame(animate);
      if (document.hidden || isScrolling || prefersReducedMotion) return;
      if (now - lastFrameTime < frameInterval) return;
      lastFrameTime = now;

      const isDark = themeRef.current === 'dark';
      matFill.color.copy(isDark ? darkFillColor : lightFillColor);
      matWire.color.copy(isDark ? darkWireColor : lightWireColor);

      const t = now * 0.00035 * (0.7 + scoreRef.current * 0.3);
      meshLeft.rotation.x = t;
      meshLeft.rotation.y = t * 1.2;
      meshRight.rotation.x = -t * 0.9;
      meshRight.rotation.y = t * 0.8;

      renderer.render(scene, camera);
    };

    if (!prefersReducedMotion) {
      reqId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(reqId);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      geoIcosa.dispose();
      geoOcta.dispose();
      matFill.dispose();
      matWire.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
}
