(function () {
    'use strict';

    var DEBOUNCE_MS = 220;
    var textarea = document.getElementById('md-input');
    var editorEl = document.getElementById('quill-editor');

    if (!textarea || !editorEl || typeof marked === 'undefined' || typeof DOMPurify === 'undefined' || typeof TurndownService === 'undefined' || typeof Quill === 'undefined') {
        return;
    }

    marked.setOptions({
        gfm: true,
        breaks: true,
    });

    var turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-',
    });

    var quill = new Quill(editorEl, {
        theme: 'snow',
        placeholder: 'Oder hier formatieren — Toolbar nutzen …',
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['blockquote', 'code-block'],
                ['link'],
                ['clean'],
            ],
        },
    });

    var updatingFromMarkdown = false;
    var updatingFromRichText = false;

    function debounce(fn, ms) {
        var t;
        return function () {
            var ctx = this;
            var args = arguments;
            clearTimeout(t);
            t = setTimeout(function () {
                fn.apply(ctx, args);
            }, ms);
        };
    }

    function markdownToHtml(md) {
        var raw = typeof marked.parse === 'function' ? marked.parse(md) : marked(md);
        if (typeof raw !== 'string') {
            raw = String(raw);
        }
        return DOMPurify.sanitize(raw, {
            ADD_ATTR: ['target'],
            ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
        });
    }

    function applyMarkdownToQuill() {
        if (updatingFromRichText) {
            return;
        }
        var md = textarea.value;
        updatingFromMarkdown = true;
        try {
            if (!md.trim()) {
                quill.setText('', 'silent');
                return;
            }
            var html = markdownToHtml(md);
            var delta = quill.clipboard.convert({ html: html });
            quill.setContents(delta, 'silent');
        } finally {
            updatingFromMarkdown = false;
        }
    }

    function getQuillHtml() {
        if (typeof quill.getSemanticHTML === 'function') {
            return quill.getSemanticHTML();
        }
        return quill.root.innerHTML;
    }

    function applyQuillToMarkdown() {
        if (updatingFromMarkdown) {
            return;
        }
        var html = getQuillHtml();
        var isEmpty = quill.getText().replace(/\u00a0/g, ' ').trim().length === 0;
        updatingFromRichText = true;
        try {
            if (isEmpty) {
                textarea.value = '';
                return;
            }
            textarea.value = turndownService.turndown(html).replace(/\n{3,}/g, '\n\n');
        } finally {
            updatingFromRichText = false;
        }
    }

    var debouncedMdToRt = debounce(applyMarkdownToQuill, DEBOUNCE_MS);
    var debouncedRtToMd = debounce(applyQuillToMarkdown, DEBOUNCE_MS);

    textarea.addEventListener('input', function () {
        if (updatingFromRichText) {
            return;
        }
        debouncedMdToRt();
    });

    quill.on('text-change', function (_delta, _old, source) {
        if (source === 'silent') {
            return;
        }
        if (updatingFromMarkdown) {
            return;
        }
        debouncedRtToMd();
    });

    function copyTextFallback(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(ta);
        }
    }

    function copyPlainText(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            return navigator.clipboard.writeText(text);
        }
        copyTextFallback(text);
        return Promise.resolve();
    }

    function copyRichHtml(html, plainText) {
        var plainFallback = plainText || html.replace(/<[^>]+>/g, '');
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
            try {
                return navigator.clipboard
                    .write([
                        new ClipboardItem({
                            'text/html': new Blob([html], { type: 'text/html' }),
                            'text/plain': new Blob([plainText], { type: 'text/plain' }),
                        }),
                    ])
                    .catch(function () {
                        return copyPlainText(plainFallback);
                    });
            } catch (_e) {
                return copyPlainText(plainFallback);
            }
        }
        return copyPlainText(plainFallback);
    }

    function flashCopyButton(btn) {
        var prevTitle = btn.getAttribute('title') || '';
        btn.classList.add('copy-btn--ok');
        btn.setAttribute('title', 'Kopiert');
        window.setTimeout(function () {
            btn.classList.remove('copy-btn--ok');
            btn.setAttribute('title', prevTitle);
        }, 1600);
    }

    var copyMdBtn = document.getElementById('copy-md');
    var copyRtBtn = document.getElementById('copy-rt');

    if (copyMdBtn) {
        copyMdBtn.addEventListener('click', function () {
            var text = textarea.value;
            copyPlainText(text).then(
                function () {
                    flashCopyButton(copyMdBtn);
                },
                function () {
                    copyTextFallback(text);
                    flashCopyButton(copyMdBtn);
                }
            );
        });
    }

    if (copyRtBtn) {
        copyRtBtn.addEventListener('click', function () {
            var html = getQuillHtml();
            var plain = quill.getText();
            copyRichHtml(html, plain).then(
                function () {
                    flashCopyButton(copyRtBtn);
                },
                function () {
                    copyTextFallback(plain || html.replace(/<[^>]+>/g, ''));
                    flashCopyButton(copyRtBtn);
                }
            );
        });
    }

    applyMarkdownToQuill();
})();
