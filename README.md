# Goat Theme Editor

Browser-based tool to import theme files (XML, CSS, JSON), parse and edit colour values via drag-and-drop, colour pickers, or bulk keyword filtering, and export the modified theme in its original format.

## Usage

```sh
bun install
bun run dev
```

Open the URL printed in the terminal (default `http://localhost:9000`).

## Tech Stack

- Vanilla JS (ES6 modules), HTML5, CSS3
- [colordx](https://www.npmjs.com/package/@colordx/core) for colour parsing/manipulation
- No build tools, no bundler — fully static site
- [Biome](https://biomejs.dev) for linting and formatting
- [Lefthook](https://github.com/evilmartians/lefthook) for pre-commit hooks

## Project Structure

```
├── index.html
├── css/GoatThemeEditor.css
├── js/
│   ├── GoatThemeEditor.js
│   ├── GoatThemeEditorColorUtils.js
│   ├── GoatThemeEditorIO.js
│   ├── GoatThemeEditorUI.js
│   └── vendor.colordx.js
├── favicon.svg
└── AGENTS.md
```
