import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RobloxPart } from "../types";
import { RotateCcw, HelpCircle, Sparkles } from "lucide-react";

// Custom high-fidelity color correction, contrast, and vignette shader
const StudioColorCorrectionShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    brightness: { value: 0.02 },
    contrast: { value: 1.06 },
    saturation: { value: 1.08 },
    vignetteDarkness: { value: 1.1 },
    vignetteOffset: { value: 1.05 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    uniform float vignetteDarkness;
    uniform float vignetteOffset;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // 1. Brightness
      color += brightness;

      // 2. Contrast
      color = (color - 0.5) * contrast + 0.5;

      // 3. Saturation (luminance mapping)
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, saturation);

      // 4. Elegant Vignette
      vec2 uv = vUv - 0.5;
      float d = length(uv);
      float vignette = smoothstep(vignetteOffset, vignetteOffset - vignetteDarkness, d);
      color *= mix(1.0, vignette, 0.45); // Smooth 45% vignette

      gl_FragColor = vec4(color, texel.a);
    }
  `
};

interface ThreeViewportProps {
  parts: RobloxPart[];
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  autoRotate: boolean;
  gridVisible: boolean;
  physicsActive: boolean;
}

export default function ThreeViewport({
  parts,
  selectedPartId,
  onSelectPart,
  autoRotate,
  gridVisible,
  physicsActive,
}: ThreeViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to keep Three.js entities
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  
  // Keep track of rendered 3D meshes: partId -> THREE.Object3D
  const meshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  // Wireframe helper for selected object
  const outlineRef = useRef<THREE.BoxHelper | null>(null);

  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [stats, setStats] = useState({ fps: 60, partCount: 0 });

  // Cinematic mode state (Bloom & custom color correction)
  const cinematicModeRef = useRef<boolean>(true);
  const [cinematicMode, setCinematicModeState] = useState<boolean>(true);

  const setCinematicMode = (val: boolean) => {
    cinematicModeRef.current = val;
    setCinematicModeState(val);
  };

  // 1. Initialize Scene, Camera, Renderer, Lights
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 300;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0A0A0A"); // Deep Pitch Black matching theme
    // Add atmospheric fog
    scene.fog = new THREE.FogExp2("#0A0A0A", 0.007);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(25, 18, 30);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Create post-processing EffectComposer pipeline
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    // Render Pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Unreal Bloom Pass (subtle futuristic neon glow)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.45,  // strength
      0.4,   // radius
      0.15   // threshold
    );
    composer.addPass(bloomPass);

    // Studio Color Correction & Vignette Shader Pass
    const colorPass = new ShaderPass(StudioColorCorrectionShader);
    composer.addPass(colorPass);

    // Output Pass
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below the ground level
    controls.minDistance = 2;
    controls.maxDistance = 150;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.45);
    scene.add(ambientLight);

    // Main Studio Sun Light
    const sunLight = new THREE.DirectionalLight("#ffd1a4", 1.1);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 180;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Warm Hemisphere light
    const hemiLight = new THREE.HemisphereLight("#8bb8ff", "#111111", 0.5);
    scene.add(hemiLight);

    // Fill Light - high-tech green tone glow
    const fillLight = new THREE.DirectionalLight("#00FF88", 0.35);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // Grid Plane (matching the brutalist grey/green design)
    const gridHelper = new THREE.GridHelper(120, 120, "#333333", "#1A1A1A");
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Selection box outline - glowing neon green outline
    const outline = new THREE.BoxHelper(new THREE.Mesh(), new THREE.Color("#00FF88"));
    scene.add(outline);
    outline.visible = false;
    outlineRef.current = outline;

    // 2. Setup Resize Observer to resize cleanly
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w && h && rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(w, h, false);
        if (composerRef.current) {
          composerRef.current.setSize(w, h);
        }
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 3. Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsUpdateTimer = 0;
    let animationFrameId: number;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Measure FPS
      const safeTime = typeof time === "number" && !isNaN(time) ? time : performance.now();
      frameCount++;
      const elapsed = safeTime - lastTime;
      fpsUpdateTimer += isNaN(elapsed) ? 0 : elapsed;
      if (fpsUpdateTimer >= 1000) {
        const calculatedFps = fpsUpdateTimer > 0 ? Math.round((frameCount * 1000) / fpsUpdateTimer) : 60;
        setStats((prev) => ({
          ...prev,
          fps: isNaN(calculatedFps) || !isFinite(calculatedFps) ? 60 : calculatedFps,
        }));
        frameCount = 0;
        fpsUpdateTimer = 0;
      }
      lastTime = safeTime;

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Handle spinning of non-anchored parts or general model rotation
      if (autoRotate && sceneRef.current) {
        meshesRef.current.forEach((mesh, partId) => {
          const part = parts.find((p) => p.id === partId);
          if (part && (part.specialType === "coin" || !part.anchored)) {
            mesh.rotation.y += 0.015;
          }
        });
      }

      // Simple physics loop for simulation
      if (physicsActive) {
        meshesRef.current.forEach((mesh, partId) => {
          const part = parts.find((p) => p.id === partId);
          if (part && !part.anchored && part.id !== "baseplate") {
            // Apply simple gravity
            const currY = mesh.position.y;
            const halfHeight = part.size[1] / 2;
            const groundY = 0;

            if (currY - halfHeight > groundY) {
              if (!part.velocity) part.velocity = [0, 0, 0];
              part.velocity[1] -= 0.015;
              
              mesh.position.y += part.velocity[1];
              mesh.position.x += part.velocity[0];
              mesh.position.z += part.velocity[2];

              // Bounce check
              if (mesh.position.y - halfHeight <= groundY) {
                mesh.position.y = groundY + halfHeight;
                part.velocity[1] = -part.velocity[1] * 0.4; // Dampened bounce
                part.velocity[0] *= 0.8;
                part.velocity[2] *= 0.8;
              }
            }
          }
        });
      }

      // Update selection box helper
      if (outlineRef.current && selectedPartId) {
        const selectedMesh = meshesRef.current.get(selectedPartId);
        if (selectedMesh) {
          outlineRef.current.setFromObject(selectedMesh);
          outlineRef.current.visible = true;
        } else {
          outlineRef.current.visible = false;
        }
      } else if (outlineRef.current) {
        outlineRef.current.visible = false;
      }

      // Render scene with optional post-processing effects
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        if (cinematicModeRef.current && composerRef.current) {
          composerRef.current.render();
        } else {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }
    };

    const handleTakeScreenshot = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current && canvasRef.current) {
        if (cinematicModeRef.current && composerRef.current) {
          composerRef.current.render();
        } else {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        try {
          const dataUrl = canvasRef.current.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `roblox_studio_screenshot_${Date.now()}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.dispatchEvent(new CustomEvent("screenshot-saved"));
        } catch (err) {
          console.error("Failed to generate screenshot:", err);
        }
      }
    };

    window.addEventListener("take-screenshot", handleTakeScreenshot);

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("take-screenshot", handleTakeScreenshot);
      if (controlsRef.current) controlsRef.current.dispose();
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [autoRotate, physicsActive, parts]);

  // 4. Update Grid Visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = gridVisible;
    }
  }, [gridVisible]);

  // 5. Build / Update 3D Geometries based on `parts` prop
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const activeIds = new Set(parts.map((p) => p.id));

    // Remove meshes that are no longer in parts
    meshesRef.current.forEach((mesh, id) => {
      if (!activeIds.has(id)) {
        scene.remove(mesh);
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        meshesRef.current.delete(id);
      }
    });

    // Add or update parts
    parts.forEach((part) => {
      let object = meshesRef.current.get(part.id);

      if (!object) {
        object = createMeshForPart(part);
        scene.add(object);
        meshesRef.current.set(part.id, object);
      } else {
        updateMeshProperties(object, part);
      }
    });

    setStats((prev) => ({ ...prev, partCount: parts.length }));
  }, [parts]);

  // Helper: Create geometry & material based on Roblox part description
  const createMeshForPart = (part: RobloxPart): THREE.Object3D => {
    let geometry: THREE.BufferGeometry;

    if (part.specialType === "custom_obj" && part.objData) {
      geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(part.objData.vertices);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      if (part.objData.faces && part.objData.faces.length > 0) {
        geometry.setIndex(part.objData.faces);
      }
      geometry.computeVertexNormals();
    } else {
      switch (part.shape) {
        case "sphere":
          geometry = new THREE.SphereGeometry(0.5, 32, 32);
          break;
        case "cylinder":
          geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
          geometry.rotateX(Math.PI / 2);
          break;
        case "wedge":
          geometry = createWedgeGeometry();
          break;
        case "block":
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
      }
    }

    const material = createMaterialForPart(part);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = part.name;
    mesh.userData = { partId: part.id };

    mesh.scale.set(part.size[0], part.size[1], part.size[2]);
    mesh.position.set(part.position[0], part.position[1], part.position[2]);

    if (part.specialType === "tree") {
      const treeGroup = new THREE.Group();
      treeGroup.name = part.name;
      treeGroup.userData = { partId: part.id };

      // Wooden trunk (Cylinder)
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 6, 16);
      const trunkMat = new THREE.MeshStandardMaterial({ color: "#5d4037", roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 3;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);

      // Leaves (Spheres stack)
      const leavesMat = new THREE.MeshStandardMaterial({ color: "#2e7d32", roughness: 0.8 });
      
      const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), leavesMat);
      leaf1.position.y = 6;
      leaf1.castShadow = true;
      treeGroup.add(leaf1);

      const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), leavesMat);
      leaf2.position.set(0.8, 7.2, 0.5);
      leaf2.castShadow = true;
      treeGroup.add(leaf2);

      const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), leavesMat);
      leaf3.position.set(-0.8, 7.5, -0.6);
      leaf3.castShadow = true;
      treeGroup.add(leaf3);

      treeGroup.position.set(part.position[0], part.position[1], part.position[2]);
      return treeGroup;
    }

    if (part.specialType === "light") {
      const lightGroup = new THREE.Group();
      lightGroup.name = part.name;
      lightGroup.userData = { partId: part.id };

      const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 8, 12);
      const poleMat = new THREE.MeshStandardMaterial({ color: "#37474f", roughness: 0.5 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 4;
      pole.castShadow = true;
      lightGroup.add(pole);

      const bulbGeo = new THREE.SphereGeometry(0.6, 16, 16);
      const bulbMat = new THREE.MeshBasicMaterial({ color: "#00FF88" });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(0, 8, 0.5);
      lightGroup.add(bulb);

      const pointLight = new THREE.PointLight("#00FF88", 2, 18);
      pointLight.position.set(0, 7.8, 0.5);
      pointLight.castShadow = true;
      lightGroup.add(pointLight);

      lightGroup.position.set(part.position[0], part.position[1], part.position[2]);
      return lightGroup;
    }

    return mesh;
  };

  // Helper: Update existing mesh transforms and materials
  const updateMeshProperties = (obj: THREE.Object3D, part: RobloxPart) => {
    if (part.specialType !== "tree" && part.specialType !== "light") {
      obj.scale.set(part.size[0], part.size[1], part.size[2]);
    }
    obj.position.set(part.position[0], part.position[1], part.position[2]);

    if (obj instanceof THREE.Mesh) {
      const mat = createMaterialForPart(part);
      obj.material.dispose();
      obj.material = mat;
    }
  };

  // Helper: Create custom wedge geometry (triangular prism)
  const createWedgeGeometry = (): THREE.BufferGeometry => {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.5, -0.5,  0.5,  // 0
       0.5, -0.5,  0.5,  // 1
      -0.5,  0.5,  0.5,  // 2

      -0.5, -0.5, -0.5,  // 3
       0.5, -0.5, -0.5,  // 4
      -0.5,  0.5, -0.5,  // 5
    ]);

    const indices = [
      0, 1, 2,
      5, 4, 3,
      0, 3, 4,
      0, 4, 1,
      1, 4, 5,
      1, 5, 2,
      2, 5, 3,
      2, 3, 0
    ];

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  };

  // Helper: Create rich material mappings mirroring Roblox Studio
  const createMaterialForPart = (part: RobloxPart): THREE.Material => {
    const baseColor = new THREE.Color(part.color);

    const standardConfig: THREE.MeshStandardMaterialParameters = {
      color: baseColor,
      transparent: part.transparency > 0,
      opacity: 1 - part.transparency,
    };

    switch (part.material) {
      case "SmoothPlastic":
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          roughness: 0.1,
          metalness: 0.05,
        });

      case "Wood":
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          roughness: 0.85,
          metalness: 0.0,
        });

      case "Slate":
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          roughness: 0.95,
          metalness: 0.1,
        });

      case "Metal":
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          roughness: 0.25,
          metalness: 0.9,
        });

      case "Glass":
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          roughness: 0.1,
          metalness: 0.1,
          transparent: true,
          opacity: Math.max(0.2, 1 - part.transparency),
        });

      case "Grass":
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          roughness: 0.9,
          metalness: 0.0,
        });

      case "Ice":
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          roughness: 0.02,
          metalness: 0.15,
          transparent: true,
          opacity: 0.85,
        });

      case "Neon":
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          emissive: baseColor,
          emissiveIntensity: 1.5,
          roughness: 0.1,
        });

      case "Plastic":
      default:
        return new THREE.MeshStandardMaterial({
          ...standardConfig,
          roughness: 0.5,
          metalness: 0.1,
        });
    }
  };

  // 6. Handle Raycasting on Canvas Click to Select Item
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const targetMeshes: THREE.Object3D[] = [];
    meshesRef.current.forEach((mesh) => {
      targetMeshes.push(mesh);
    });

    const intersects = raycaster.intersectObjects(targetMeshes, true);

    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      while (hitObj && !hitObj.userData.partId) {
        hitObj = hitObj.parent;
      }

      if (hitObj && hitObj.userData.partId) {
        const id = hitObj.userData.partId;
        const part = parts.find((p) => p.id === id);
        if (part && !part.locked) {
          onSelectPart(id);
        } else {
          onSelectPart(null);
        }
      } else {
        onSelectPart(null);
      }
    } else {
      onSelectPart(null);
    }
  };

  // 7. Handle Mouse Move for Hover Info
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const targetMeshes: THREE.Object3D[] = [];
    meshesRef.current.forEach((mesh) => {
      targetMeshes.push(mesh);
    });

    const intersects = raycaster.intersectObjects(targetMeshes, true);

    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      while (hitObj && !hitObj.userData.partId) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData.partId) {
        const part = parts.find((p) => p.id === hitObj.userData.partId);
        if (part) {
          setHoveredInfo(`${part.name} [${part.material}]`);
          return;
        }
      }
    }
    setHoveredInfo(null);
  };

  // 8. Action: Center camera on selected or spawn
  const resetCamera = () => {
    if (!controlsRef.current || !cameraRef.current) return;

    if (selectedPartId) {
      const selectedMesh = meshesRef.current.get(selectedPartId);
      if (selectedMesh) {
        const pos = selectedMesh.position;
        cameraRef.current.position.set(pos.x + 10, pos.y + 8, pos.z + 10);
        controlsRef.current.target.set(pos.x, pos.y, pos.z);
        controlsRef.current.update();
        return;
      }
    }

    cameraRef.current.position.set(25, 18, 30);
    controlsRef.current.target.set(0, 2, 0);
    controlsRef.current.update();
  };

  // Listen to a custom global event to focus on the selected object from other panels (e.g., PropertiesPanel)
  useEffect(() => {
    const handleFocus = () => {
      resetCamera();
    };
    window.addEventListener("focus-selected-object", handleFocus);
    return () => {
      window.removeEventListener("focus-selected-object", handleFocus);
    };
  }, [selectedPartId, resetCamera]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[300px] select-none group" id="three-viewport-container">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Floating Roblox Studio HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none flex justify-between items-start">
        {/* Left Stats Indicator */}
        <div className="bg-dark/80 backdrop-blur-md border border-border-custom px-3 py-1.5 rounded flex items-center gap-3 text-xs text-white shadow-lg pointer-events-auto font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="tracking-wider uppercase text-[10px]">VIEWPORT_ACTIVE</span>
          </div>
          <div className="w-px h-3 bg-border-custom" />
          <div className="text-[10px]">Деталей: <span className="font-bold text-brand">{stats.partCount}</span></div>
          <div className="w-px h-3 bg-border-custom" />
          <div className="text-[10px]">FPS: <span className="font-bold text-brand">{stats.fps}</span></div>
        </div>

        {/* Right Camera Actions */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setCinematicMode(!cinematicMode)}
            title={cinematicMode ? "Вимкнути кінематографічні шейдери" : "Увімкнути кінематографічні шейдери (Bloom, Contrast)"}
            className={`p-2 backdrop-blur-md border rounded transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
              cinematicMode
                ? "bg-brand/15 border-brand text-brand hover:bg-brand/25 shadow-[0_0_10px_rgba(0,162,255,0.25)]"
                : "bg-dark/80 border-border-custom text-text-dim hover:text-white hover:border-white/20"
            }`}
            id="btn-viewport-toggle-shaders"
          >
            <Sparkles className={`w-3.5 h-3.5 ${cinematicMode ? "animate-pulse text-brand" : "text-text-dim"}`} />
            <span>ШЕЙДЕРИ: {cinematicMode ? "УВІМК" : "ВИМК"}</span>
          </button>

          <button
            onClick={resetCamera}
            title="Сфокусувати камеру"
            className="p-2 bg-dark/80 backdrop-blur-md border border-border-custom text-white hover:border-brand hover:text-brand rounded transition-all cursor-pointer"
            id="btn-viewport-reset-cam"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom status displays */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-between items-center text-xs text-white/50 font-mono">
        <div className="bg-dark/80 backdrop-blur-md border border-border-custom px-3 py-1.5 rounded text-[10px] text-text-mid pointer-events-auto max-w-[280px] truncate uppercase tracking-wide">
          {hoveredInfo ? hoveredInfo : "Наведіть мишу на деталь"}
        </div>
        <div className="bg-dark/80 backdrop-blur-md border border-border-custom px-3 py-1.5 rounded flex items-center gap-2 pointer-events-auto text-[9px] uppercase tracking-wider text-text-dim">
          <HelpCircle className="w-3.5 h-3.5 text-brand" />
          <span>ЛКМ — Оберт | ПКМ — Панорама | Wheel — Zoom</span>
        </div>
      </div>

      {/* Grid Status Indicator */}
      {!gridVisible && (
        <div className="absolute top-16 left-4 bg-brand-dim border border-brand/20 text-brand text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded pointer-events-none">
          СІТКА ПРИХОВАНА
        </div>
      )}
    </div>
  );
}
