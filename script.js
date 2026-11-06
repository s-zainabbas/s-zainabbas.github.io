const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';

document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
    initParticles();
    init3DScene();
    initNavScrollEffects();
    initScrollProgress();
    initScrollSpy();
    initRevealAnimations();
    initCardTilt();
    initHeroParallax();
    initStatCounters();
    initLifePreview();
    initStockPreview();
    initDashboardPreview();
    initMobileMenu();
    initSmoothAnchorScroll();
    initContactForm();
    initCopyEmail();
    initBackToTop();
    initFooterYear();
});

// ---------- Theme toggle (light / dark) ----------
// The initial theme is set by the inline script in <head> before first paint.
// This handles the button, saves the choice, follows the system setting until
// the visitor picks one, and fires a 'themechange' event for the canvas visuals.
function initThemeToggle() {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    const readSaved = () => {
        try { return localStorage.getItem('theme'); } catch (e) { return null; }
    };

    const syncButton = () => {
        if (btn) btn.setAttribute('aria-label', isDarkTheme() ? 'Switch to light mode' : 'Switch to dark mode');
    };

    const applyTheme = (theme, animate) => {
        if (animate && !prefersReducedMotion) {
            root.classList.add('theme-transition');
            setTimeout(() => root.classList.remove('theme-transition'), 450);
        }
        root.setAttribute('data-theme', theme);
        syncButton();
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    };

    syncButton();

    if (btn) {
        btn.addEventListener('click', () => {
            const next = isDarkTheme() ? 'light' : 'dark';
            try { localStorage.setItem('theme', next); } catch (e) { /* private mode: theme just won't persist */ }
            applyTheme(next, true);
        });
    }

    systemDark.addEventListener('change', (e) => {
        if (!readSaved()) applyTheme(e.matches ? 'dark' : 'light', true);
    });
}

