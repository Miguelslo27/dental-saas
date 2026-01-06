# @dental/web

Frontend web para Alveo System - Sistema de gestión para clínicas dentales.

## Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **React Router v7** - Routing
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Scripts

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
pnpm lint:fix

# Tests unitarios
pnpm test
pnpm test:watch
pnpm test:coverage

# Tests E2E
pnpm test:e2e
pnpm test:e2e:ui
```

## Estructura

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas/rutas
├── hooks/          # Custom hooks
├── lib/            # Utilidades y helpers
└── test/           # Setup de testing
```

## Path Aliases

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@pages/*` | `src/pages/*` |
| `@hooks/*` | `src/hooks/*` |
| `@lib/*` | `src/lib/*` |

## Proxy API

En desarrollo, las requests a `/api/*` se proxean a `http://localhost:3000`.
