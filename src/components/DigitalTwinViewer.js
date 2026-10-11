import * as THREE from 'three';

export function createDigitalTwinViewer(containerElement, options = {}) {
  if (!containerElement) return;

  const width = containerElement.clientWidth || 800;
  const height = containerElement.clientHeight || 500;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x101415, 0.04);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(10, 8, 12);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  containerElement.replaceChildren(renderer.domElement);

  // Group root
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // Materials
  const tealWireframeMat = new THREE.MeshBasicMaterial({
    color: 0x44e2cd,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });

  const glassMat = new THREE.MeshPhongMaterial({
    color: 0x19ffdf,
    transparent: true,
    opacity: 0.22,
    shininess: 90,
    reflectivity: 0.9
  });

  const floorMat = new THREE.MeshPhongMaterial({
    color: 0x1d2022,
    transparent: true,
    opacity: 0.85
  });

  const glowingTealMat = new THREE.MeshBasicMaterial({
    color: 0x62fae3
  });

  // Base platform / Ground
  const groundGeom = new THREE.BoxGeometry(12, 0.3, 10);
  const groundMesh = new THREE.Mesh(groundGeom, floorMat);
  groundMesh.position.y = -0.15;
  rootGroup.add(groundMesh);

  // Grid Helper
  const grid = new THREE.GridHelper(14, 20, 0x44e2cd, 0x272a2c);
  grid.position.y = -0.01;
  rootGroup.add(grid);

  // Level 1: Main Living & Terrace
  const level1Group = new THREE.Group();
  rootGroup.add(level1Group);

  const l1MainGeom = new THREE.BoxGeometry(6, 2.4, 6);
  const l1Main = new THREE.Mesh(l1MainGeom, glassMat);
  l1Main.position.set(-1, 1.2, 0);
  level1Group.add(l1Main);

  const l1Frame = new THREE.Mesh(l1MainGeom, tealWireframeMat);
  l1Frame.position.copy(l1Main.position);
  level1Group.add(l1Frame);

  // Infinity Pool Cantilever
  const poolGeom = new THREE.BoxGeometry(4, 0.6, 3);
  const poolMesh = new THREE.Mesh(poolGeom, new THREE.MeshPhongMaterial({
    color: 0x03c6b2,
    transparent: true,
    opacity: 0.6
  }));
  poolMesh.position.set(3.5, 0.3, 1.5);
  level1Group.add(poolMesh);

  // Level 2: Master Suite Cantilever
  const level2Group = new THREE.Group();
  rootGroup.add(level2Group);

  const l2Geom = new THREE.BoxGeometry(5.5, 2.2, 5);
  const l2Mesh = new THREE.Mesh(l2Geom, glassMat);
  l2Mesh.position.set(0.5, 3.5, -0.5);
  level2Group.add(l2Mesh);

  const l2Frame = new THREE.Mesh(l2Geom, tealWireframeMat);
  l2Frame.position.copy(l2Mesh.position);
  level2Group.add(l2Frame);

  // Level 3: Rooftop Solar & Observatory Pavilion
  const level3Group = new THREE.Group();
  rootGroup.add(level3Group);

  const l3Geom = new THREE.CylinderGeometry(2, 2.4, 1.2, 8);
  const l3Mesh = new THREE.Mesh(l3Geom, glassMat);
  l3Mesh.position.set(-0.5, 5.2, -0.5);
  level3Group.add(l3Mesh);

  const l3Frame = new THREE.Mesh(l3Geom, tealWireframeMat);
  l3Frame.position.copy(l3Mesh.position);
  level3Group.add(l3Frame);

  // Hotspot Sensor Nodes
  const hotspots = [
    { name: "Infinity Pool Sensor", pos: new THREE.Vector3(3.5, 1.0, 1.5), stat: "Water: 82°F • Clarity 99.8%" },
    { name: "Grand Salon Climate", pos: new THREE.Vector3(-1, 2.0, 0), stat: "Temp: 71.4°F • Humidity 42%" },
    { name: "Master Suite Biometrics", pos: new THREE.Vector3(0.5, 4.2, -0.5), stat: "Acoustic: 22dB • Air Index: 99%" },
    { name: "Rooftop Solar Array", pos: new THREE.Vector3(-0.5, 6.0, -0.5), stat: "Yield: 14.8 kW • Efficiency 98%" }
  ];

  const nodeMeshes = [];
  hotspots.forEach(h => {
    const sphereGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const sphere = new THREE.Mesh(sphereGeom, glowingTealMat);
    sphere.position.copy(h.pos);
    sphere.userData = h;
    rootGroup.add(sphere);
    nodeMeshes.push(sphere);

    // Outer pulse ring
    const ringGeom = new THREE.RingGeometry(0.24, 0.3, 24);
    const ring = new THREE.Mesh(ringGeom, tealWireframeMat);
    ring.position.copy(h.pos);
    ring.rotation.x = Math.PI / 2;
    rootGroup.add(ring);
  });

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x62fae3, 1.8);
  dirLight.position.set(10, 20, 15);
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0x03c6b2, 2, 25);
  pointLight.position.set(0, 4, 0);
  scene.add(pointLight);

  camera.lookAt(0, 2.5, 0);

  // Interactive mouse drag control
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let targetRotationY = 0.5;
  let targetRotationX = 0.2;
  let currentRotationY = 0.5;
  let currentRotationX = 0.2;

  const onPointerDown = (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    targetRotationY += deltaX * 0.008;
    targetRotationX = Math.max(-0.2, Math.min(1.2, targetRotationX + deltaY * 0.008));
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  const dom = renderer.domElement;
  dom.style.cursor = 'grab';
  dom.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // Zoom on wheel
  const onWheel = (e) => {
    e.preventDefault();
    camera.position.z = Math.max(6, Math.min(22, camera.position.z + e.deltaY * 0.01));
  };
  dom.addEventListener('wheel', onWheel, { passive: false });

  // Resize handler
  const onResize = () => {
    const w = containerElement.clientWidth || 800;
    const h = containerElement.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  let animId;
  let clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (!isDragging) {
      targetRotationY += 0.003;
    }

    currentRotationY += (targetRotationY - currentRotationY) * 0.08;
    currentRotationX += (targetRotationX - currentRotationX) * 0.08;

    rootGroup.rotation.y = currentRotationY;
    rootGroup.rotation.x = currentRotationX;

    // Node pulse animation
    nodeMeshes.forEach((mesh, idx) => {
      const scale = 1 + 0.25 * Math.sin(elapsedTime * 4 + idx);
      mesh.scale.set(scale, scale, scale);
    });

    renderer.render(scene, camera);
  }

  animate();

  return {
    setFloorFocus: (floor) => {
      if (floor === 'ground') {
        level1Group.visible = true;
        level2Group.visible = false;
        level3Group.visible = false;
      } else if (floor === 'penthouse') {
        level1Group.visible = true;
        level2Group.visible = true;
        level3Group.visible = false;
      } else if (floor === 'rooftop') {
        level1Group.visible = true;
        level2Group.visible = true;
        level3Group.visible = true;
      } else {
        level1Group.visible = true;
        level2Group.visible = true;
        level3Group.visible = true;
      }
    },
    toggleWireframe: (wireframeOnly) => {
      glassMat.visible = !wireframeOnly;
    },
    destroy: () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
