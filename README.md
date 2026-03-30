# MD2RT — Markdown ↔ Rich Text

Split-View-Editor im Browser: links **Markdown**, rechts **Rich Text** (mit Toolbar). Die Synchronisation läuft **bidirektional** und vollständig **clientseitig** — ohne Login und ohne Server für die Konvertierung.

**Repository:** [github.com/buildwithheart/md2rt](https://github.com/buildwithheart/md2rt)  
**GitHub:** [@buildwithheart](https://github.com/buildwithheart)

## Funktionen

- Zwei Spalten (Split-Screen), responsiv gestapelt auf schmalen Viewports
- Markdown → HTML (mit Sanitizing) → [Quill](https://quilljs.com/)-Editor
- Rich Text → HTML → Markdown mit [Turndown](https://github.com/mixmark-io/turndown)
- Debouncing und Schutz vor Sync-Schleifen
- Kopieren des jeweiligen Bereichs in die Zwischenablage (Markdown bzw. Rich-Text/HTML)
- Optionales Dark Mode-Styling über `prefers-color-scheme`

## Voraussetzungen

- Ein beliebiger **Webserver** mit PHP (optional, siehe unten) oder reines statisches Hosting
- Moderner Browser mit Clipboard-API (für „Kopieren“ idealerweise **HTTPS** oder **localhost**)

## Schnellstart

### Mit PHP (empfohlen für lokale Entwicklung)

```bash
cd MD2RT
php -S localhost:8080
```

Im Browser: `http://localhost:8080/index.php`

### Mit Apache / nginx

Projektverzeichnis als Document Root (oder Virtual Host) ausweisen und `index.php` aufrufen.

### Ohne PHP

Die Seite kann bei Bedarf als `index.html` dupliziert werden (gleiches Markup wie in `index.php`, ohne PHP-Header) und statisch ausgeliefert werden — die Konvertierung erfolgt ausschließlich in JavaScript.

## Projektstruktur

```
MD2RT/
├── index.php          # Einsteig, Security-Header, UI
├── LICENSE            # Apache License 2.0
├── README.md
├── assets/
│   ├── css/app.css
│   └── js/app.js
```

## Technologie

| Bereich        | Bibliothek   | Quelle (CDN)   |
|----------------|--------------|----------------|
| Markdown → HTML| [marked](https://github.com/markedjs/marked) | jsDelivr |
| HTML → Markdown| [Turndown](https://github.com/mixmark-io/turndown) | jsDelivr |
| Rich-Text-UI  | [Quill](https://quilljs.com/) | jsDelivr |
| HTML-Sanitizing| [DOMPurify](https://github.com/cure53/DOMPurify) | jsDelivr |

Diese Bibliotheken stehen unter **eigenen Lizenzen** (siehe jeweilige Repositorien). Dieses Projekt bindet sie nur per CDN ein.

## Konfiguration auf der Seite

In `index.php` kannst du Titel und GitHub-URLs zentral anpassen (`$pageTitle`, `$githubUser`, `$githubRepo`).

## Lizenz

Copyright 2026 Alexander Schulze

Licensed under the **Apache License, Version 2.0** (the „License“); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an **„AS IS“ BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND**, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Die vollständige Lizenzdatei liegt im Repository: [`LICENSE`](LICENSE).
