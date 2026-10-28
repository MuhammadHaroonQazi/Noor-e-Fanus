import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, RotateCcw, Sparkles } from 'lucide-react';
import { Chandelier3DArchetype, FinishPreset, LightTemperature } from '../types/lighting';

interface Fanus3DShowcaseProps {
  initialArchetype?: Chandelier3DArchetype;
  initialFinish?: FinishPreset;
  compact?: boolean;
  productTitle?: string;
}

const FINISH_CONFIGS: Record<
  FinishPreset,
  { label: string; colorHex: number; roughness: number; metalness: number; swatch: string }
> = {
  'champagne-gold': {
    label: 'Champagne Gold',
    colorHex: 0xd4af37,
    roughness: 0.18,
    metalness: 0.92,
    swatch: '#D4AF37',
  },
  'antique-bronze': {
    label: 'Antique Bronze',
    colorHex: 0x6e4f32,
    roughness: 0.34,
    metalness: 0.85,
    swatch: '#6E4F32',
  },
  'polished-chrome': {
    label: 'Polished Chrome',
    colorHex: 0xe2e6ec,
    roughness: 0.12,
    metalness: 0.96,
    swatch: '#E2E6EC',
  },
};

const TEMP_CONFIGS: Record<
  LightTemperature,
  { label: string; colorHex: number; emissiveHex: number; badgeColor: string }
> = {
  '2700K': {
    label: '2700K Warm Gold',
    colorHex: 0xffb85c,
    emissiveHex: 0xffaa33,
    badgeColor: '#F59E0B',
  },
  '4000K': {
    label: '4000K Neutral',
    colorHex: 0xfff1d6,
    emissiveHex: 0xffe4b5,
    badgeColor: '#FDE68A',
  },
  '6000K': {
    label: '6000K Daylight',
    colorHex: 0xeef6ff,
    emissiveHex: 0xdbeafe,
    badgeColor: '#BAE6FD',
  },
};

const ARCHETYPE_OPTIONS: { id: Chandelier3DArchetype; label: string }[] = [
  { id: 'imperial-crystal', label: 'Imperial Crystal' },
  { id: 'golden-rings', label: 'Golden Rings' },
  { id: 'mughal-lantern', label: 'Mughal Filigree' },
  { id: 'cascade-cluster', label: 'Cascade Globes' },
  { id: 'wall-sconce', label: 'Wall Sconce' },
];

