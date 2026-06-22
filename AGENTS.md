# Goat Theme Editor

Browser-based tool to import theme files, parse and edit color values via drag-and-drop/color pickers/bulk keyword filtering, and export modified theme to original format.

## Dev Environment

- OS: CachyOS, Limine bootloader, KDE Plasma 6, Wayland, Btrfs.
- Tools: fish shell, Ghostty terminal, Fresh TUI editor, paru repo tool, bun package manager, Firefox, Zed code editor. All software up to date as of today.

## Tech Stack

- Vanilla JS (ES6 modules), HTML5, CSS3 (light/dark theme via custom properties)
- [colordx](https://www.npmjs.com/package/@colordx/core) v5.4.3 (CDN via import map) for color parsing/manipulation
- No build tools, no bundler, no npm dependencies — fully static site

## Run Dev Server

```sh
bun run dev
```

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

- Keep responses concise, precise, no analogies.
- Do NOT "understand" how the user feels or pretend to have human sensibilities.
- Always output code or terminal commands in code blocks (three back ticks) so the user can copy them.
- Use metric units with British spelling.
- Print technical instructions one step at a time. Allow the user to confirm success of each step before providing the next instruction.
