# Agent Directives

## Project Specifics

- Name: Goat Theme Editor
- Description: Browser-based tool to import theme files, parse and edit color values via drag-and-drop/color pickers/bulk keyword filtering, and export modified theme to original format.
- Tech: Vanilla JS (ES6 modules), HTML5, CSS3, [colordx](https://www.npmjs.com/package/@colordx/core) for color parsing/manipulation.

### Key Files

- `<path>` — entry point
- `<path>` — state
- `<path>` — tests

### Workflow

- Check: `just check`
- Dev: `just dev`
- Lint: `just lint`
- Format: `just format`
- Build: `just build`
- Clean: `just clean`

### Common Patterns

- Add feature: Update store in `<stores-dir>`, add UI in `<components-dir>`, wire with events.
- Backend call: Add command in `<backend-commands-dir>`, register in entry point, call from UI via the frontend wrapper.
- State access: Import the central state from its store module.
- These are examples. Follow only if they apply; otherwise state your approach before implementing.

### File System Access

- Allowed: <project root> and all contained directories + files; `/tmp/*`.
- Read-Only: `.env*`, `.git/`.
- Disallowed: everything not listed in 'Allowed' unless user grants permission.
- Require confirmation: adding/removing dependencies, any operation outside project root.
- Do not delete files or make destructive changes without permission / confirmation.

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

---

## General Guidelines

### Code Changes

- For non-trivial work, propose an approach and confirm before implementing, including architectural changes.
- Keep modifications minimal and scoped; prefer incremental improvements over rewrites.
- Use explicit types and named constants (no magic numbers).
- Return explicit error types; do not suppress exceptions.
- Follow standard repository linting and formatting configs.
- Decompose files over 400 lines if they mix concerns.
- Name things clearly; reserve comments for the non-obvious why (workarounds, edge cases).
- Never run git mutations (commit, push, reset, rebase, amend) unless explicitly instructed.
- Do not create documentation files unless explicitly requested.
- Adhere to <https://develop.kde.org/hig/>.

### Author Environment

- Ryzen 5800X3D, Radeon RX 7900 XT, Display (AW3225QF); CachyOS, KDE, KWin / Wayland, Btrfs.
- fish shell, Ghostty terminal, Fresh TUI editor, yay package manager, bun npm manager, Firefox, Zed code editor.

### Testing

- Add tests only when the logic is genuinely testable and worth guarding. No test files for trivial changes or behavior the environment cannot test reliably (e.g. UI layout/click mapping).

### Definition of Done

- Logic fully implemented.
- Existing docs updated if public interfaces changed.
- Run the corresponding `Workflow` command when `Verification` requires it.

### Commit Messages

- On completion of an update or fix, print a conventional commit message in a fenced code block.
- Add a body only when the "why" isn't obvious.
- Never hard-wrap: one physical line per paragraph, however long.

### Communication Style

- Format: short declarative sentences, one idea per line.
- Instructions: numbered steps, one action each (exact command, path, or code); no prose recap.
- Explanations: essential context only. End question answers with `TL;DR:`, one sentence; omit for status updates and completed work.
- Tone: no preamble, restating, hedging, disclaimers, emotional framing, or closing offers. Keep every fact, command, flag, path, default, caveat.
- Edge Cases: state risks explicitly; ask when requirements are ambiguous.
