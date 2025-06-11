# Super Umbrella

This repo contains a **backend** Express API and a **frontend** React app. Each package lives in its own folder.

## Requirements
- [Node.js](https://nodejs.org/) (v18 as used in CI)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

## Installing dependencies
Run `pnpm install` inside each package:

```bash
pnpm install --filter ./backend
pnpm install --filter ./frontend
```

## Development
Start the dev servers in separate terminals:

```bash
# backend
cd backend && pnpm dev

# frontend
cd frontend && pnpm dev
```

## Testing
Execute the test suites from each package:

```bash
cd backend && pnpm test
cd frontend && pnpm test
```

You can also target a package with `pnpm turbo run test --filter <project_name>`.

## Linting
Both packages expose a `lint` script:

```bash
cd backend && pnpm lint
cd frontend && pnpm lint
```

## Continuous Integration
The GitHub Actions workflow `.github/workflows/main.yml` installs dependencies, runs linters, tests and builds the frontend, then deploys to Fly.io and Vercel.