// ---------- Particles background ----------
// Ambient brand visual: kept alive even under prefers-reduced-motion (just calmer),
// since it's the portfolio's signature look rather than a functional UI animation.
function initParticles() {
    if (typeof particlesJS === 'undefined') return;

    const particleCount = window.innerWidth < 768 ? 85 : 190;
    const themeColor = () => (isDarkTheme() ? '#ffffff' : '#000000');

    particlesJS('particles-js', {
        particles: {
            number: { value: particleCount, density: { enable: true, value_area: 850 } },
            color: { value: themeColor() },
            shape: { type: 'circle' },
            opacity: {
                value: 0.45,
                random: true,
                anim: { enable: true, speed: 0.4, opacity_min: 0.1, sync: false }
            },
            size: { value: 2.5, random: true },
            line_linked: { enable: true, distance: 160, color: themeColor(), opacity: 0.18, width: 1 },
            move: {
                enable: true,
                speed: 1.1,
                direction: 'none',
                // false = each particle keeps a steady drift direction instead of
                // randomly jerking to a new vector every so often — reads as smooth
                // flow rather than jittery/rigid movement
                random: false,
                straight: false,
                out_mode: 'out'
            }
        },
        interactivity: {
            // 'window' (not 'canvas') so hovering anywhere on the page reacts — the canvas
            // sits behind all page content, so canvas-only detection barely ever fires.
            detect_on: 'window',
            events: {
                onhover: { enable: !isTouchDevice, mode: 'grab' },
                onclick: { enable: !isTouchDevice, mode: 'push' },
                resize: true
            },
            modes: {
                grab: { distance: 170, line_linked: { opacity: 0.7 } },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });

    // Recolour the running particles in place on theme change (no restart or flicker)
    document.addEventListener('themechange', () => {
        const pJS = window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS;
        if (!pJS) return;
        const hex = themeColor();
        const rgb = isDarkTheme() ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
        pJS.particles.color.value = hex; // used for particles added later by clicks
        pJS.particles.line_linked.color_rgb_line = rgb;
        pJS.particles.array.forEach(p => { p.color.rgb = { ...rgb }; });
    });
}

// ---------- 3D hero scene ----------
// Signature brand visual — stays alive under prefers-reduced-motion (just calmer,
// via slower rotation speeds below) rather than being hidden entirely.
function init3DScene() {
    const container = document.getElementById('3d-container');
    if (!container || typeof THREE === 'undefined') return;

    const getSize = () => ({
        width: Math.max(container.clientWidth, 280),
        height: Math.max(container.clientHeight, 280)
    });

    const scene = new THREE.Scene();
    scene.background = null;

    let { width, height } = getSize();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-1, -0.5, -1);
    scene.add(rimLight);

    // Wireframe shell — just the sphere, no solid core
    const outerGeometry = new THREE.IcosahedronGeometry(2.5, 3);
    const outerMaterial = new THREE.MeshPhongMaterial({
        color: isDarkTheme() ? 0xffffff : 0x000000,
        wireframe: true,
        transparent: true,
        opacity: isDarkTheme() ? 0.22 : 0.32
    });
    const techSphere = new THREE.Mesh(outerGeometry, outerMaterial);
    scene.add(techSphere);

    // Glowing digit texture: soft, restrained halo behind a crisp digit — enough to
    // read as "glowing" without looking neon
    const GLOW_COLOR = '#e63946';
    function createDigitTexture(digit, dark) {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, GLOW_COLOR + '55');
        gradient.addColorStop(0.5, GLOW_COLOR + '14');
        gradient.addColorStop(1, GLOW_COLOR + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        ctx.font = '700 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = GLOW_COLOR;
        ctx.shadowBlur = 9;
        ctx.fillStyle = dark ? '#e5e7eb' : '#1f2937';
        ctx.fillText(digit, size / 2, size / 2);
        ctx.shadowBlur = 0;
        ctx.fillText(digit, size / 2, size / 2);

        return new THREE.CanvasTexture(canvas);
    }

    // Only two digits exist, so build each texture once per theme and share it
    const textureCache = {};
    const getDigitTexture = (digit) => {
        const dark = isDarkTheme();
        const key = digit + (dark ? '-dark' : '-light');
        if (!textureCache[key]) textureCache[key] = createDigitTexture(digit, dark);
        return textureCache[key];
    };

    // Binary digits, distributed in a spherical shell around the sphere so they read
    // as an orbiting, glowing "data" halo rather than a random cube of noise. Radius
    // range is kept well inside the camera frustum (see camera.position.z below) so
    // nothing gets clipped at the edges as the halo rotates.
    const binaryGroup = new THREE.Group();
    const binaryDigits = ['0', '1'];
    const particlesCount = window.innerWidth < 768 ? 90 : 170;
    const sprites = [];
    const RADIUS_MIN = 2.5;
    const RADIUS_SPAN = 0.9;

    for (let i = 0; i < particlesCount; i++) {
        const digit = binaryDigits[Math.floor(Math.random() * binaryDigits.length)];
        const texture = getDigitTexture(digit);

        // Spherical-shell placement: radius varies slightly so the halo has thickness
        const radius = RADIUS_MIN + Math.random() * RADIUS_SPAN;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const baseX = radius * Math.sin(phi) * Math.cos(theta);
        const baseY = radius * Math.sin(phi) * Math.sin(theta);
        const baseZ = radius * Math.cos(phi);

        // Depth-based opacity: particles "further" away read fainter, adding real depth
        const depthFade = 0.3 + ((radius - RADIUS_MIN) / RADIUS_SPAN) * -0.15
        const baseOpacity = Math.max(0.28, depthFade + 0.4);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: baseOpacity });
        const sprite = new THREE.Sprite(spriteMaterial);

        sprite.position.set(baseX, baseY, baseZ);
        const baseScale = 0.16 + Math.random() * 0.1;
        sprite.scale.set(baseScale, baseScale, baseScale);

        // Per-sprite bob parameters for a fluid, non-rigid flow, plus state for the
        // cursor-proximity glow interaction (lerped each frame for smoothness)
        sprite.userData = {
            digit,
            base: new THREE.Vector3(baseX, baseY, baseZ),
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.6,
            amplitude: 0.07 + Math.random() * 0.08,
            baseScale,
            baseOpacity,
            curBoost: 0
        };

        binaryGroup.add(sprite);
        sprites.push(sprite);
    }

    scene.add(binaryGroup);

    document.addEventListener('themechange', () => {
        outerMaterial.color.set(isDarkTheme() ? 0xffffff : 0x000000);
        outerMaterial.opacity = isDarkTheme() ? 0.22 : 0.32;
        sprites.forEach(s => {
            s.material.map = getDigitTexture(s.userData.digit);
            s.material.needsUpdate = true;
        });
    });
    // Pulled back slightly from the original z=5 so the (now smaller) halo radius
    // comfortably sits inside the frustum at every rotation angle instead of
    // clipping at the edges, without shrinking the sphere itself too much
    camera.position.z = 5.4;

    // Track cursor position in container-pixel space for the proximity glow
    const pointer = { x: null, y: null, active: false };
    if (!isTouchDevice) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;
            pointer.active = true;
        });
        container.addEventListener('mouseleave', () => { pointer.active = false; });
    }
    const projectVec = new THREE.Vector3();

    let controls = null;
    if (typeof THREE.OrbitControls === 'function') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        // Avoid hijacking page scroll on touch devices
        controls.enabled = !isTouchDevice;
    }

    const rotSpeed = 0.002;
    const clock = new THREE.Clock();
    const GLOW_RADIUS = 70; // px — cursor influence radius for the digit-glow interaction

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        binaryGroup.rotation.x += rotSpeed;
        binaryGroup.rotation.y += rotSpeed * 1.15;

        // Organic wobble layered on top of the steady spin
        techSphere.rotation.z = Math.sin(t * 0.15) * 0.05;

        const size = getSize();
        const hasPointer = pointer.active && pointer.x !== null;

        for (let i = 0; i < sprites.length; i++) {
            const s = sprites[i];
            const d = s.userData;

            // Gentle individual bobbing so the halo feels alive, not just bulk-rotating
            const offset = Math.sin(t * d.speed + d.phase) * d.amplitude;
            s.position.set(d.base.x + offset, d.base.y + offset * 0.7, d.base.z);

            // Cursor-proximity glow: digits near the mouse brighten and grow, lerped
            // smoothly toward the target each frame so it feels fluid, not snappy
            let targetBoost = 0;
            if (hasPointer) {
                projectVec.copy(s.position).project(camera);
                const screenX = (projectVec.x * 0.5 + 0.5) * size.width;
                const screenY = (-projectVec.y * 0.5 + 0.5) * size.height;
                const dist = Math.hypot(screenX - pointer.x, screenY - pointer.y);
                targetBoost = Math.max(0, 1 - dist / GLOW_RADIUS);
            }
            d.curBoost += (targetBoost - d.curBoost) * 0.12;

            const scaleMul = 1 + d.curBoost * 0.9;
            s.scale.set(d.baseScale * scaleMul, d.baseScale * scaleMul, d.baseScale * scaleMul);
            s.material.opacity = Math.min(1, d.baseOpacity + d.curBoost * 0.4);
        }

        if (controls) controls.update();
        renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
        const size = getSize();
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        renderer.setSize(size.width, size.height);
    };
    window.addEventListener('resize', handleResize);

    if (!isTouchDevice) {
        let targetRotationX = 0;
        let targetRotationY = 0;
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
            const mouseY = ((e.clientY - rect.top) / container.clientHeight) * 2 - 1;
            targetRotationY = mouseX * Math.PI * 0.15;
            targetRotationX = mouseY * Math.PI * 0.15;
            techSphere.rotation.x += (targetRotationX - techSphere.rotation.x) * 0.05;
            techSphere.rotation.y += (targetRotationY - techSphere.rotation.y) * 0.05;
        });
    }
}

