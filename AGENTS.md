# Contributor Guide

## Dev Environment Tips
- Use pnpm dlx turbo run <task> --filter=<project_name> to jump to a package instead of scanning with ls.
- Run pnpm install --filter=<project_name> <package> to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use pnpm create vite@latest <project_name> -- --template react-ts to spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.

## Testing Instructions
- Run pnpm turbo run lint --filter=<project_name> to run every check defined for that package.
- Run pnpm turbo run test --filter=<project_name> to run every check defined for that package.
- The commit should pass all tests before you merge.
- On frontend : To focus on one step, add the Vitest pattern: pnpm --filter frontend run test -- -t "<test name>".
- On backend : To focus on one step, run pnpm --filter backend run test -- -t "<nom du test>"
- Fix any test or type errors until the whole suite is green.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
Title format: [<project_name>] <Title>

