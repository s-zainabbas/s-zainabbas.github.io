/*
 * Newer portfolio features, kept apart from script.js so each one is easy to find:
 * timeline, command palette, intro loader, magnetic buttons,
 * testimonials and analytics. The French translation lives in i18n.js.
 */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    const t = (text) => (window.i18n ? window.i18n.t(text) : text);

    document.addEventListener('DOMContentLoaded', () => {
        initTimeline();
        initCommandPalette();
        initMagneticButtons();
        initTestimonials();
        initAnalytics();
    });

    // ---------- Timeline: scroll-linked line ----------
    function initTimeline() {
        const wrap = document.getElementById('timeline');
        if (!wrap) return;
        const fill = document.getElementById('timelineFill');

        // The orange line grows down the timeline as the middle of the screen passes it.
        // Its position is measured only on layout changes (not every scroll frame), so
        // the scroll handler never forces a synchronous layout.
        let ticking = false;
        let wrapTop = 0, wrapHeight = 1, vh = window.innerHeight;
        function measure() {
            let y = 0;
            for (let n = wrap; n; n = n.offsetParent) y += n.offsetTop;
            wrapTop = y;
            wrapHeight = Math.max(1, wrap.offsetHeight);
            vh = window.innerHeight;
        }
        function updateFill() {
            ticking = false;
            if (!fill) return;
            const progress = (vh * 0.55 - (wrapTop - window.scrollY)) / wrapHeight;
            fill.style.setProperty('--fill', Math.min(1, Math.max(0, progress)).toFixed(4));
        }
        const onScroll = () => {
            if (!ticking) { ticking = true; requestAnimationFrame(updateFill); }
        };
        const remeasure = () => { measure(); onScroll(); };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', remeasure);
        window.addEventListener('load', remeasure);
        if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
        measure();
        updateFill();
    }

    // ---------- Small toast for quick confirmations ----------
    function toast(message) {
        let el = document.getElementById('toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toast';
            el.className = 'toast';
            el.setAttribute('role', 'status');
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add('is-visible');
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => el.classList.remove('is-visible'), 2200);
    }
    window.showToast = toast;

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // ---------- Command palette (⌘K / Ctrl+K) ----------
    function initCommandPalette() {
        const dialog = document.getElementById('cmdk');
        if (!dialog || typeof dialog.showModal !== 'function') return;
        const input = dialog.querySelector('input');
        const list = dialog.querySelector('.cmdk-list');
        const openers = document.querySelectorAll('[data-cmdk-open]');

        const go = (hash) => () => {
            const target = document.querySelector(hash);
            if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
            history.pushState(null, '', hash);
        };
        const commands = [
            { group: 'Go to', label: 'Home', icon: 'fa-house', run: go('#home') },
            { group: 'Go to', label: 'About', icon: 'fa-user', run: go('#about') },
            { group: 'Go to', label: 'Professional Experience', icon: 'fa-briefcase', run: go('#experience') },
            { group: 'Go to', label: 'Education', icon: 'fa-graduation-cap', run: go('#education') },
            { group: 'Go to', label: 'Certifications', icon: 'fa-certificate', run: go('#certifications') },
            { group: 'Go to', label: 'Skills & Tools', icon: 'fa-screwdriver-wrench', run: go('#skills') },
            { group: 'Go to', label: 'Projects', icon: 'fa-folder-open', run: go('#projects') },
            { group: 'Go to', label: 'Contact', icon: 'fa-envelope', run: go('#contact') },
            { group: 'Case studies', label: 'Stockify', icon: 'fa-chart-line', run: () => { location.href = 'projects/stockify.html'; } },
            { group: 'Case studies', label: 'Daily Dashboard', icon: 'fa-table-columns', run: () => { location.href = 'projects/daily-dashboard.html'; } },
            { group: 'Case studies', label: 'This portfolio', icon: 'fa-layer-group', run: () => { location.href = 'projects/portfolio.html'; } },
            { group: 'Actions', label: 'Switch light / dark theme', icon: 'fa-circle-half-stroke', keys: 'T', run: () => document.getElementById('themeToggle').click() },
            { group: 'Actions', label: 'Lire en français / Read in English', icon: 'fa-language', keys: 'L', run: () => window.i18n && window.i18n.toggle() },
            { group: 'Actions', label: 'Copy my email address', icon: 'fa-copy', run: copyEmail },
            { group: 'Actions', label: 'Download my CV', icon: 'fa-download', run: () => { const a = document.querySelector('a[href$=".pdf"][download]'); if (a) a.click(); } },
            { group: 'Elsewhere', label: 'GitHub', icon: 'fa-github', brand: true, run: () => window.open('https://github.com/s-zainabbas', '_blank', 'noopener') },
            { group: 'Elsewhere', label: 'LinkedIn', icon: 'fa-linkedin', brand: true, run: () => window.open('https://www.linkedin.com/in/zain-abbas-/', '_blank', 'noopener') }
        ];

        let shown = [];
        let active = 0;

        function render() {
            const q = input.value.trim().toLowerCase();
            shown = commands.filter(c => !q || t(c.label).toLowerCase().includes(q) || c.label.toLowerCase().includes(q) || t(c.group).toLowerCase().includes(q));
            active = Math.min(active, Math.max(0, shown.length - 1));
            if (!shown.length) {
                list.innerHTML = `<li class="cmdk-empty">${t('No matches. Try “projects” or “email”.')}</li>`;
                return;
            }
            let lastGroup = '';
            list.innerHTML = shown.map((c, i) => {
                const header = c.group !== lastGroup ? `<li class="cmdk-group" role="presentation">${t(c.group)}</li>` : '';
                lastGroup = c.group;
                return `${header}<li id="cmdk-${i}" role="option" class="cmdk-item${i === active ? ' is-active' : ''}" aria-selected="${i === active}" data-i="${i}">
                    <i class="${c.brand ? 'fab' : 'fas'} ${c.icon}" aria-hidden="true"></i><span>${t(c.label)}</span>${c.keys ? `<kbd>${c.keys}</kbd>` : ''}</li>`;
            }).join('');
            input.setAttribute('aria-activedescendant', `cmdk-${active}`);
            const el = list.querySelector('.is-active');
            if (el) el.scrollIntoView({ block: 'nearest' });
        }

        function open() {
            input.value = '';
            active = 0;
            render();
            dialog.showModal();
            input.focus();
        }
        function close() { if (dialog.open) dialog.close(); }
        function run(i) {
            const cmd = shown[i];
            if (!cmd) return;
            close();
            cmd.run();
        }

        openers.forEach(b => b.addEventListener('click', open));
        input.addEventListener('input', () => { active = 0; render(); });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, shown.length); render(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + shown.length) % Math.max(1, shown.length); render(); }
            else if (e.key === 'Enter') { e.preventDefault(); run(active); }
        });
        list.addEventListener('click', (e) => {
            const item = e.target.closest('.cmdk-item');
            if (item) run(Number(item.dataset.i));
        });
        list.addEventListener('mousemove', (e) => {
            const item = e.target.closest('.cmdk-item');
            if (item && Number(item.dataset.i) !== active) { active = Number(item.dataset.i); render(); }
        });
        // Click on the dimmed backdrop closes it
        dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

        document.addEventListener('keydown', (e) => {
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                dialog.open ? close() : open();
            } else if (!typing && !dialog.open && !e.metaKey && !e.ctrlKey && !e.altKey) {
                if (e.key === 't' || e.key === 'T') document.getElementById('themeToggle').click();
                if ((e.key === 'l' || e.key === 'L') && window.i18n) window.i18n.toggle();
            }
        });

        // Show the right shortcut for the visitor's keyboard
        const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
        document.querySelectorAll('.cmdk-key-mod').forEach(k => { k.textContent = isMac ? '⌘' : 'Ctrl'; });
    }

    function copyEmail() {
        const email = 'zzain.abbas@hotmail.com';
        const done = () => toast(t('Email copied to your clipboard'));
        if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, () => prompt(t('Copy my email:'), email));
        else prompt(t('Copy my email:'), email);
    }

    // ---------- Magnetic buttons ----------
    // Buttons lean slightly toward the cursor. Mouse only, and off for reduced motion.
    function initMagneticButtons() {
        if (!finePointer || reduceMotion) return;
        const STRENGTH = 0.22;
        document.querySelectorAll('.action-button, .back-to-top, .contact-link').forEach(btn => {
            btn.classList.add('is-magnetic');
            btn.addEventListener('pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                const dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
                const dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
                btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
            });
            btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
        });
    }

    // ---------- Testimonials ----------
    // Add real quotes here (with the person's permission) and the section appears.
    // Example:
    // { quote: 'Zain rebuilt our website…', name: 'Jane Doe', role: 'Founder, Company' }
    const TESTIMONIALS = [];

    function initTestimonials() {
        const section = document.getElementById('testimonials');
        const grid = document.getElementById('testimonialsGrid');
        if (!section || !grid || !TESTIMONIALS.length) return;
        grid.innerHTML = TESTIMONIALS.map(q => `
            <figure class="testimonial reveal-up">
                <i class="fas fa-quote-left" aria-hidden="true"></i>
                <blockquote>${escapeHtml(q.quote)}</blockquote>
                <figcaption><strong>${escapeHtml(q.name)}</strong><span>${escapeHtml(q.role)}</span></figcaption>
            </figure>`).join('');
        section.hidden = false;
    }

    // ---------- Visitor stats (GoatCounter: free, no cookies, no personal data) ----------
    // Sign up at goatcounter.com, then put your site code here, e.g. 'zainabbas'.
    const GOATCOUNTER_CODE = '';

    function initAnalytics() {
        if (!GOATCOUNTER_CODE || location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://gc.zgo.at/count.js';
        script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
        document.head.appendChild(script);
    }
})();
