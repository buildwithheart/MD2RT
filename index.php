<?php
declare(strict_types=1);

/** Semver: siehe Datei `VERSION` und `CHANGELOG.md`. */
$versionFile = __DIR__ . DIRECTORY_SEPARATOR . 'VERSION';
$appVersion = is_readable($versionFile) ? trim((string) file_get_contents($versionFile)) : '';
if ($appVersion === '') {
    $appVersion = '0.0.0';
}

$pageTitle = 'MD2RT — Markdown ↔ Rich Text';

/** GitHub: Profil und Repository (Anzeige + Links im Footer). Repo-Name bei Bedarf anpassen. */
$githubUser = 'buildwithheart';
$githubRepo = 'md2rt';
$githubProfileUrl = 'https://github.com/' . rawurlencode($githubUser);
$githubRepoUrl = 'https://github.com/' . rawurlencode($githubUser) . '/' . rawurlencode($githubRepo);
$apacheLicenseUrl = 'https://www.apache.org/licenses/LICENSE-2.0';

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header(
    'Content-Security-Policy: ' .
    "default-src 'self'; " .
    "script-src 'self' https://cdn.jsdelivr.net; " .
    "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; " .
    "font-src 'self' data:; " .
    "img-src 'self' data: https:; " .
    "connect-src 'self' https://cdn.jsdelivr.net; " .
    "base-uri 'self'; " .
    "form-action 'self'"
);

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="application-version" content="<?= htmlspecialchars($appVersion, ENT_QUOTES, 'UTF-8') ?>">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <script src="assets/js/theme.js?v=<?= rawurlencode($appVersion) ?>"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" crossorigin="anonymous">
    <link rel="stylesheet" href="assets/css/app.css?v=<?= rawurlencode($appVersion) ?>">
</head>
<body>
    <div class="app-shell">
        <header class="app-header">
            <div class="app-header__top">
                <div>
                    <h1 class="app-title"><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></h1>
                    <p class="app-subtitle">Links Markdown bearbeiten, rechts formatieren — oder umgekehrt. Läuft lokal im Browser.</p>
                </div>
                <div class="theme-switch" role="group" aria-label="Farbschema">
                    <button type="button" class="theme-switch__btn" data-theme-value="light" title="Helles Farbschema" aria-label="Helles Farbschema">
                        <svg class="theme-switch__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                    </button>
                    <button type="button" class="theme-switch__btn" data-theme-value="dark" title="Dunkles Farbschema" aria-label="Dunkles Farbschema">
                        <svg class="theme-switch__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    </button>
                    <button type="button" class="theme-switch__btn" data-theme-value="system" title="Systemeinstellung (hell oder dunkel)" aria-label="Systemeinstellung">
                        <svg class="theme-switch__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    </button>
                </div>
            </div>
        </header>

        <main class="split" id="split-view" aria-label="Markdown und Rich-Text Editor">
            <section class="pane pane--md" id="pane-md" aria-labelledby="md-heading">
                <div class="pane-md-drop-overlay" aria-hidden="true">
                    <span class="pane-md-drop-overlay__hint">Markdown-Datei hier ablegen</span>
                </div>
                <div class="pane-header">
                    <h2 id="md-heading" class="pane-title">Markdown</h2>
                    <button type="button" class="copy-btn" id="copy-md" aria-label="Markdown in die Zwischenablage kopieren" title="Markdown in die Zwischenablage kopieren">
                        <svg class="copy-btn__icon copy-btn__icon--idle" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        <svg class="copy-btn__icon copy-btn__icon--done" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                </div>
                <label class="sr-only" for="md-input">Markdown-Quelltext</label>
                <textarea id="md-input" class="md-input" spellcheck="false" placeholder="# Überschrift&#10;&#10;Schreibe **Markdown** hier …"></textarea>
            </section>

            <div class="split-gutter" role="separator" aria-hidden="true"></div>

            <section class="pane pane--rt" aria-labelledby="rt-heading">
                <div class="pane-header">
                    <h2 id="rt-heading" class="pane-title">Rich Text</h2>
                    <div class="pane-header__actions">
                        <button type="button" class="icon-btn" id="download-word" aria-label="Als Word-Dokument herunterladen" title="Als Word (.doc) herunterladen">
                            <svg class="icon-btn__svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                        <button type="button" class="copy-btn" id="copy-rt" aria-label="Rich Text in die Zwischenablage kopieren" title="Rich Text in die Zwischenablage kopieren">
                            <svg class="copy-btn__icon copy-btn__icon--idle" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            <svg class="copy-btn__icon copy-btn__icon--done" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                    </div>
                </div>
                <div id="quill-editor" class="quill-wrap"></div>
            </section>
        </main>

        <footer class="app-footer">
            <p class="app-footer__text">
                <a class="app-footer__link" href="<?= htmlspecialchars($apacheLicenseUrl, ENT_QUOTES, 'UTF-8') ?>" rel="license noopener noreferrer" target="_blank">Apache License 2.0</a>
                <span class="app-footer__sep" aria-hidden="true">·</span>
                <span class="app-footer__meta">
                    GitHub:
                    <a class="app-footer__link" href="<?= htmlspecialchars($githubProfileUrl, ENT_QUOTES, 'UTF-8') ?>" rel="noopener noreferrer" target="_blank">@<?= htmlspecialchars($githubUser, ENT_QUOTES, 'UTF-8') ?></a>
                    <span class="app-footer__sep" aria-hidden="true">/</span>
                    <a class="app-footer__link" href="<?= htmlspecialchars($githubRepoUrl, ENT_QUOTES, 'UTF-8') ?>" rel="noopener noreferrer" target="_blank"><?= htmlspecialchars($githubRepo, ENT_QUOTES, 'UTF-8') ?></a>
                </span>
                <span class="app-footer__sep" aria-hidden="true">·</span>
                <span class="app-footer__version" title="Semantic Versioning (siehe VERSION / CHANGELOG.md)">v<?= htmlspecialchars($appVersion, ENT_QUOTES, 'UTF-8') ?></span>
            </p>
        </footer>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked@4.3.0/marked.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/turndown@7.2.0/dist/turndown.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js" crossorigin="anonymous"></script>
    <script src="assets/js/app.js?v=<?= rawurlencode($appVersion) ?>"></script>
</body>
</html>
