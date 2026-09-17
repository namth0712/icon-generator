# AGENTS.md

This is a tiny static browser utility. Keep it tiny.

## Core rule

Prefer the simplest working solution.

The current application is only a few hundred lines of code.
New implementation should remain in the same order of magnitude unless a
requested feature genuinely requires more code.

Do not turn this project into a framework or architecture exercise.

## Engineering rules

- Prefer browser-native APIs before adding dependencies.
- Reuse existing code and dependencies before adding new ones.
- Add a dependency only when it clearly simplifies the implementation.
- Prefer a few readable files over many tiny modules.
- Keep related logic together when splitting it provides no real benefit.
- Avoid premature abstraction and future-proofing.
- Avoid generic helpers used only once.
- Avoid unnecessary configuration.
- Do not add features that were not requested.
- Do not refactor unrelated working code.
- Make the smallest safe change that solves the task.

Do not introduce these unless genuinely required:

- backend services
- databases
- authentication
- routers
- state-management libraries
- dependency injection
- repositories
- service layers
- factories
- event buses
- plugin systems
- generic architecture layers

## Project constraints

- Static browser application.
- Must work on GitHub Pages.
- Image processing happens locally in the browser.
- User images must not be uploaded anywhere.
- No backend.
- No analytics.
- No tracking.
- No accounts.
- No persistent storage requirement.
- `dist/` is committed and used for deployment.

## Image processing

- Preserve image quality as much as reasonably possible in the browser.
- Always resize each output directly from the original source.
- Never resize progressively from one generated size to another.
- Preserve transparency where applicable.
- Treat SVG as vector input and render each requested size directly.
- Prefer native browser APIs when quality is sufficient.
- Use a small specialized dependency only when it materially improves
  resize or export quality.

## UI

Keep the interface simple and functional.

Primary flow:

1. Select or drop an image.
2. Preview the source.
3. Generate icon sizes automatically.
4. Preview generated icons.
5. Download one icon or download all as ZIP.

Do not add complex navigation or application structure.

## Verification

After changes:

- run the build
- run existing tests if any
- verify GitHub Pages compatible asset paths
- verify generated images have expected dimensions
- verify ZIP generation
- report what changed

Do not create unnecessary tests for trivial implementation details.

## Git

Never commit automatically.

Do not run:

- git commit
- git amend
- git rebase
- git squash

Stop after implementation, verification, and summary.