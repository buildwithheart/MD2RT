(function () {
    'use strict';

    var STORAGE_KEY = 'md2rt-color-mode';

    function normalize(mode) {
        if (mode === 'light' || mode === 'dark' || mode === 'system') {
            return mode;
        }
        return 'system';
    }

    function apply(mode) {
        mode = normalize(mode);
        document.documentElement.setAttribute('data-color-mode', mode);
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (_e) {
            /* private mode */
        }
        syncButtons();
    }

    function syncButtons() {
        var mode = document.documentElement.getAttribute('data-color-mode') || 'system';
        mode = normalize(mode);
        var buttons = document.querySelectorAll('[data-theme-value]');
        var i;
        for (i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var val = btn.getAttribute('data-theme-value');
            var active = val === mode;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        }
    }

    function wire() {
        var buttons = document.querySelectorAll('[data-theme-value]');
        var i;
        for (i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function () {
                apply(this.getAttribute('data-theme-value'));
            });
        }
    }

    apply(normalize(localStorage.getItem(STORAGE_KEY)));

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            wire();
            syncButtons();
        });
    } else {
        wire();
        syncButtons();
    }
})();
