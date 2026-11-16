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
