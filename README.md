# Time Trackers

A simple, local-only time tracker for side jobs. All data stays in your browser's localStorage — no accounts, no servers, no sync.

## Features

- **One-tap timer** — start/stop tracking with a single button; sessions crossing midnight are split automatically
- **Multiple trackers** — track different jobs in separate tabs, each with its own records
- **Editable records** — fix dates, times, adjustments (minutes), and notes inline
- **Calendar heatmap** — see how much you worked each day at a glance; click a day to filter records
- **Monthly totals** — running totals per month with the current month highlighted
- **CSV import/export** — take your data anywhere
- **Light/dark theme, English/Japanese UI**

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) (TDD)
- [Biome](https://biomejs.dev) (formatter + linter)
- pnpm + [mise](https://mise.jdx.dev)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `pnpm dev`          | Start the development server   |
| `pnpm build`        | Production build               |
| `pnpm test`         | Run the test suite             |
| `pnpm test:watch`   | Run tests in watch mode        |
| `pnpm lint`         | Lint with Biome                |
| `pnpm format`       | Format with Biome              |
| `pnpm format:check` | Check formatting without fixes |
| `pnpm check`        | Biome format + lint + fix      |

## License

[MIT](LICENSE)
