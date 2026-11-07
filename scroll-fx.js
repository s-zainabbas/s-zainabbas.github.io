/*
 * Scroll-velocity lens effect, modelled on dionpieters.dev.
 *
 * That site renders the page into WebGL and runs a post-processing shader whose
 * strength follows the scroll speed reported by Lenis. Here the same shader math
 * is applied to the live page with an SVG filter, so canvases, forms and links
 * keep working. Three layers, all scaled by scroll velocity:
 *   1. barrel/pincushion lens: page bulges, edges pull in, accent colour shows at the sides
 *   2. wave shear: page skews horizontally/vertically
 *   3. RGB split: red, green and blue channels drift apart
 * The filter is only attached while the page is moving; at rest the page is untouched.
 */
(function () {
    'use strict';

    if (typeof Lenis === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ---------- Smooth scroll (same feel as the reference: Lenis, lerp 0.1) ----------
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.lenis = lenis;

    // Safari's SVG filters on HTML are slow/buggy; keep smooth scroll there, skip the warp.
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
    const warpEnabled = !isSafari;

    // Shader constants from the reference.
    const BARREL_PER_VELOCITY = -0.01;           // factor = |v| * -0.01 * strength
    const BARREL_REF = -0.5;                     // map is baked at this factor, then scaled
    const WAVE_X = 0.001, WAVE_Y = 0.0006;       // linearised sin() wave terms
    const CHROMA = { r: 0.0002, g: 0.0001, b: 0.0003 };
    const MARGIN = 0.15;                         // extra filter area above/below the viewport
    const MAP_W = 96;
    const MAX_VEL = 90;

    const html = document.documentElement;
    const svgNS = 'http://www.w3.org/2000/svg';

    let W = window.innerWidth;
    let H = window.innerHeight;
    let maps = null;
    let els = null;
    let filterOn = false;
    let velocity = 0;        // smoothed scroll speed, px per 60fps frame
    let lastScroll = window.scrollY;
    let lastTime = performance.now();
    let touching = false;

    // ---------- Displacement maps ----------
    // Each map stores an offset field in the R (x) and G (y) channels, normalised
    // around 0.5. feDisplacementMap multiplies it by `scale`, so one map serves
    // every scroll speed: scale = 2 * maxOffset * param.
    function bakeMap(fn) {
        const mapH = Math.round(MAP_W * (H / W) * (1 + 2 * MARGIN)) || MAP_W;
        const field = new Float32Array(MAP_W * mapH * 2);
        let max = 1e-6;
        for (let j = 0; j < mapH; j++) {
            // screen y in 0..1 (clamped in the margins so edges extend smoothly)
            const syRaw = (j / (mapH - 1)) * (1 + 2 * MARGIN) - MARGIN;
            const sy = Math.min(1, Math.max(0, syRaw));
            for (let i = 0; i < MAP_W; i++) {
                const sx = i / (MAP_W - 1);
                const [ox, oy] = fn(sx, sy);
                const k = (j * MAP_W + i) * 2;
                field[k] = ox;
                field[k + 1] = oy;
                max = Math.max(max, Math.abs(ox), Math.abs(oy));
            }
        }
        const canvas = document.createElement('canvas');
        canvas.width = MAP_W;
        canvas.height = mapH;
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(MAP_W, mapH);
        for (let p = 0; p < MAP_W * mapH; p++) {
            img.data[p * 4] = Math.round((0.5 + field[p * 2] / (2 * max)) * 255);
            img.data[p * 4 + 1] = Math.round((0.5 + field[p * 2 + 1] / (2 * max)) * 255);
            img.data[p * 4 + 2] = 128;
            img.data[p * 4 + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        return { url: canvas.toDataURL('image/png'), max };
    }

    function buildMaps() {
        // 1. Barrel: exact shader formula at BARREL_REF, divided by it -> offset per unit factor.
        const barrel = bakeMap((sx, sy) => {
            const dx = sx - 0.5, dy = sy - 0.5;
            const r2 = dx * dx + dy * dy;
            const f = BARREL_REF;
            const s = (1 + Math.sin(f) * r2) * (1 - f * 0.5);
            return [(dx * s - dx) / f * W, (dy * s - dy) / f * H];
        });
        // 2. Wave shear (mouse fixed at centre). Shader uv.y points up, screen y points down.
        const wave = bakeMap((sx, sy) => {
            const up = 1 - sy;
            return [
                WAVE_X * up * (1 - 3 * Math.abs(sx - 0.5)) * W,
                -WAVE_Y * sx * (1 - 3 * Math.abs(up - 0.5)) * H,
            ];
        });
        // 3. RGB split: shader adds velocity * uv.y * k to both st.x and st.y.
        const chroma = bakeMap((sx, sy) => {
            const up = 1 - sy;
            return [up * W, -up * H];
        });
        return { barrel, wave, chroma };
    }

    // ---------- SVG filter ----------
    function el(tag, attrs, parent) {
        const node = document.createElementNS(svgNS, tag);
        for (const k in attrs) node.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(node);
        return node;
    }

    function buildFilter() {
        const svg = el('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' });
        svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
        const defs = el('defs', {}, svg);
        const filter = el('filter', {
            id: 'scroll-lens',
            filterUnits: 'userSpaceOnUse',
            primitiveUnits: 'userSpaceOnUse',
            'color-interpolation-filters': 'sRGB',
        }, defs);

        const img = (result) => el('feImage', { result, preserveAspectRatio: 'none' }, filter);
        const barrelImg = img('barrelMap');
        const barrel = el('feDisplacementMap', { in: 'SourceGraphic', in2: 'barrelMap', xChannelSelector: 'R', yChannelSelector: 'G', result: 'lens' }, filter);
        const waveImg = img('waveMap');
        const wave = el('feDisplacementMap', { in: 'lens', in2: 'waveMap', xChannelSelector: 'R', yChannelSelector: 'G', result: 'warped' }, filter);
        const chromaImg = img('chromaMap');

        const channel = { r: '1 0 0 0 0', g: '0 1 0 0 0', b: '0 0 1 0 0' };
        const split = {};
        ['r', 'g', 'b'].forEach((c) => {
            split[c] = el('feDisplacementMap', { in: 'warped', in2: 'chromaMap', xChannelSelector: 'R', yChannelSelector: 'G', result: c + 'Shift' }, filter);
            const rows = ['r', 'g', 'b'].map((x) => (x === c ? channel[c] : '0 0 0 0 0'));
            el('feColorMatrix', { in: c + 'Shift', type: 'matrix', values: rows.join(' ') + ' 0 0 0 1 0', result: c + 'Only' }, filter);
        });
        el('feComposite', { in: 'rOnly', in2: 'gOnly', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0, result: 'rg' }, filter);
        el('feComposite', { in: 'rg', in2: 'bOnly', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0, result: 'rgb' }, filter);
        // Accent colour behind the page shows where the lens pulls the edges in.
        const flood = el('feFlood', { result: 'edge' }, filter);
        el('feComposite', { in: 'rgb', in2: 'edge', operator: 'over' }, filter);

        document.body.appendChild(svg);
        return { filter, barrelImg, waveImg, chromaImg, barrel, wave, split, flood };
    }

    function applyMaps() {
        maps = buildMaps();
        els.barrelImg.setAttribute('href', maps.barrel.url);
        els.waveImg.setAttribute('href', maps.wave.url);
        els.chromaImg.setAttribute('href', maps.chroma.url);
    }

    function edgeColor() {
        const v = getComputedStyle(html).getPropertyValue('--accent').trim();
        return v ? 'rgb(' + v.split(/\s+/).join(',') + ')' : '#e63946';
    }

    function setFilter(on) {
        if (on === filterOn) return;
        filterOn = on;
        if (on) {
            els.flood.setAttribute('flood-color', edgeColor());
            html.classList.add('scroll-warping');
            html.style.filter = 'url(#scroll-lens)';
        } else {
            html.style.filter = '';
            html.classList.remove('scroll-warping');
        }
    }

    function updateFilter(scrollY) {
        // Filter region tracks the viewport (root-element coordinates are document-based).
        const m = H * MARGIN;
        const region = { x: 0, y: scrollY - m, width: W, height: H + 2 * m };
        [els.filter, els.barrelImg, els.waveImg, els.chromaImg].forEach((node) => {
            for (const k in region) node.setAttribute(k, region[k]);
        });

        const v = Math.max(-MAX_VEL, Math.min(MAX_VEL, velocity));
        const desktop = W >= 1200;
        const uFactor = desktop ? 1 : 1.25;
        const uTouch = desktop || touching ? 1 : 0;

        const factor = Math.max(-0.9, Math.abs(v) * BARREL_PER_VELOCITY * uFactor);
        els.barrel.setAttribute('scale', 2 * maps.barrel.max * factor);
        els.wave.setAttribute('scale', 2 * maps.wave.max * v);
        ['r', 'g', 'b'].forEach((c) => {
            els.split[c].setAttribute('scale', 2 * maps.chroma.max * CHROMA[c] * v * uTouch);
        });
    }

    // ---------- Frame loop ----------
    function raf(time) {
        lenis.raf(time);

        const dt = Math.min(0.1, (time - lastTime) / 1000) || 1 / 60;
        lastTime = time;

        if (warpEnabled) {
            const scrollY = window.scrollY;
            const frameVel = (scrollY - lastScroll) / (dt * 60); // normalise to px per 60fps frame
            lastScroll = scrollY;
            // Shader eases velocity by 0.1 per frame; make that frame-rate independent.
            velocity += (frameVel - velocity) * (1 - Math.pow(0.9, dt * 60));

            if (Math.abs(velocity) > 0.05) {
                setFilter(true);
                updateFilter(scrollY);
            } else {
                velocity = 0;
                setFilter(false);
            }
        }
        requestAnimationFrame(raf);
    }

    if (warpEnabled) {
        els = buildFilter();
        applyMaps();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                W = window.innerWidth;
                H = window.innerHeight;
                applyMaps();
            }, 150);
        });
        window.addEventListener('touchstart', () => { touching = true; }, { passive: true });
        window.addEventListener('touchend', () => { touching = false; }, { passive: true });
        // Theme toggle changes --accent; refresh the edge colour next time the filter turns on.
        new MutationObserver(() => { filterOn && els.flood.setAttribute('flood-color', edgeColor()); })
            .observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    }

    requestAnimationFrame(raf);
})();
