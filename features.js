/*
 * Newer portfolio features, kept apart from script.js so each one is easy to find:
 * timeline, GitHub activity, command palette, intro loader, magnetic buttons,
 * testimonials and analytics. The French translation lives in i18n.js.
 */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    const t = (text) => (window.i18n ? window.i18n.t(text) : text);

    document.addEventListener('DOMContentLoaded', () => {
        initTimeline();
        initGitHubActivity();
        initCommandPalette();
        initMagneticButtons();
        initTestimonials();
        initAnalytics();
    });

    // ---------- Timeline: filters + scroll-linked line ----------
    function initTimeline() {
        const wrap = document.getElementById('timeline');
        if (!wrap) return;
        const items = Array.from(wrap.querySelectorAll('.timeline-item'));
        const fill = document.getElementById('timelineFill');
        const buttons = document.querySelectorAll('.timeline-filter');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                buttons.forEach(b => {
                    const on = b === btn;
                    b.classList.toggle('is-active', on);
                    b.setAttribute('aria-pressed', String(on));
                });
                items.forEach(item => {
                    const show = filter === 'all' || item.dataset.kind === filter;
                    item.classList.toggle('is-hidden', !show);
                });
                // Items moved, so let the scroll reveal (script.js) and the line recalculate
                window.dispatchEvent(new Event('scroll'));
                updateFill();
            });
        });

        // The tomato line grows down the timeline as the middle of the screen passes it
        let ticking = false;
        function updateFill() {
            ticking = false;
            if (!fill) return;
            const r = wrap.getBoundingClientRect();
            const progress = (window.innerHeight * 0.55 - r.top) / Math.max(1, r.height);
            fill.style.setProperty('--fill', Math.min(1, Math.max(0, progress)).toFixed(4));
        }
        const onScroll = () => {
            if (!ticking) { ticking = true; requestAnimationFrame(updateFill); }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
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

    // ---------- Live GitHub activity ----------
    // Public API, no key. Results are cached for an hour so repeat visits don't use up
    // the 60-requests-per-hour limit. If anything fails, the plain "More on GitHub" link stays.
    const GH_USER = 's-zainabbas';
    const GH_CACHE = 'gh-activity-v1';
    const LANG_COLOURS = { JavaScript: '#e8c547', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399', Python: '#3572A5' };

    async function initGitHubActivity() {
        const box = document.getElementById('githubActivity');
        if (!box) return;

        let payload = null;
        try {
            const raw = sessionStorage.getItem(GH_CACHE);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Date.now() - parsed.savedAt < 60 * 60 * 1000) payload = parsed.data;
            }
        } catch (e) { /* storage blocked */ }

        if (!payload) {
            try {
                const [reposRes, eventsRes] = await Promise.all([
                    fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=12`),
                    fetch(`https://api.github.com/users/${GH_USER}/events/public?per_page=100`)
                ]);
                if (!reposRes.ok) return;
                const repos = (await reposRes.json())
                    .filter(r => !r.fork && r.name !== `${GH_USER}.github.io`)
                    .slice(0, 4)
                    .map(r => ({ name: r.name, url: r.html_url, description: r.description, language: r.language, stars: r.stargazers_count, pushed: r.pushed_at }));
                const events = eventsRes.ok ? await eventsRes.json() : [];
                const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                const recentPushes = events.filter(e => e.type === 'PushEvent' && Date.parse(e.created_at) > monthAgo);
                payload = {
                    repos,
                    pushes: recentPushes.length,
                    activeRepos: new Set(recentPushes.map(e => e.repo.name)).size
                };
                try { sessionStorage.setItem(GH_CACHE, JSON.stringify({ savedAt: Date.now(), data: payload })); } catch (e) { /* fine */ }
            } catch (e) {
                return; // offline or rate-limited: keep the fallback link
            }
        }
        renderGitHub(box, payload);
        document.addEventListener('langchange', () => renderGitHub(box, payload));
    }

    function timeAgo(iso) {
        const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
        const fr = window.i18n && window.i18n.lang === 'fr';
        if (days < 1) return fr ? "aujourd'hui" : 'today';
        if (days === 1) return fr ? 'hier' : 'yesterday';
        if (days < 30) return fr ? `il y a ${days} jours` : `${days} days ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return fr ? `il y a ${months} mois` : `${months} month${months > 1 ? 's' : ''} ago`;
        const years = Math.floor(months / 12);
        return fr ? `il y a ${years} an${years > 1 ? 's' : ''}` : `${years} year${years > 1 ? 's' : ''} ago`;
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function renderGitHub(box, data) {
        if (!data || !data.repos.length) return;
        const fr = window.i18n && window.i18n.lang === 'fr';
        const activity = data.pushes
            ? (fr ? `${data.pushes} push${data.pushes > 1 ? 's' : ''} sur ${data.activeRepos} dépôt${data.activeRepos > 1 ? 's' : ''} ces 30 derniers jours`
                  : `${data.pushes} push${data.pushes > 1 ? 'es' : ''} to ${data.activeRepos} repo${data.activeRepos > 1 ? 's' : ''} in the last 30 days`)
            : t('Experiments, data tools and work in progress.');
        const cards = data.repos.map(r => `
            <a class="gh-repo" href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">
                <span class="gh-repo-name"><i class="far fa-folder" aria-hidden="true"></i>${escapeHtml(r.name)}</span>
                ${r.description ? `<span class="gh-repo-desc">${escapeHtml(r.description)}</span>` : ''}
                <span class="gh-repo-meta">
                    ${r.language ? `<span><i class="gh-lang" style="background:${LANG_COLOURS[r.language] || 'currentColor'}"></i>${escapeHtml(r.language)}</span>` : ''}
                    ${r.stars ? `<span><i class="far fa-star" aria-hidden="true"></i>${r.stars}</span>` : ''}
                    <span>${fr ? 'Mis à jour' : 'Updated'} ${timeAgo(r.pushed)}</span>
                </span>
            </a>`).join('');
        box.innerHTML = `
            <div class="gh-head">
                <i class="fab fa-github" aria-hidden="true"></i>
                <div class="flex-1">
                    <h3 class="font-semibold text-lg">${t('Latest on GitHub')}</h3>
                    <p class="gh-activity"><span class="gh-live" aria-hidden="true"></span>${activity}</p>
                </div>
                <a class="gh-profile" href="https://github.com/${GH_USER}" target="_blank" rel="noopener noreferrer">${t('Visit GitHub')} <i class="fas fa-arrow-right ml-1" aria-hidden="true"></i></a>
            </div>
            <div class="gh-grid">${cards}</div>`;
        box.classList.add('is-live');
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
            { group: 'Go to', label: 'Experience & Education', icon: 'fa-timeline', run: go('#experience') },
            { group: 'Go to', label: 'Skills & Tools', icon: 'fa-screwdriver-wrench', run: go('#skills') },
            { group: 'Go to', label: 'Projects', icon: 'fa-folder-open', run: go('#projects') },
            { group: 'Go to', label: 'Contact', icon: 'fa-envelope', run: go('#contact') },
            { group: 'Case studies', label: 'Stockify', icon: 'fa-chart-line', run: () => { location.href = 'projects/stockify.html'; } },
            { group: 'Case studies', label: 'Daily Dashboard', icon: 'fa-table-columns', run: () => { location.href = 'projects/daily-dashboard.html'; } },
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