// ---------- Hero parallax on scroll ----------
function initHeroParallax() {
    const heroVisual = document.getElementById('3d-container');
    const heroSection = document.getElementById('home');
    if (!heroVisual || !heroSection) return;

    let ticking = false;
    const update = () => {
        const heroHeight = heroSection.offsetHeight || 800;
        const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
        // Both translateY and opacity are driven by the CLAMPED progress (not raw
        // scrollY), otherwise the visual keeps drifting/staying visible indefinitely
        // as the page scrolls further, overlapping sections below the hero.
        const translateY = progress * heroHeight * 0.12;
        const opacity = Math.max(0, 1 - progress * 1.15);
        heroVisual.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${(1 - progress * 0.08).toFixed(3)})`;
        heroVisual.style.opacity = String(opacity);
        heroVisual.style.pointerEvents = opacity <= 0.02 ? 'none' : 'auto';
        ticking = false;
    };
    update();
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}

// ---------- Nav scroll effects (blur/shadow) ----------
function initNavScrollEffects() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    const update = () => nav.classList.toggle('nav-scrolled', window.scrollY > 10);
    update();
    window.addEventListener('scroll', update, { passive: true });
}

// ---------- Scroll progress bar ----------
function initScrollProgress() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    const update = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        bar.style.width = progress + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
}

// ---------- Scrollspy: highlight active nav link ----------
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section], .mobile-menu .nav-link');
    if (!sections.length || !navLinks.length) return;

    const setActive = (id) => {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active-nav', href === '#' + id);
        });
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
}

// ---------- Scroll reveal animations (true scroll-scrubbed 3D) ----------
// Each element's transform is driven continuously by its live position in the
// viewport (not a one-time trigger), so the 3D settle genuinely tracks the scrollbar.
function initRevealAnimations() {
    const items = Array.from(document.querySelectorAll('.reveal-up'));
    if (!items.length) return;

    // Stagger siblings that reveal together (card grids, stacked lists) via a small
    // per-index offset to the trigger window, so they cascade instead of moving in lockstep
    items.forEach(el => {
        const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal-up'));
        el.dataset.revealOffset = Math.min(siblings.indexOf(el) * 55, 260);
    });

    // Note: deliberately NOT gated behind prefers-reduced-motion — this scroll-driven
    // reveal is the portfolio's core requested feature, not an incidental flourish.

    let ticking = false;

    const update = () => {
        const vh = window.innerHeight;
        for (let i = 0; i < items.length; i++) {
            const el = items[i];
            const offset = Number(el.dataset.revealOffset) || 0;
            const rect = el.getBoundingClientRect();

            // progress 0 = element's top just below the fold, 1 = settled in place
            const start = vh * 0.92 + offset;
            const end = vh * 0.52 + offset * 0.3;
            let p = (start - rect.top) / (start - end);
            p = p < 0 ? 0 : p > 1 ? 1 : p;
            const eased = 1 - Math.pow(1 - p, 3);

            const translateY = (1 - eased) * 80;
            const translateZ = (1 - eased) * -90;
            const rotateX = (1 - eased) * 11;
            const scale = 0.94 + eased * 0.06;

            el.style.opacity = String(eased);
            el.style.transform = `perspective(1200px) translateY(${translateY.toFixed(1)}px) translateZ(${translateZ.toFixed(1)}px) rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        }
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
}

