# Contributing Guidelines

Thank you for contributing to the **SONIC FEST** event management platform. To ensure high code quality, consistency, and security across client projects, please follow the standards below.

---

## 1. Branch Naming Conventions

Use lowercase branch names prefixed with the feature type:
- `feature/artist-reordering`
- `fix/countdown-timezone-offset`
- `refactor/registration-form-validation`
- `docs/deployment-cloudflare-notes`

---

## 2. Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:
- `feat:` Adds a new user-facing capability or admin screen.
- `fix:` Patches a bug or logic discrepancy.
- `refactor:` Code restructuring without behavioral changes.
- `docs:` Documentation improvements or additions.
- `chore:` Dependency bumps, build script adjustments.

*Example:*
```bash
git commit -m "feat(events): add end_time field and live time display to event cards"
```

---

## 3. Pull Request Process

1. Ensure the project builds cleanly with zero TypeScript errors:
   ```bash
   npm run build
   ```
2. Verify that your changes do NOT introduce any hardcoded client names or strings into shared UI components.
3. Verify that all secret credentials remain in `.env` and are never committed to version control.
4. Open a pull request against the `main` branch with a clear summary of your changes and before/after screenshots if UI elements were modified.

---

## 4. Code Quality Standards

- **TypeScript**: No unnecessary `any` types; define interfaces in `types/database.ts`.
- **Accessibility**: Ensure buttons and inputs have accessible labels, visible focus rings, and valid contrast ratios.
- **Micro-interactions**: Keep animations purposeful and performant. Respect `prefers-reduced-motion`.
