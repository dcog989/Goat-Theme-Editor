# Goat Theme Editor

Browser-based tool to import theme files (XML, CSS, JSON), parse and edit colour values via drag-and-drop, colour pickers, or bulk keyword filtering, and export the modified theme in its original format.

## Tech Stack

- Vanilla JS (ES6 modules), HTML5, CSS3
- [colordx](https://www.npmjs.com/package/@colordx/core) for colour parsing/manipulation
- No build tools, no bundler — fully static site
- [Biome](https://biomejs.dev) for linting and formatting
- [Lefthook](https://github.com/evilmartians/lefthook) for pre-commit hooks

## Project Structure

```text
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

## Development

```sh
bun install
just --list

just                      # Verify the repo: the same checks CI runs.
just build                # Production build.
just check                # Full check, the same command CI runs.
just clean                # Remove build output and dependencies.
just dev                  # Static server on :9000.
just format               # Rewrite formatting.
just format-staged *files # Biome over a file list, as the pre-commit hook passes it.
just lint                 # Linter alone.
just typecheck            # package.json script: typecheck.
just update               # Refresh dependencies to their latest allowed versions.
```