// ---------- Card tilt-on-hover (subtle 3D parallax for cards) ----------
function initCardTilt() {
    if (isTouchDevice) return;

    const cards = document.querySelectorAll('.experience-card, .skill-category');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            // Clearing to '' would fall back to the CSS .reveal-up base rule (its
            // hidden pre-scroll state) and make the card snap away — restore the
            // settled transform instead, matching what initRevealAnimations converges to.
            card.style.transform = card.classList.contains('reveal-up')
                ? 'perspective(1200px) translateY(0) translateZ(0) rotateX(0deg) scale(1)'
                : '';
        });
    });
}

// ---------- Hero stat counters ----------
function initStatCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        if (prefersReducedMotion) {
            el.textContent = target + suffix;
            return;
        }
        const duration = 1200;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

// Reads a colour token from CSS (stored as "R G B" channels) as an rgb() string
function themeRgb(name, alpha = 1) {
    const channels = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return `rgb(${channels} / ${alpha})`;
}

// ---------- Project preview: Game of Life ----------
// Interactive Conway's Game of Life. The grid wraps around at the edges, and
// cells live in flat typed arrays (two buffers swapped each generation) so a
// step is one tight loop with no allocations. Only runs while on screen.
function initLifePreview() {
    const canvas = document.getElementById('lifeCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const playBtn = document.getElementById('lifePlay');
    const stepBtn = document.getElementById('lifeStep');
    const shuffleBtn = document.getElementById('lifeShuffle');
    const genEl = document.getElementById('lifeGen');

    const CELL = 10;      // px per cell
    const STEP_MS = 110;  // time between generations

    let cols = 0, rows = 0, offsetX = 0, offsetY = 0, cssW = 0, cssH = 0;
    let grid = new Uint8Array(0), next = new Uint8Array(0);
    let generation = 0;
    let running = !prefersReducedMotion;
    let visible = false;
    let rafId = null;
    let lastStep = 0;
    let colors = {};

    const readColors = () => {
        colors = { cell: themeRgb('--ink', 0.85), line: themeRgb('--ink', 0.05) };
    };

    const updateGen = () => { if (genEl) genEl.textContent = generation; };

    const seed = () => {
        for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.22 ? 1 : 0;
        generation = 0;
        updateGen();
    };

    const step = () => {
        let population = 0;
        for (let y = 0; y < rows; y++) {
            const up = ((y - 1 + rows) % rows) * cols;
            const mid = y * cols;
            const down = ((y + 1) % rows) * cols;
            for (let x = 0; x < cols; x++) {
                const left = (x - 1 + cols) % cols;
                const right = (x + 1) % cols;
                const n = grid[up + left] + grid[up + x] + grid[up + right]
                        + grid[mid + left] + grid[mid + right]
                        + grid[down + left] + grid[down + x] + grid[down + right];
                const alive = n === 3 || (n === 2 && grid[mid + x] === 1) ? 1 : 0;
                next[mid + x] = alive;
                population += alive;
            }
        }
        [grid, next] = [next, grid];
        generation++;
        // Restart with a fresh pattern if everything has died out
        if (population === 0) seed();
        updateGen();
    };

    const draw = () => {
        ctx.clearRect(0, 0, cssW, cssH);

        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= cols; x++) {
            const px = offsetX + x * CELL + 0.5;
            ctx.moveTo(px, offsetY);
            ctx.lineTo(px, offsetY + rows * CELL);
        }
        for (let y = 0; y <= rows; y++) {
            const py = offsetY + y * CELL + 0.5;
            ctx.moveTo(offsetX, py);
            ctx.lineTo(offsetX + cols * CELL, py);
        }
        ctx.stroke();

        ctx.fillStyle = colors.cell;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (grid[y * cols + x]) {
                    ctx.fillRect(offsetX + x * CELL + 1.5, offsetY + y * CELL + 1.5, CELL - 2, CELL - 2);
                }
            }
        }
    };

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cssW = rect.width;
        cssH = rect.height;
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const newCols = Math.floor(cssW / CELL);
        const newRows = Math.floor(cssH / CELL);
        offsetX = Math.floor((cssW - newCols * CELL) / 2);
        offsetY = Math.floor((cssH - newRows * CELL) / 2);
        if (newCols !== cols || newRows !== rows) {
            cols = newCols;
            rows = newRows;
            grid = new Uint8Array(cols * rows);
            next = new Uint8Array(cols * rows);
            seed();
        }
        draw();
    };

    const loop = (now) => {
        if (running && now - lastStep >= STEP_MS) {
            step();
            draw();
            lastStep = now;
        }
        rafId = requestAnimationFrame(loop);
    };

    const start = () => { if (rafId === null) rafId = requestAnimationFrame(loop); };
    const stop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };

    const setRunning = (value) => {
        running = value;
        if (playBtn) {
            playBtn.innerHTML = `<i class="fas fa-${running ? 'pause' : 'play'}" aria-hidden="true"></i>`;
            playBtn.setAttribute('aria-label', running ? 'Pause simulation' : 'Play simulation');
        }
    };

    // Click or drag on the grid to bring cells to life
    let painting = false;
    const paint = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - offsetX) / CELL);
        const y = Math.floor((e.clientY - rect.top - offsetY) / CELL);
        if (x < 0 || y < 0 || x >= cols || y >= rows) return;
        grid[y * cols + x] = 1;
        draw();
    };
    canvas.addEventListener('pointerdown', (e) => {
        painting = true;
        canvas.setPointerCapture(e.pointerId);
        paint(e);
    });
    canvas.addEventListener('pointermove', (e) => { if (painting) paint(e); });
    canvas.addEventListener('pointerup', () => { painting = false; });
    canvas.addEventListener('pointercancel', () => { painting = false; });

    if (playBtn) playBtn.addEventListener('click', () => setRunning(!running));
    if (stepBtn) stepBtn.addEventListener('click', () => { step(); draw(); });
    if (shuffleBtn) shuffleBtn.addEventListener('click', () => { seed(); draw(); });

    document.addEventListener('themechange', () => { readColors(); draw(); });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
    }).observe(canvas);

    readColors();
    setRunning(running);
    resize();
}

