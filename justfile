# Verify the repo: the same checks CI runs.
default: check

# Full check, the same command CI runs.
check:
    bun run check

# Linter alone.
lint:
    bun run lint

# Rewrite formatting.
format:
    bun run format

# Production build.
build:
    bun run build

# Static server on :9000.
dev:
    bun run dev

# Remove build output and dependencies.
clean:
    bun run clean

# Refresh dependencies to their latest allowed versions.
update:
    bun run update

# package.json script: typecheck.
typecheck:
    bun run typecheck

# Biome over a file list, as the pre-commit hook passes it.
format-staged *files:
    bunx biome check --write --no-errors-on-unmatched --files-ignore-unknown=true {{files}}
