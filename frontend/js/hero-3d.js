/**
 * Pulse AI — Three.js Hero Scene
 *
 * Inspired by: Stripe (gradient mesh), Linear (floating geometry),
 * Apple (product showcase depth), Vercel (particle fields)
 *
 * Creates a medical-themed 3D scene with:
 * - Rotating DNA double helix
 * - Floating particle field
 * - Mouse-reactive depth
 * - Smooth camera movement
 */
(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ─── Scene Setup ─────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  camera.position.z = 30;
  camera.position.y = 2;

  // ─── Mouse Tracking ──────────────────────────────────────
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  document.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // ─── DNA Double Helix ────────────────────────────────────
  // Inspired by medical/science websites and biotech landing pages
  const helixGroup = new THREE.Group();
  const helixRadius = 3;
  const helixHeight = 20;
  const helixTurns = 4;
  const helixPoints = 80;

  // Strand material
  const strandMaterial = new THREE.MeshBasicMaterial({
    color: 0xDC2F3D,
    transparent: true,
    opacity: 0.6,
  });

  const strandMaterial2 = new THREE.MeshBasicMaterial({
    color: 0xDC2F3D,
    transparent: true,
    opacity: 0.4,
  });

  // Nucleotide material
  const nucleotideMaterial = new THREE.MeshBasicMaterial({
    color: 0xDC2F3D,
    transparent: true,
    opacity: 0.3,
  });

  // Bond material
  const bondMaterial = new THREE.LineBasicMaterial({
    color: 0xDC2F3D,
    transparent: true,
    opacity: 0.15,
  });

  // Create strand points
  const strand1Points = [];
  const strand2Points = [];
  const nucleotides = [];
  const bonds = [];

  for (let i = 0; i <= helixPoints; i++) {
    const t = i / helixPoints;
    const angle = t * Math.PI * 2 * helixTurns;
    const y = (t - 0.5) * helixHeight;

    // Strand 1
    const x1 = Math.cos(angle) * helixRadius;
    const z1 = Math.sin(angle) * helixRadius;
    strand1Points.push(new THREE.Vector3(x1, y, z1));

    // Strand 2 (offset by PI)
    const x2 = Math.cos(angle + Math.PI) * helixRadius;
    const z2 = Math.sin(angle + Math.PI) * helixRadius;
    strand2Points.push(new THREE.Vector3(x2, y, z2));

    // Nucleotide dots
    if (i % 4 === 0) {
      const sphereGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const sphere1 = new THREE.Mesh(sphereGeo, nucleotideMaterial);
      sphere1.position.set(x1, y, z1);
      helixGroup.add(sphere1);
      nucleotides.push(sphere1);

      const sphere2 = new THREE.Mesh(sphereGeo, nucleotideMaterial);
      sphere2.position.set(x2, y, z2);
      helixGroup.add(sphere2);
      nucleotides.push(sphere2);

      // Connecting bond (rungs of the ladder)
      if (i % 8 === 0) {
        const bondGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, y, z1),
          new THREE.Vector3(x2, y, z2),
        ]);
        const bond = new THREE.Line(bondGeo, bondMaterial);
        helixGroup.add(bond);
        bonds.push(bond);
      }
    }
  }

  // Create strand lines
  const strand1Geo = new THREE.BufferGeometry().setFromPoints(strand1Points);
  const strand1 = new THREE.Line(strand1Geo, strandMaterial);
  helixGroup.add(strand1);

  const strand2Geo = new THREE.BufferGeometry().setFromPoints(strand2Points);
  const strand2 = new THREE.Line(strand2Geo, strandMaterial2);
  helixGroup.add(strand2);

  helixGroup.position.set(12, 0, -5);
  helixGroup.rotation.x = 0.3;
  scene.add(helixGroup);

  // ─── Floating Particle Field ─────────────────────────────
  // Inspired by Vercel/Linear particle backgrounds
  const particleCount = 200;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const particleSpeeds = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
    sizes[i] = Math.random() * 2 + 0.5;
    particleSpeeds.push({
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01 + 0.005,
      z: (Math.random() - 0.5) * 0.005,
    });
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xDC2F3D,
    transparent: true,
    opacity: 0.4,
    size: 0.15,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // ─── Floating Rings (Medical/Science Aesthetic) ──────────
  const rings = [];
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xDC2F3D,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 4; i++) {
    const ringGeo = new THREE.RingGeometry(2 + i * 1.5, 2.1 + i * 1.5, 64);
    const ring = new THREE.Mesh(ringGeo, ringMaterial.clone());
    ring.position.set(-10 + i * 3, -5 + i * 2, -15 - i * 3);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    scene.add(ring);
    rings.push({ mesh: ring, speed: 0.001 + Math.random() * 0.002, axis: Math.random() > 0.5 ? 'x' : 'y' });
  }

  // ─── Connection Lines (Network Effect) ───────────────────
  // Inspired by tech company network visualizations
  const connectionGroup = new THREE.Group();
  const connectionMaterial = new THREE.LineBasicMaterial({
    color: 0xDC2F3D,
    transparent: true,
    opacity: 0.06,
  });

  const connectionPoints = [];
  for (let i = 0; i < 15; i++) {
    connectionPoints.push({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 20 - 10,
    });
  }

  // Draw connections between nearby points
  for (let i = 0; i < connectionPoints.length; i++) {
    for (let j = i + 1; j < connectionPoints.length; j++) {
      const dx = connectionPoints[i].x - connectionPoints[j].x;
      const dy = connectionPoints[i].y - connectionPoints[j].y;
      const dz = connectionPoints[i].z - connectionPoints[j].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 15) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(connectionPoints[i].x, connectionPoints[i].y, connectionPoints[i].z),
          new THREE.Vector3(connectionPoints[j].x, connectionPoints[j].y, connectionPoints[j].z),
        ]);
        const line = new THREE.Line(lineGeo, connectionMaterial);
        connectionGroup.add(line);
      }
    }
  }

  scene.add(connectionGroup);

  // ─── Gradient Mesh Sphere (Stripe-inspired) ──────────────
  const gradientSphereGeo = new THREE.SphereGeometry(8, 32, 32);
  const gradientSphereMat = new THREE.MeshBasicMaterial({
    color: 0xDC2F3D,
    transparent: true,
    opacity: 0.03,
    wireframe: true,
  });
  const gradientSphere = new THREE.Mesh(gradientSphereGeo, gradientSphereMat);
  gradientSphere.position.set(-15, 5, -20);
  scene.add(gradientSphere);

  // ─── Animation Loop ──────────────────────────────────────
  let time = 0;
  let isVisible = true;

  // Pause when not visible
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
    },
    { threshold: 0 }
  );
  visibilityObserver.observe(canvas);

  function animate() {
    if (!isVisible) {
      requestAnimationFrame(animate);
      return;
    }

    time += 0.005;

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Rotate DNA helix
    helixGroup.rotation.y += 0.003;
    helixGroup.position.x = 12 + Math.sin(time) * 2;
    helixGroup.position.y = Math.cos(time * 0.5) * 1;

    // Pulse nucleotides
    nucleotides.forEach((n, i) => {
      const scale = 1 + Math.sin(time * 2 + i * 0.5) * 0.3;
      n.scale.setScalar(scale);
    });

    // Animate particles
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += particleSpeeds[i].x;
      pos[i * 3 + 1] += particleSpeeds[i].y;
      pos[i * 3 + 2] += particleSpeeds[i].z;

      // Wrap around
      if (pos[i * 3 + 1] > 20) pos[i * 3 + 1] = -20;
      if (pos[i * 3] > 30) pos[i * 3] = -30;
      if (pos[i * 3] < -30) pos[i * 3] = 30;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Rotate rings
    rings.forEach((r) => {
      if (r.axis === 'x') r.mesh.rotation.x += r.speed;
      else r.mesh.rotation.y += r.speed;
    });

    // Rotate gradient sphere
    gradientSphere.rotation.x += 0.001;
    gradientSphere.rotation.y += 0.002;

    // Mouse-reactive camera
    camera.position.x = mouse.x * 3;
    camera.position.y = 2 + mouse.y * 2;
    camera.lookAt(0, 0, -5);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // ─── Resize Handler ──────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