// ---------- Project preview: moving-average chart ----------
// Draws an example price series with 20- and 50-day simple moving averages and
// marks where the short average crosses above the long one (a bullish signal),
// the same idea Stockify uses. Data comes from a seeded random walk, so the
// "new chart" button can produce fresh but repeatable examples.
function initStockPreview() {
    const svg = document.getElementById('stockChart');
    if (!svg) return;

    const NS = 'http://www.w3.org/2000/svg';
    const POINTS = 160;
    let seedValue = 7;

    // Small, fast seeded PRNG (mulberry32)
    const makeRandom = (seed) => () => {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    // Downtrend then recovery, so the averages are likely to cross
    const generatePrices = (seed) => {
        const rand = makeRandom(seed);
        const prices = [];
        let price = 100;
        for (let i = 0; i < POINTS; i++) {
            const drift = i < POINTS * 0.45 ? -0.2 : 0.3;
            price = Math.max(20, price + drift + (rand() - 0.5) * 2.8);
            prices.push(price);
        }
        return prices;
    };

    // Simple moving average in one pass using a running sum
    const sma = (data, period) => {
        const out = new Array(data.length).fill(null);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            if (i >= period) sum -= data[i - period];
            if (i >= period - 1) out[i] = sum / period;
        }
        return out;
    };

    const findBullishCross = (short, long) => {
        let found = -1;
        for (let i = 1; i < short.length; i++) {
            if (long[i - 1] === null) continue;
            if (short[i - 1] <= long[i - 1] && short[i] > long[i]) found = i;
        }
        return found;
    };

    const el = (tag, attrs) => {
        const node = document.createElementNS(NS, tag);
        for (const k in attrs) node.setAttribute(k, attrs[k]);
        return node;
    };

    const render = () => {
        const W = svg.clientWidth;
        const H = svg.clientHeight;
        if (!W || !H) return;
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

        // Pick the first seed (from the current one) that produces a crossover
        let prices, short, long, cross = -1;
        for (let attempt = 0; attempt < 20 && cross < 0; attempt++) {
            prices = generatePrices(seedValue + attempt);
            short = sma(prices, 20);
            long = sma(prices, 50);
            cross = findBullishCross(short, long);
            if (cross >= 0) seedValue += attempt;
        }

        const min = Math.min(...prices) - 2;
        const max = Math.max(...prices) + 2;
        const padTop = 28;
        const x = (i) => (i / (POINTS - 1)) * W;
        const y = (v) => padTop + (1 - (v - min) / (max - min)) * (H - padTop - 6);
        const toPath = (series) => series
            .map((v, i) => (v === null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`))
            .filter(Boolean)
            .map((pt, i) => (i ? 'L' : 'M') + pt)
            .join('');

        svg.replaceChildren();

        const defs = el('defs', {});
        const grad = el('linearGradient', { id: 'priceFill', x1: 0, y1: 0, x2: 0, y2: 1 });
        grad.append(
            el('stop', { offset: '0%', class: 'fill-stop', 'stop-opacity': 0.12 }),
            el('stop', { offset: '100%', class: 'fill-stop', 'stop-opacity': 0 })
        );
        defs.append(grad);
        svg.append(defs);

        for (let g = 1; g <= 3; g++) {
            const gy = padTop + (g / 4) * (H - padTop);
            svg.append(el('line', { class: 'grid-line', x1: 0, x2: W, y1: gy, y2: gy }));
        }

        const pricePath = toPath(prices);
        svg.append(el('path', { class: 'price-area fade-in', d: `${pricePath}L${W},${H}L0,${H}Z` }));
        svg.append(el('path', { class: 'long-line fade-soft', d: toPath(long) }));
        svg.append(el('path', { class: 'short-line draw', d: toPath(short) }));
        svg.append(el('path', { class: 'price-line draw', d: pricePath }));

        if (cross >= 0) {
            const cx = x(cross);
            const cy = y(short[cross]);
            const alignRight = cx > W * 0.65;
            svg.append(el('line', { class: 'cross-guide fade-in', x1: cx, x2: cx, y1: 18, y2: H }));
            svg.append(el('circle', { class: 'cross-ring fade-in', cx, cy, r: 6 }));
            const label = el('text', {
                class: 'cross-label fade-in',
                x: alignRight ? cx - 8 : cx + 8,
                y: 14,
                'text-anchor': alignRight ? 'end' : 'start'
            });
            label.textContent = 'Bullish crossover';
            svg.append(label);
        }

        svg.querySelectorAll('.draw').forEach(path => {
            path.style.setProperty('--len', Math.ceil(path.getTotalLength()));
        });
    };

    const animateIn = () => {
        svg.classList.remove('is-drawn');
        void svg.getBoundingClientRect(); // restart the CSS transition
        requestAnimationFrame(() => svg.classList.add('is-drawn'));
    };

    render();

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateIn();
            observer.disconnect();
        }
    }, { threshold: 0.4 });
    observer.observe(svg);

    const regen = document.getElementById('stockRegenerate');
    if (regen) {
        regen.addEventListener('click', () => {
            seedValue += 1;
            render();
            animateIn();
        });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            render();
            svg.classList.add('is-drawn');
        }, 150);
    });
}

// ---------- Mobile menu ----------
// ---------- Daily Dashboard preview ----------
// A tiny working slice of the app: tick tasks and the progress ring follows.
function initDashboardPreview() {
    const list = document.getElementById('dashTasks');
    if (!list) return;
    const tasks = [...list.querySelectorAll('.dash-task')];
    const ring = document.getElementById('dashRing');
    const percent = document.getElementById('dashPercent');
    const meta = document.getElementById('dashMeta');
    const circumference = 2 * Math.PI * 32;
    const initial = tasks.map((t) => t.classList.contains('is-done'));

    function update() {
        const done = tasks.filter((t) => t.classList.contains('is-done')).length;
        const ratio = done / tasks.length;
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference * (1 - ratio);
        percent.textContent = `${Math.round(ratio * 100)}%`;
        meta.textContent = done === tasks.length
            ? 'All done. Nice work'
            : `${done} of ${tasks.length} done · tap a task to tick it`;
    }

    tasks.forEach((task) => {
        task.addEventListener('click', () => {
            const done = task.classList.toggle('is-done');
            task.setAttribute('aria-pressed', String(done));
            update();
        });
    });

    document.getElementById('dashReset').addEventListener('click', () => {
        tasks.forEach((task, i) => {
            task.classList.toggle('is-done', initial[i]);
            task.setAttribute('aria-pressed', String(initial[i]));
        });
        update();
    });

    const greeting = document.getElementById('dashGreeting');
    const date = document.getElementById('dashDate');
    const clock = document.getElementById('dashClock');
    function tick() {
        const now = new Date();
        const h = now.getHours();
        greeting.textContent = h < 12 ? 'Good morning.' : h < 17 ? 'Good afternoon.' : 'Good evening.';
        date.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    tick();
    setInterval(tick, 30000);
    update();
}

function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    const closeMenu = () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        menu.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.contains('open');
        isOpen ? closeMenu() : openMenu();
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

// ---------- Smooth anchor scroll with sticky-nav offset ----------
function initSmoothAnchorScroll() {
    const nav = document.getElementById('mainNav');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navHeight = nav ? nav.getBoundingClientRect().height : 0;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            history.pushState(null, '', targetId);
        });
    });
}

// ---------- Contact form (static-hosting friendly: mailto) ----------
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const responseMessage = document.getElementById('responseMessage');

    // Only flag a field as invalid after the user has actually left it
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('blur', () => {
            field.classList.toggle('touched-invalid', !field.checkValidity());
        });
        field.addEventListener('input', () => {
            if (field.classList.contains('touched-invalid')) {
                field.classList.toggle('touched-invalid', !field.checkValidity());
            }
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const subject = form.subject.value.trim();
        const message = form.message.value.trim();

        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailto = `mailto:zzain.abbas@hotmail.com?subject=${encodeURIComponent('Portfolio Contact: ' + subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailto;

        responseMessage.innerHTML = `
            <div class="p-4 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg">
                Your email client should now be open with your message ready to send. If nothing happened, email me directly at zzain.abbas@hotmail.com.
            </div>`;
        form.reset();
    });
}

// ---------- Copy email to clipboard ----------
function initCopyEmail() {
    const btn = document.getElementById('copyEmailBtn');
    const feedback = document.getElementById('copyEmailFeedback');
    if (!btn || !feedback) return;

    btn.addEventListener('click', async () => {
        const email = 'zzain.abbas@hotmail.com';
        try {
            await navigator.clipboard.writeText(email);
            feedback.textContent = 'Copied!';
        } catch (err) {
            feedback.textContent = email;
        }
        feedback.classList.add('show');
        setTimeout(() => feedback.classList.remove('show'), 2000);
    });
}

// ---------- Back to top button ----------
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const update = () => btn.classList.toggle('visible', window.scrollY > 500);
    update();
    window.addEventListener('scroll', update, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
}

// ---------- Footer year ----------
function initFooterYear() {
    const el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
}

