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

    var WORD_EXPORT_DEFAULTS = {
        bodyFontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
        headingFontFamily: null,
        baseFontSizePt: 11,
        lineHeight: '1.15',
        codeFontFamily: 'Consolas, "Courier New", monospace',
        htmlTitle: 'MD2RT Export',
    };

    function mergeWordExportConfig(data) {
        var out = {
            bodyFontFamily: WORD_EXPORT_DEFAULTS.bodyFontFamily,
            headingFontFamily: WORD_EXPORT_DEFAULTS.headingFontFamily,
            baseFontSizePt: WORD_EXPORT_DEFAULTS.baseFontSizePt,
            lineHeight: WORD_EXPORT_DEFAULTS.lineHeight,
            codeFontFamily: WORD_EXPORT_DEFAULTS.codeFontFamily,
            htmlTitle: WORD_EXPORT_DEFAULTS.htmlTitle,
        };
        if (!data || typeof data !== 'object') {
            return out;
        }
        if (typeof data.bodyFontFamily === 'string') {
            out.bodyFontFamily = data.bodyFontFamily;
        }
        if (typeof data.headingFontFamily === 'string') {
            out.headingFontFamily = data.headingFontFamily;
        } else if (data.headingFontFamily === null) {
            out.headingFontFamily = null;
        }
        if (typeof data.baseFontSizePt === 'number' && !isNaN(data.baseFontSizePt) && data.baseFontSizePt > 0) {
            out.baseFontSizePt = data.baseFontSizePt;
        }
        if (typeof data.lineHeight === 'string') {
            out.lineHeight = data.lineHeight;
        } else if (data.lineHeight === null) {
            out.lineHeight = '';
        }
        if (typeof data.codeFontFamily === 'string') {
            out.codeFontFamily = data.codeFontFamily;
        } else if (data.codeFontFamily === null) {
            out.codeFontFamily = '';
        }
        if (typeof data.htmlTitle === 'string') {
            out.htmlTitle = data.htmlTitle;
        }
        return out;
    }

    var wordExportConfig = mergeWordExportConfig(null);

    function escapeXmlText(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function buildWordExportStyles(cfg) {
        var bodyFont = cfg.bodyFontFamily;
        var headingFont =
            cfg.headingFontFamily !== null && cfg.headingFontFamily !== undefined && cfg.headingFontFamily !== ''
                ? cfg.headingFontFamily
                : bodyFont;
        var size =
            typeof cfg.baseFontSizePt === 'number' && !isNaN(cfg.baseFontSizePt) && cfg.baseFontSizePt > 0
                ? cfg.baseFontSizePt
                : WORD_EXPORT_DEFAULTS.baseFontSizePt;
        var parts = [];
        parts.push('body { font-family: ');
        parts.push(bodyFont);
        parts.push('; font-size: ');
        parts.push(String(size));
        parts.push('pt;');
        if (cfg.lineHeight !== undefined && cfg.lineHeight !== null && String(cfg.lineHeight).trim() !== '') {
            parts.push(' line-height: ');
            parts.push(String(cfg.lineHeight).trim());
            parts.push(';');
        }
        parts.push(' }');
        parts.push('h1, h2, h3, h4, h5, h6 { font-family: ');
        parts.push(headingFont);
        parts.push('; }');
        if (cfg.codeFontFamily !== undefined && cfg.codeFontFamily !== null && String(cfg.codeFontFamily).trim() !== '') {
            parts.push('pre, code { font-family: ');
            parts.push(cfg.codeFontFamily.trim());
            parts.push('; }');
        }
        return parts.join('');
    }

    function buildWordDocumentHtml(bodyHtml) {
        var cfg = wordExportConfig;
        var title = escapeXmlText(cfg.htmlTitle || WORD_EXPORT_DEFAULTS.htmlTitle);
        var css = buildWordExportStyles(cfg);
        return (
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
            'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
            'xmlns="http://www.w3.org/TR/REC-html40">' +
            '<head><meta charset="utf-8"><title>' +
            title +
            '</title>' +
            '<style>' +
            css +
            '</style>' +
            '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->' +
            '</head><body>' +
            bodyHtml +
            '</body></html>'
        );
    }

    function loadWordExportConfig() {
        fetch('config/word-export.json', { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('word-export config not ok');
                }
                return res.json();
            })
            .then(function (data) {
                wordExportConfig = mergeWordExportConfig(data);
            })
            .catch(function () {
                wordExportConfig = mergeWordExportConfig(null);
            });
    }

    function downloadQuillAsWord() {
        var inner = getQuillHtml();
        var blob = new Blob(['\ufeff', buildWordDocumentHtml(inner)], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var d = new Date();
        var pad = function (n) {
            return n < 10 ? '0' + n : String(n);
        };
        a.download = 'md2rt-export-' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function isMarkdownFile(file) {
        if (!file || !file.name) {
            return false;
        }
        var name = file.name.toLowerCase();
        if (name.endsWith('.md') || name.endsWith('.markdown') || name.endsWith('.mdown')) {
            return true;
        }
        var t = (file.type || '').toLowerCase();
        return t === 'text/markdown' || t === 'text/x-markdown';
    }

    function pickMarkdownFromFileList(files) {
        if (!files || !files.length) {
            return null;
        }
        var i;
        for (i = 0; i < files.length; i++) {
            if (isMarkdownFile(files[i])) {
                return files[i];
            }
        }
        return null;
    }

    function loadMarkdownFileIntoEditor(file) {
        var reader = new FileReader();
        reader.onload = function () {
            var text = typeof reader.result === 'string' ? reader.result : '';
            textarea.value = text;
            applyMarkdownToQuill();
            textarea.focus();
        };
        reader.onerror = function () {
            textarea.focus();
        };
        reader.readAsText(file, 'UTF-8');
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

    var downloadWordBtn = document.getElementById('download-word');
    if (downloadWordBtn) {
        downloadWordBtn.addEventListener('click', function () {
            downloadQuillAsWord();
        });
    }

    var paneMd = document.getElementById('pane-md');
    var mdDragDepth = 0;

    function eventHasFileDrag(e) {
        if (!e.dataTransfer || !e.dataTransfer.types) {
            return false;
        }
        var types = e.dataTransfer.types;
        if (typeof types.indexOf === 'function') {
            return types.indexOf('Files') !== -1;
        }
        if (typeof types.contains === 'function') {
            return types.contains('Files');
        }
        return Array.prototype.indexOf.call(types, 'Files') !== -1;
    }

    if (paneMd) {
        paneMd.addEventListener('dragenter', function (e) {
            if (!eventHasFileDrag(e)) {
                return;
            }
            e.preventDefault();
            mdDragDepth++;
            paneMd.classList.add('pane--drop');
        });

        paneMd.addEventListener('dragleave', function (e) {
            if (!eventHasFileDrag(e)) {
                return;
            }
            e.preventDefault();
            mdDragDepth--;
            if (mdDragDepth <= 0) {
                mdDragDepth = 0;
                paneMd.classList.remove('pane--drop');
            }
        });

        paneMd.addEventListener('dragover', function (e) {
            if (!eventHasFileDrag(e)) {
                return;
            }
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        paneMd.addEventListener('drop', function (e) {
            e.preventDefault();
            mdDragDepth = 0;
            paneMd.classList.remove('pane--drop');
            var file = pickMarkdownFromFileList(e.dataTransfer.files);
            if (file) {
                loadMarkdownFileIntoEditor(file);
            }
        });
    }

    loadWordExportConfig();
    applyMarkdownToQuill();
})();
