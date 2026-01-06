import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

// Cyberpunk / AI-inspired 3D background
// - Particles + a few accent meshes
// - Mouse-tracking parallax with smoothing
// - Reduced motion / low-power fallbacks
// - Toggle control to disable background (persists in localStorage)

(function initThreeBg() {
  try {
    const disabled = localStorage.getItem('bg-disabled') === '1';
    if (disabled) {
      document.body.classList.add('three-bg-disabled');
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    const deviceMemory = navigator.deviceMemory || 4;
    const effectiveType = navigator.connection && navigator.connection.effectiveType;
    const isLowPower = !!saveData || deviceMemory < 2 || (effectiveType && (effectiveType === '2g' || effectiveType === 'slow-2g'));
    const smallScreen = window.innerWidth < 780;

    // particle count adaptively chosen
    const BASE_COUNT = isLowPower || smallScreen ? 120 : 420;
    const COUNT = Math.max(48, BASE_COUNT);

    const container = document.getElementById('three-bg-root') || document.createElement('div');
    container.id = 'three-bg-root';
    if (!container.parentElement) document.body.prepend(container);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isLowPower });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050612, 0.0025);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 0, 120);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.4);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // helper: small circular texture for points (soft glow)
    function makeSprite() {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(size/2, size/2, 2, size/2, size/2, size/2);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.2, 'rgba(145,210,255,0.75)');
      grad.addColorStop(0.45, 'rgba(80,90,255,0.28)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,size,size);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    const sprite = makeSprite();

    // Points system
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const basePositions = [];

    function randRange(a, b) { return a + Math.random() * (b - a); }

    for (let i = 0; i < COUNT; i++) {
      const phi = Math.random() * Math.PI * 2;
      const costheta = (Math.random() * 2) - 1;
      const u = Math.random();
      const r = Math.cbrt(u) * randRange(40, 220);
      const x = r * Math.cos(phi) * Math.sqrt(1 - costheta * costheta);
      const y = r * costheta;
      const z = r * Math.sin(phi) * Math.sqrt(1 - costheta * costheta);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions.push([x, y, z]);

      const t = i / COUNT;
      // gradient between neon colors (blue -> purple -> magenta)
      const c1 = new THREE.Color(0x59d6ff).lerp(new THREE.Color(0x6b5bff), t);
      const c2 = c1.lerp(new THREE.Color(0xff3d7f), Math.sin(t * Math.PI));

      colors[i * 3] = c2.r;
      colors[i * 3 + 1] = c2.g;
      colors[i * 3 + 2] = c2.b;

      scales[i] = randRange(isLowPower ? 0.6 : 0.8, isLowPower ? 1.6 : 2.6);
      speeds[i] = randRange(0.2, 1.2);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      size: isLowPower ? 2.0 : 4.0,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Accent mesh group (few low-poly shapes)
    const accentGroup = new THREE.Group();
    const accentGeometry = new THREE.IcosahedronGeometry(5, 0);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x6b5bff, roughness: 0.35, metalness: 0.3 });
    const ACCENTS = isLowPower ? 6 : 14;
    for (let i = 0; i < ACCENTS; i++) {
      const m = new THREE.Mesh(accentGeometry, accentMat.clone());
      const s = randRange(0.6, 2.6);
      m.scale.setScalar(s);
      const px = randRange(-120, 120);
      const py = randRange(-80, 90);
      const pz = randRange(-60, 120);
      m.position.set(px, py, pz);
      m.material.emissive = new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.7, 0.5);
      m.material.emissiveIntensity = 0.9;
      accentGroup.add(m);
    }
    scene.add(accentGroup);

    // Parallax target and smoothing
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    const motionAllowed = !prefersReduced && !smallScreen;
    const lerp = (a, b, t) => a + (b - a) * t;

    function onPointerMove(e) {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetX = x * 0.15;
      targetY = y * 0.12;
    }

    if (motionAllowed) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
      }, { passive: true });
    }

    let running = true;
    let lastTime = performance.now();

    function animate(now) {
      if (!running) return;
      const dt = (now - lastTime) * 0.001;
      lastTime = now;

      // smooth camera/group shift
      mouseX = lerp(mouseX, targetX, 0.06);
      mouseY = lerp(mouseY, targetY, 0.06);

      const rotationX = mouseY * 0.5;
      const rotationY = mouseX * 0.8;

      points.rotation.y += 0.01 * dt * 60;
      points.rotation.x = lerp(points.rotation.x, rotationX, 0.02);
      points.rotation.y = lerp(points.rotation.y, rotationY + points.rotation.y, 0.02);

      accentGroup.rotation.x = lerp(accentGroup.rotation.x, rotationX * 0.2, 0.02);
      accentGroup.rotation.y = lerp(accentGroup.rotation.y, rotationY * 0.2, 0.02);

      // update particles positions subtly
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        const base = basePositions[i];
        const speed = speeds[i];
        const t = now * 0.0002 * speed;
        pos[i * 3 + 0] = base[0] + Math.sin(t + i) * (1.6 + Math.sin(i) * 0.6);
        pos[i * 3 + 1] = base[1] + Math.cos(t * 0.8 + i) * (1.2 + Math.cos(i) * 0.5);
        pos[i * 3 + 2] = base[2] + Math.sin(t * 0.6 + i) * (1.0 + Math.sin(i * 0.5) * 0.4);
      }
      geometry.attributes.position.needsUpdate = true;

      // subtle accent rotation
      accentGroup.children.forEach((m, idx) => {
        m.rotation.x += 0.001 + idx * 0.0001;
        m.rotation.y += 0.0012 + idx * 0.00005;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    // start/stop controls
    function start() {
      if (!running) {
        running = true;
        lastTime = performance.now();
        requestAnimationFrame(animate);
      }
    }
    function stop() { running = false; }

    // Respect page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    // Pause when not in viewport (heuristic)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) start(); else stop();
      });
    }, { root: null, threshold: 0 });
    io.observe(container);

    // Resize handling
    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize, { passive: true });

    // Create a small toggle control
    const toggle = document.createElement('button');
    toggle.className = 'bg-toggle';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', 'Toggle background animations');
    toggle.textContent = 'Background: On';
    toggle.addEventListener('click', () => {
      const isOff = localStorage.getItem('bg-disabled') === '1';
      if (!isOff) {
        localStorage.setItem('bg-disabled', '1');
        // graceful stop
        stop();
        container.style.display = 'none';
        toggle.textContent = 'Background: Off';
        toggle.setAttribute('aria-pressed', 'true');
      } else {
        localStorage.removeItem('bg-disabled');
        container.style.display = '';
        toggle.textContent = 'Background: On';
        toggle.setAttribute('aria-pressed', 'false');
        start();
      }
    });
    document.body.appendChild(toggle);

    // Initial reduced-motion behavior: if reduced, render one frame and stop
    if (prefersReduced || isLowPower) {
      renderer.render(scene, camera);
    } else {
      requestAnimationFrame(animate);
    }

    // expose for debugging / further control
    window.__threeBg = { start, stop, renderer, scene, camera };
  } catch (err) {
    console.error('three-bg failed to initialize', err);
  }
})();
