## Build & Run

- Runtime & package manager: **Bun**
- Framework: **TanStack Start**
- Linter & formatter: **Biome**
- Install dependencies: `bun install`
- Dev server: `bun run dev`
- Build: `bun run build`

## Validation

Run these after implementing to get immediate feedback:

- Tests: `bun test`
- Typecheck: `bunx tsc --noEmit`
- Lint: `bunx biome check .`
- Lint fix: `bunx biome check --write .`

## Testing

- Component tests use **jsdom** (configured in `test-setup.ts`, preloaded via `bunfig.toml`)
- Module mocking: `mock.module("~/path", () => ({ export: mockFn }))` — bun hoists before imports
- Test files in `src/routes/` are excluded from TanStack Router via `tsr.config.json`

## macOS Build Fix

If `bun run build` fails with `EPIPE` on macOS Sequoia:
```
codesign --force --deep --sign - node_modules/@esbuild/darwin-arm64/bin/esbuild
```
