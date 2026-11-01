# zabedz.github.io

Source for <https://zabedz.github.io/>. SvelteKit, prerendered to static HTML, deployed by
GitHub Actions on every push to `main`.

## Edit the page

All copy and data live in `src/lib/content/`. Components never need editing for a content change.

| Change                                                               | File                 |
| -------------------------------------------------------------------- | -------------------- |
| Name, headline, about text, top links                                | `site.ts`            |
| Section order, titles, which projects show, which get a pinned scene | `chapters.ts`        |
| One project's text, status, stats, chart, images, links              | `projects/<slug>.ts` |
| What each field means                                                | `schema.ts`          |

## Add or update a project

1. Copy any file in `src/lib/content/projects/` to `<slug>.ts` and set `slug` to match.
   Required: `slug`, `repo`, `title`, `pitch`, `summary`, `status`, `stack`, `highlights`.
   Everything else is optional and its block disappears when left out.
2. Add `{ slug: '<slug>' }` to a chapter in `chapters.ts`. Add `featured: true` for a pinned
   scene. Remove the entry to hide a project without deleting its file.
3. Images: save PNG or JPEG files in `assets/projects/<slug>/`, reference them as
   `'<slug>/<name>'`, then run `pnpm images`. A `dark` variant is shown in dark mode.
4. `pnpm test` checks every entry (images present, https links, chart lengths, banned words).
   `pnpm dev` shows the page.

For unfinished work set `status: 'active'` and say what is missing in `statusNote`. Leave
`stats` and `visual` out until there are results to show.

A repo under another owner is shown as a team project and needs `role`.

## Commands

| Task                               | Command                                         |
| ---------------------------------- | ----------------------------------------------- |
| Install                            | `pnpm install`                                  |
| Dev server                         | `pnpm dev`                                      |
| Encode images                      | `pnpm images` (needs `ffmpeg` and `avifenc`)    |
| Refresh last-updated dates         | `pnpm fetch:projects` (optional `GITHUB_TOKEN`) |
| Types, lint, unit tests            | `pnpm check`, `pnpm lint`, `pnpm test`          |
| Production build and browser tests | `pnpm test:e2e`                                 |
| Preview the build                  | `pnpm build && pnpm preview`                    |

Requires Node 26 (`.nvmrc`) and pnpm 12 (`packageManager`).

## Licences

Instrument Sans is under the SIL Open Font License (`static/fonts/OFL.txt`). Project images
come from each project's own repository.
