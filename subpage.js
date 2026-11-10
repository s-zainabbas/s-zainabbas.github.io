// Shared behaviour for the standalone pages (case studies, 404):
// theme toggle, footer year and the scroll progress bar.
(function () {
    'use strict';
    const root = document.documentElement;

    const btn = document.getElementById('themeToggle');
    const isDark = () => root.getAttribute('data-theme') === 'dark';
    const sync = () => btn && btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    sync();
    if (btn) {
        btn.addEventListener('click', () => {
            const next = isDark() ? 'light' : 'dark';
            try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
            root.classList.add('theme-transition');
            setTimeout(() => root.classList.remove('theme-transition'), 450);
            root.setAttribute('data-theme', next);
            sync();
            document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
        });
    }

    const year = document.getElementById('currentYear');
    if (year) year.textContent = new Date().getFullYear();

    const bar = document.getElementById('scrollProgressBar');
    if (bar) {
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    }
})();
