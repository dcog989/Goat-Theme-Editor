# Goat Theme Editor

Browser-based tool to import theme files, parse and edit color values via drag-and-drop/color pickers/bulk keyword filtering, and export modified theme to original format.

## Dev Environment

Linux CachyOS, Limine boot loader, KDE Plasma 6, Wayland, Btrfs. Firefox, Zed code editor, fish shell with Ghostty + Fresh editor. paru and bun package managers. All software is updated as of today.

## Tech Stack

- Vanilla JS (ES6 modules), HTML5, CSS3 (light/dark theme via custom properties)
- [colordx](https://www.npmjs.com/package/@colordx/core) v5.4.3 (CDN via import map) for color parsing/manipulation
- No build tools, no bundler, no npm dependencies — fully static site

## Run Dev Server

```sh
echo "http://localhost:9000" && bunx bunserv --port 9000
```

The echo is for the user to click on.

No build or test commands exist.

## Project Structure

```text
├── index.html                     # Entry point
├── css/GoatThemeEditor.css        # All styles
├── js/
│   ├── GoatThemeEditor.js         # Main: state, core logic, event wiring
│   ├── GoatThemeEditorColorUtils.js  # Color parsing/formatting
│   ├── GoatThemeEditorIO.js       # XML import/export
│   └── GoatThemeEditorUI.js       # DOM rendering, drag-and-drop
├── favicon.svg
└── AGENTS.md
```

## Key Conventions

- No comments in code unless necessary
- Four JS files with clear separation: ColorUtils → IO → UI → Main (load order)
- State lives in global arrays (`palette`, `themeItems`, `filteredThemeItems`)
- All color values flow through `colordx` for consistent format support
- Theme preference persisted in `localStorage` key `themeEditorTheme`

## Interaction Style

- do not pretend to understand how the user feels. no "You're right to be frustrated." etc.
- no analogies, no apologies
- be concise, be precise
- answer the question asked, no 'helpful' suggestions
