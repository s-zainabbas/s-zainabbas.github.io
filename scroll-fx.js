/*
 * Scroll-velocity lens effect, modelled on dionpieters.dev.
 *
 * That site renders the page into WebGL and runs a post-processing shader whose
 * strength follows the scroll speed reported by Lenis. Here the same shader math
 * is applied to the live page with an SVG filter, so canvases, forms and links
 * keep working:
 *   - barrel lens: the page bulges and the edges pull in, showing the accent colour
 *   - wave shear: the page skews in the scroll direction
 * Both are baked into ONE displacement map per scroll direction, so the filter is
 * a single displacement pass. Each extra displacement pass costs a full-screen
 * redraw per frame: one pass holds 60fps, the old five-pass version (which also
 * split the RGB channels) ran at ~12fps.
 * The filter is only attached while the page is moving; at rest the page is untouched.
 */
(function () {
    'use strict';

    if (typeof Lenis === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ---------- Smooth scroll (same feel as the reference: Lenis, lerp 0.1) ----------
    const lenis = new Lenis({ lerp: 0.1 });
    window.lenis = lenis;

    // Safari's SVG filters on HTML are slow/buggy; keep smooth scroll there, skip the warp.
    const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
    const warpEnabled = !isSafari;

    // Shader constants from the reference.
    const BARREL_PER_VELOCITY = -0.01;      // factor = |v| * -0.01 * uFactor
    const BARREL_REF = -0.5;                // barrel is baked at this factor, then scaled
    const WAVE_X = 0.001, WAVE_Y = 0.0006;  // linearised sin() wave terms (mouse at centre)
    const MARGIN = 0.15;                    // extra filter area above/below the viewport
    const MAP_W = 96;
    const MAX_VEL = 90;                     // caps the barrel factor at -0.9
    const REST = 0.05;                      // below this speed the filter is removed

    const html = document.documentElement;
    const svgNS = 'http://www.w3.org/2000/svg';

    let W = window.innerWidth;
    let H = window.innerHeight;
    let filters = null;      // { down: {...}, up: {...} }
    let active = null;       // 'down' | 'up' | null
    let velocity = 0;        // smoothed scroll speed, px per 60fps frame
    let lastScroll = window.scrollY;
    let lastTime = performance.now();

    // ---------- Displacement map ----------
    // Offset field per 1px/frame of scroll speed, stored in R (x) and G (y) around 0.5.
    // feDisplacementMap multiplies by `scale`, so scale = 2 * max * |velocity|.
    function bakeMap(dir) {
        const uFactor = W >= 1200 ? 1 : 1.25;
        const mapH = Math.max(8, Math.round(MAP_W * (H / W) * (1 + 2 * MARGIN)));
        const field = new Float32Array(MAP_W * mapH * 2);
        let max = 1e-6;

        for (let j = 0; j < mapH; j++) {
            // screen y in 0..1, clamped in the margins so edges extend smoothly
            const sy = Math.min(1, Math.max(0, (j / (mapH - 1)) * (1 + 2 * MARGIN) - MARGIN));
            const up = 1 - sy; // shader uv.y points up
            for (let i = 0; i < MAP_W; i++) {
                const sx = i / (MAP_W - 1);

                // Barrel: exact shader formula at BARREL_REF, per unit of factor.
                const dx = sx - 0.5, dy = sy - 0.5;
                const r2 = dx * dx + dy * dy;
                const s = (1 + Math.sin(BARREL_REF) * r2) * (1 - BARREL_REF * 0.5);
                const k = BARREL_PER_VELOCITY * uFactor / BARREL_REF;
                let ox = (dx * s - dx) * k * W;
                let oy = (dy * s - dy) * k * H;

                // Wave: signed with scroll direction.
                ox += dir * WAVE_X * up * (1 - 3 * Math.abs(sx - 0.5)) * W;
                oy -= dir * WAVE_Y * sx * (1 - 3 * Math.abs(up - 0.5)) * H;

                const p = (j * MAP_W + i) * 2;
                field[p] = ox;
                field[p + 1] = oy;
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

    // ---------- SVG filters (one per scroll direction) ----------
    function el(tag, attrs, parent) {
        const node = document.createElementNS(svgNS, tag);
        for (const k in attrs) node.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(node);
        return node;
    }

    function buildFilters() {
        const svg = el('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' });
        svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
        const defs = el('defs', {}, svg);
        const make = (name) => {
            const filter = el('filter', {
                id: 'scroll-lens-' + name,
                filterUnits: 'userSpaceOnUse',
                primitiveUnits: 'userSpaceOnUse',
                'color-interpolation-filters': 'sRGB',
            }, defs);
            const image = el('feImage', { result: 'map', preserveAspectRatio: 'none' }, filter);
            const disp = el('feDisplacementMap', {
                in: 'SourceGraphic', in2: 'map', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G', result: 'lens',
            }, filter);
            // Accent colour behind the page shows where the lens pulls the edges in (costs ~nothing).
            const flood = el('feFlood', { result: 'edge' }, filter);
            const merge = el('feMerge', {}, filter);
            el('feMergeNode', { in: 'edge' }, merge);
            el('feMergeNode', { in: 'lens' }, merge);
            return { filter, image, disp, flood, max: 1 };
        };
        document.body.appendChild(svg);
        return { down: make('down'), up: make('up') };
    }

    function applyMaps() {
        [['down', 1], ['up', -1]].forEach(([name, dir]) => {
            const map = bakeMap(dir);
            filters[name].image.setAttribute('href', map.url);
            filters[name].max = map.max;
        });
    }

    // Follows the light/dark theme, since --accent changes with it.
    function edgeColor() {
        const v = getComputedStyle(html).getPropertyValue('--accent').trim();
        return v ? 'rgb(' + v.split(/\s+/).join(',') + ')' : '#e63946';
    }

    function setActive(name) {
        if (name === active) return;
        active = name;
        if (name) {
            filters[name].flood.setAttribute('flood-color', edgeColor());
            html.classList.add('scroll-warping');
            html.style.filter = 'url(#scroll-lens-' + name + ')';
        } else {
            html.style.filter = '';
            html.classList.remove('scroll-warping');
        }
    }

    function updateFilter(scrollY) {
        const f = filters[active];
        // Filter region tracks the viewport (root-element coordinates are document-based).
        const m = H * MARGIN;
        const y = scrollY - m, h = H + 2 * m;
        f.filter.setAttribute('y', y);
        f.image.setAttribute('y', y);
        f.filter.setAttribute('x', 0);
        f.image.setAttribute('x', 0);
        f.filter.setAttribute('width', W);
        f.image.setAttribute('width', W);
        f.filter.setAttribute('height', h);
        f.image.setAttribute('height', h);
        f.disp.setAttribute('scale', 2 * f.max * Math.min(MAX_VEL, Math.abs(velocity)));
    }

    // ---------- Frame loop ----------
    function raf(time) {
        lenis.raf(time);

        const dt = Math.min(0.1, (time - lastTime) / 1000) || 1 / 60;
        lastTime = time;

        if (warpEnabled) {
            const scrollY = window.scrollY;
            const frameVel = (scrollY - lastScroll) / (dt * 60); // px per 60fps frame
            lastScroll = scrollY;
            // Shader eases velocity by 0.1 per frame; frame-rate independent version.
            velocity += (frameVel - velocity) * (1 - Math.pow(0.9, dt * 60));

            if (Math.abs(velocity) > REST) {
                setActive(velocity > 0 ? 'down' : 'up');
                updateFilter(scrollY);
            } else {
                velocity = 0;
                setActive(null);
            }
        }
        requestAnimationFrame(raf);
    }

    if (warpEnabled) {
        filters = buildFilters();
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
    }

    requestAnimationFrame(raf);
})();