export const Fanus3DShowcase: React.FC<Fanus3DShowcaseProps> = ({
  initialArchetype = 'imperial-crystal',
  initialFinish = 'champagne-gold',
  compact = false,
  productTitle,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [archetype, setArchetype] = useState<Chandelier3DArchetype>(initialArchetype);
  const [finish, setFinish] = useState<FinishPreset>(initialFinish);
  const [temperature, setTemperature] = useState<LightTemperature>('2700K');
  const [exploded, setExploded] = useState<number>(0);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  // Sync props when product changes
  useEffect(() => {
    setArchetype(initialArchetype);
  }, [initialArchetype]);

  useEffect(() => {
    setFinish(initialFinish);
  }, [initialFinish]);

  // Mutable ref bridge for Three.js scene updates without tearing down WebGL context
  const sceneControlRef = useRef<{
    updateSceneConfig?: (
      arch: Chandelier3DArchetype,
      fin: FinishPreset,
      temp: LightTemperature,
      exp: number,
    ) => void;
    resetCamera?: () => void;
  }>({});

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Detect software WebGL (SwiftShader / llvmpipe) per threejs skill
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 320);
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141210);
    scene.fog = new THREE.FogExp2(0x141210, 0.045);

    // Studio Environment Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.4, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.minDistance = 3.2;
    controls.maxDistance = 10.5;
    controls.update();

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfff3d6, 0x242038, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffdf9e, 1.8);
    keyLight.position.set(4, 6.5, 4);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      const d = 4;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9ec5ff, 0.7);
    rimLight.position.set(-4, 3.5, -4);
    scene.add(rimLight);

    const chandelierGlowLight = new THREE.PointLight(0xffb85c, 4.2, 12, 1.6);
    chandelierGlowLight.position.set(0, 1.6, 0);
    scene.add(chandelierGlowLight);

    // Architectural Showroom Pedestal & Ceiling Medallion
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    const floorGeo = new THREE.CylinderGeometry(6.5, 6.5, 0.08, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b18,
      roughness: 0.65,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.54;
    floorMesh.receiveShadow = !isSoftwareGl;
    roomGroup.add(floorMesh);

    // Soft radial contact shadow plane under the Fanus
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 60);
      grad.addColorStop(0, 'rgba(255, 190, 92, 0.32)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.42)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const contactTex = new THREE.CanvasTexture(shadowCanvas);
    contactTex.colorSpace = THREE.SRGBColorSpace;
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });
    const contactPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = -0.48;
    roomGroup.add(contactPlane);

    // Shared PBR Materials
    const metalMaterial = new THREE.MeshPhysicalMaterial({
      color: FINISH_CONFIGS[initialFinish].colorHex,
      metalness: FINISH_CONFIGS[initialFinish].metalness,
      roughness: FINISH_CONFIGS[initialFinish].roughness,
      clearcoat: 0.4,
    });

    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfffbf0,
      metalness: 0.05,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: isSoftwareGl ? 0.65 : 1.0,
      ior: 1.75,
      thickness: 1.2,
      clearcoat: 1.0,
    });

    const bulbMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffaa33,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });

    // Root Chandelier Group with Explodable Sub-Groups
    const chandelierRoot = new THREE.Group();
    chandelierRoot.position.y = 0.28;
    scene.add(chandelierRoot);

    const buildChandelierArchetype = (arch: Chandelier3DArchetype, explodeFactor: number) => {
      while (chandelierRoot.children.length > 0) {
        chandelierRoot.remove(chandelierRoot.children[0]);
      }

      const sep = explodeFactor * 0.65;

      // 1. Ceiling Medallion & Canopy (LatheGeometry)
      const canopyPoints = [
        new THREE.Vector2(0.0, 0.22),
        new THREE.Vector2(0.55, 0.22),
        new THREE.Vector2(0.48, 0.12),
        new THREE.Vector2(0.18, 0.06),
        new THREE.Vector2(0.06, 0.0),
      ];
      const canopyGeo = new THREE.LatheGeometry(canopyPoints, 32);
      const canopyMesh = new THREE.Mesh(canopyGeo, metalMaterial);
      canopyMesh.position.y = 3.2 + sep * 0.6;
      chandelierRoot.add(canopyMesh);

      // Central Suspension Rod
      const rodMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 16), metalMaterial);
      rodMesh.position.y = 2.65 + sep * 0.3;
      chandelierRoot.add(rodMesh);

      if (arch === 'imperial-crystal') {
        const tiers = [
          { radius: 1.35, y: 2.05 + sep * 0.2, count: 28, prismLen: 0.52 },
          { radius: 0.95, y: 1.48 - sep * 0.15, count: 20, prismLen: 0.46 },
          { radius: 0.55, y: 0.96 - sep * 0.45, count: 12, prismLen: 0.38 },
        ];

        const prismGeo = new THREE.CylinderGeometry(0.042, 0.028, 1, 6);
        const dropBallGeo = new THREE.OctahedronGeometry(0.065, 1);

        const totalPrisms = tiers.reduce((acc, t) => acc + t.count, 0);
        const prismInstanced = new THREE.InstancedMesh(prismGeo, crystalMaterial, totalPrisms);
        const ballInstanced = new THREE.InstancedMesh(dropBallGeo, crystalMaterial, totalPrisms);

        const dummy = new THREE.Object3D();
        let instanceIdx = 0;

        tiers.forEach((tier) => {
          // Brass Crown Ring
          const ringGeo = new THREE.TorusGeometry(tier.radius, 0.045, 16, 48);
          const ringMesh = new THREE.Mesh(ringGeo, metalMaterial);
          ringMesh.rotation.x = Math.PI / 2;
          ringMesh.position.y = tier.y;
          chandelierRoot.add(ringMesh);

          // Glowing Internal Ring
          const ledGeo = new THREE.TorusGeometry(tier.radius - 0.04, 0.02, 12, 36);
          const ledMesh = new THREE.Mesh(ledGeo, bulbMaterial);
          ledMesh.rotation.x = Math.PI / 2;
          ledMesh.position.y = tier.y - 0.03;
          chandelierRoot.add(ledMesh);

          for (let i = 0; i < tier.count; i++) {
            const angle = (i / tier.count) * Math.PI * 2;
            const px = Math.cos(angle) * tier.radius;
            const pz = Math.sin(angle) * tier.radius;

            dummy.position.set(px, tier.y - tier.prismLen * 0.5 - 0.04, pz);
            dummy.scale.set(1, tier.prismLen, 1);
            dummy.rotation.set(0, -angle, 0);
            dummy.updateMatrix();
            prismInstanced.setMatrixAt(instanceIdx, dummy.matrix);

            dummy.position.set(px, tier.y - tier.prismLen - 0.12, pz);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            ballInstanced.setMatrixAt(instanceIdx, dummy.matrix);

            instanceIdx++;
          }
        });

        prismInstanced.instanceMatrix.needsUpdate = true;
        prismInstanced.computeBoundingSphere();
        ballInstanced.instanceMatrix.needsUpdate = true;
        ballInstanced.computeBoundingSphere();

        chandelierRoot.add(prismInstanced);
        chandelierRoot.add(ballInstanced);

        // Bottom Finial Sphere
        const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 2), crystalMaterial);
        finial.position.y = 0.45 - sep * 0.7;
        chandelierRoot.add(finial);
      } else if (arch === 'golden-rings') {
        const ringSpecs = [
          { r: 1.5, y: 2.0 + sep * 0.25, tiltX: 0.16, tiltZ: -0.1 },
          { r: 1.12, y: 1.42, tiltX: -0.18, tiltZ: 0.12 },
          { r: 0.72, y: 0.88 - sep * 0.35, tiltX: 0.1, tiltZ: -0.08 },
        ];

        ringSpecs.forEach((spec) => {
          const group = new THREE.Group();
          group.position.y = spec.y;
          group.rotation.set(spec.tiltX, 0, spec.tiltZ);

          const outerRing = new THREE.Mesh(new THREE.TorusGeometry(spec.r, 0.055, 20, 64), metalMaterial);
          outerRing.rotation.x = Math.PI / 2;
          group.add(outerRing);

          const innerDiffuser = new THREE.Mesh(new THREE.TorusGeometry(spec.r - 0.045, 0.032, 16, 64), bulbMaterial);
          innerDiffuser.rotation.x = Math.PI / 2;
          group.add(innerDiffuser);

          chandelierRoot.add(group);
        });
      } else if (arch === 'mughal-lantern') {
        const lanternGroup = new THREE.Group();
        lanternGroup.position.y = 1.5;

        // Top Dome
        const domeGeo = new THREE.SphereGeometry(0.65, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const domeMesh = new THREE.Mesh(domeGeo, metalMaterial);
        domeMesh.position.y = 0.45 + sep * 0.3;
        lanternGroup.add(domeMesh);

        // Octagonal Filigree Pillar Cage
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.15, 8), metalMaterial);
          strut.position.set(Math.cos(a) * (0.58 + sep * 0.15), -0.1, Math.sin(a) * (0.58 + sep * 0.15));
          lanternGroup.add(strut);
        }

        // Glowing Amber Core Cylinder
        const coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.95, 24), bulbMaterial);
        coreMesh.position.y = -0.1;
        lanternGroup.add(coreMesh);

        // Lower Tapered Finial Cone
        const baseCone = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.45, 8), metalMaterial);
        baseCone.rotation.x = Math.PI;
        baseCone.position.y = -0.88 - sep * 0.3;
        lanternGroup.add(baseCone);

        chandelierRoot.add(lanternGroup);
      } else if (arch === 'cascade-cluster') {
        const drops = [
          { x: -0.65, z: 0.35, y: 1.9 + sep * 0.15, r: 0.24 },
          { x: 0.65, z: 0.25, y: 1.65, r: 0.26 },
          { x: -0.25, z: -0.58, y: 1.4, r: 0.22 },
          { x: 0.32, z: -0.45, y: 1.15 - sep * 0.15, r: 0.28 },
          { x: -0.48, z: -0.1, y: 0.92 - sep * 0.25, r: 0.25 },
          { x: 0.0, z: 0.12, y: 0.68 - sep * 0.4, r: 0.3 },
        ];

        drops.forEach((d) => {
          const cordLen = 3.2 - d.y;
          const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, cordLen, 8), metalMaterial);
          cord.position.set(d.x, d.y + cordLen * 0.5, d.z);
          chandelierRoot.add(cord);

          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 16), metalMaterial);
          cap.position.set(d.x, d.y + d.r, d.z);
          chandelierRoot.add(cap);

          const innerBulb = new THREE.Mesh(new THREE.SphereGeometry(d.r * 0.45, 16, 16), bulbMaterial);
          innerBulb.position.set(d.x, d.y, d.z);
          chandelierRoot.add(innerBulb);

          const outerGlass = new THREE.Mesh(new THREE.SphereGeometry(d.r, 24, 24), crystalMaterial);
          outerGlass.position.set(d.x, d.y, d.z);
          chandelierRoot.add(outerGlass);
        });
      } else if (arch === 'wall-sconce') {
        const sconceGroup = new THREE.Group();
        sconceGroup.position.y = 1.45;

        const backplate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.65, 0.08), metalMaterial);
        backplate.position.z = -0.22 - sep * 0.2;
        sconceGroup.add(backplate);

        const coreBulb = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.2, 16), bulbMaterial);
        sconceGroup.add(coreBulb);

        for (let i = -3; i <= 3; i++) {
          const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.42, 12), crystalMaterial);
          const angle = (i / 6) * Math.PI * 0.85;
          rod.position.set(Math.sin(angle) * 0.28, 0, Math.cos(angle) * 0.22 + sep * 0.25);
          sconceGroup.add(rod);
        }

        const topBand = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24), metalMaterial);
        topBand.position.y = 0.48;
        sconceGroup.add(topBand);

        const botBand = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24), metalMaterial);
        botBand.position.y = -0.48;
        sconceGroup.add(botBand);

        chandelierRoot.add(sconceGroup);
      }
    };

    // On-Demand Render Scheduler with Software-WebGL fence sync (`afterDraw`)
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let isDisposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const requestRender = () => {
      if (isDisposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (isDisposed) return;
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    // Build initial geometry
    buildChandelierArchetype(initialArchetype, 0);
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    // Wire external React state updates to on-demand WebGL render
    sceneControlRef.current.updateSceneConfig = (arch, fin, temp, exp) => {
      const finCfg = FINISH_CONFIGS[fin];
      metalMaterial.color.setHex(finCfg.colorHex);
      metalMaterial.roughness = finCfg.roughness;
      metalMaterial.metalness = finCfg.metalness;

      const tempCfg = TEMP_CONFIGS[temp];
      bulbMaterial.emissive.setHex(tempCfg.emissiveHex);
      chandelierGlowLight.color.setHex(tempCfg.colorHex);
      keyLight.color.setHex(tempCfg.colorHex);

      buildChandelierArchetype(arch, exp);
      requestRender();
    };

    sceneControlRef.current.resetCamera = () => {
      camera.position.set(0, 1.8, 6.2);
      controls.target.set(0, 1.4, 0);
      controls.update();
      requestRender();
    };

    controls.addEventListener('change', requestRender);

    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 300);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Push React state changes to the persistent Three.js scene
  useEffect(() => {
    sceneControlRef.current.updateSceneConfig?.(archetype, finish, temperature, exploded);
  }, [archetype, finish, temperature, exploded]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-[#C69C47]/30 bg-[#141210] ${
        compact ? 'h-[380px] sm:h-[430px]' : 'h-[480px] sm:h-[540px]'
      }`}
      data-testid="fanus-3d-showcase"
      data-archetype={archetype}
      data-finish={finish}
      data-temperature={temperature}
    >
      {/* Isolated WebGL Mount Container */}
      <div ref={canvasMountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Top-Left Minimal Spec Header Overlay (Non-obstructive) */}
      <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 rounded-md bg-[#181615]/90 px-3 py-1.5 text-xs font-medium text-[#FAF7F2] border border-[#C69C47]/30">
          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
          <span>
            Interactive 3D Fanus Studio
            <span className="hidden sm:inline"> · Drag to Rotate 360°</span>
          </span>
        </div>
        {productTitle && (
          <p className="px-1 text-xs text-[#E5DEC9]/80">{productTitle}</p>
        )}
      </div>

      {/* Top-Right Camera Reset Button */}
      <div className=" absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={() => {
            setExploded(0);
            sceneControlRef.current.resetCamera?.();
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#C69C47]/30 bg-[#181615]/90 px-3 py-1.5 text-xs font-medium text-[#FAF7F2] transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37] whitespace-nowrap shrink-0"
          aria-label="Reset 3D Camera View"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset View</span>
        </button>
      </div>

      {/* Unified Collapsible Bottom Control Dock (Zero Side-Panel Clutter, No Backdrop Blur) */}
      <div className="absolute bottom-3 left-1/2 z-10 w-[94%] max-w-[860px] -translate-x-1/2">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 border-[#C69C47]/30 bg-[#181615] px-4 py-1 text-xs font-medium text-[#E5DEC9] transition-colors hover:text-[#D4AF37] whitespace-nowrap shrink-0"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Show 3D Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {!dockCollapsed && (
          <div className="rounded-xl border border-[#C69C47]/30 bg-[#181615]/95 p-3 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* 1. 3D Design Selector (Shown on Hero; optional in compact mode) */}
              {!compact && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {ARCHETYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setArchetype(opt.id)}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        archetype === opt.id
                          ? 'bg-[#C69C47] text-[#181615] font-semibold'
                          : 'text-[#E5DEC9]/80 hover:bg-[#26221E] hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* 2. Metal Finish Swatches */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#E5DEC9]/70 whitespace-nowrap">Finish:</span>
                {(Object.keys(FINISH_CONFIGS) as FinishPreset[]).map((finKey) => {
                  const cfg = FINISH_CONFIGS[finKey];
                  return (
                    <button
                      key={finKey}
                      type="button"
                      onClick={() => setFinish(finKey)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors whitespace-nowrap shrink-0 ${
                        finish === finKey
                          ? 'border-[#D4AF37] bg-[#2A241D] text-white font-medium'
                          : 'border-white/10 text-[#E5DEC9]/75 hover:border-white/30'
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/30"
                        style={{ backgroundColor: cfg.swatch }}
                      />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 3. LED Color Temperature Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#E5DEC9]/70 whitespace-nowrap">Light:</span>
                {(Object.keys(TEMP_CONFIGS) as LightTemperature[]).map((tempKey) => (
                  <button
                    key={tempKey}
                    type="button"
                    onClick={() => setTemperature(tempKey)}
                    className={`rounded-md px-2 py-1 text-xs transition-colors whitespace-nowrap shrink-0 ${
                      temperature === tempKey
                        ? 'bg-[#D4AF37]/25 border border-[#D4AF37] text-[#FAF7F2] font-medium'
                        : 'border border-transparent text-[#E5DEC9]/75 hover:bg-[#26221E]'
                    }`}
                  >
                    {tempKey}
                  </button>
                ))}
              </div>

              {/* 4. Exploded Crystal Layer Inspection Slider */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="fanus-explode-slider"
                  className="text-[11px] text-[#E5DEC9]/70 whitespace-nowrap"
                >
                  Inspect Layers:
                </label>
                <input
                  id="fanus-explode-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={exploded}
                  onChange={(e) => setExploded(parseFloat(e.target.value))}
                  className="h-1.5 w-20 cursor-pointer accent-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
