# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), und die Versionsnummern folgen [Semantic Versioning 2.0.0](https://semver.org/lang/de/).

## [Unreleased]

### Added

- Konfigurationsdatei [`config/word-export.json`](config/word-export.json) für Word-Export (Schriftarten serifenlos, Schriftgröße, Zeilenabstand, Dokumenttitel u. a.); wird beim Start geladen, mit identischen Fallback-Werten in JavaScript, falls die Datei nicht erreichbar ist


## [1.0.1] — 2026-03-30

### UI-Optimierungen

- Theme-Umschalter im Header: **Hell**, **Dunkel** und **System**; die Auswahl wird in `localStorage` unter `md2rt-color-mode` gespeichert
- Modus **System** folgt der OS-/Browser-Darstellung (`prefers-color-scheme`) und aktualisiert sich mit, wenn sich die Systemeinstellung ändert
- Farb-Design-Tokens über `data-color-mode` auf `<html>` (neben den bisherigen hellen Standardwerten in `:root`), inkl. `theme.js` vor den Stylesheets zur Vermeidung von FOUC


## [1.0.0] — 2026-03-30

Erste semver-getaggte Version mit dem aktuellen Funktionsumfang.

### Added

- Split-View-Editor: Markdown (links) und Rich Text mit Quill-Toolbar (rechts), responsiv gestapelt auf schmalen Viewports
- Bidirektionale Synchronisation Markdown ↔ Rich Text (marked, DOMPurify, Turndown) mit Debouncing und Schutz vor Sync-Schleifen
- Kopieren in die Zwischenablage: Markdown als Klartext; Rich Text als HTML (mit Plain-Text-Fallback)
- Markdown-Dateien per Drag & Drop in der **linken** Spalte laden (`.md`, `.markdown`, `.mdown` bzw. passende MIME-Typen)
- Visuelles Drop-Zonen-Feedback nur im Markdown-Bereich (gestrichelter Rahmen, Tönung, Hinweistext; `prefers-reduced-motion` berücksichtigt)
- Export des Rich-Text-Inhalts als **Word-kompatibles `.doc`** (HTML mit Office-Namespaces) über einen Button neben „Kopieren“
- Security- und Content-Security-Policy-Header in `index.php` (bei Nutzung mit PHP)
- Optionales Dark-Mode-Styling über `prefers-color-scheme`

[Unreleased]: https://github.com/buildwithheart/md2rt/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/buildwithheart/md2rt/releases/tag/v1.0.1
[1.0.0]: https://github.com/buildwithheart/md2rt/releases/tag/v1.0.0
