---
name: thetaleroom-project
description: Build and maintain TheTaleRoom, a Next.js App Router full-stack prototype for an empathy-driven interactive story room. Use when working in this repository on project architecture, route scaffolding, shared UI/components, config/lib/hooks, API routes, AI story/narrative-therapy workflows, records/history, persistence boundaries, or feature additions that must follow the local structure.
---

# TheTaleRoom Project

## Start

Read this skill before changing TheTaleRoom. Treat the repository as a Next.js App Router project with route-local feature code and shared layers for reusable UI, hooks, config, and server-safe logic.

Before adding anything, inspect nearby files with `rg --files` and search for matching helpers, UI wrappers, handlers, config, API routes, and lib functions. Reuse an existing layer when it already exists.

## Core Workflow

1. Identify the route or domain being changed.
2. Keep route-bound UI and behavior next to its route under `src/app/(pages)/<routeSlug>/`.
3. Promote reusable UI to `src/components/`, reusable state/effects to `src/hooks/`, reusable options to `src/config/`, and pure/server helpers to `src/lib/`.
4. Keep client components away from database, provider secrets, external API keys, file system access, and server-only provider calls.
5. Add or update API routes under `src/app/api/<domain>/<action>/route.js`.
6. Store stable records/history through the shared records or database layer.
7. Keep `page.js` as a thin composition surface; move complex rendering, event handling, parsing, validation, scoring, and request logic into the correct local or shared layer.
8. Update `src/config/navigation.js` whenever adding, renaming, or removing public routes.
9. Validate with the narrowest useful command, then run the broader build or lint command when available.

## Architecture Rules

Use this placement map:

- `src/app/page.js`: homepage or primary project entry.
- `src/app/(pages)/<routeSlug>/page.js`: public route entry.
- `src/app/(pages)/<routeSlug>/components/`: components used only by that route.
- `src/app/(pages)/<routeSlug>/helpers/`: route-local pure transformations and validation.
- `src/app/(pages)/<routeSlug>/handlers/`: route-local user events, async actions, request orchestration, local storage actions, and multi-state callbacks.
- `src/app/api/<domain>/<action>/route.js`: API route handlers.
- `src/components/ui/`: shared controls such as Button, TextField, Modal, Tabs, Pill, StatusRow, and form fields.
- `src/components/layout/`, `src/components/navigation/`, `src/components/tools/`: shared shell, navigation, and utility chrome.
- `src/hooks/`: React lifecycle/state/effect/browser API logic.
- `src/config/`: navigation, story catalog, feature options, labels, and constants.
- `src/lib/`: pure utilities, validation, formatting, persistence facades, auth/session, AI service wrappers, records, and server-side domain logic.

Use PascalCase for component files and camelCase for non-component JavaScript files. Name route-local helpers `help<Route><Thing>.js` and exported helper functions with `help...`. Name handlers `handle<Route><Action>.js` or `handle<Container><Action>.js` and exported handler functions with `handle...`.

## Styling Rules

Write JSX `className` values as double-quoted static strings (`className="..."`) or template literals (``className={`...`}``) when composing classes. A direct passthrough such as `className={cactusClassicalSerif.className}` or `className={className}` is allowed when no classes are being composed.

Do not use `cx`, `clsx`, `classnames`, or equivalent class-name composition helpers. Compose conditional classes inline inside the `className` template literal.

When using `${...}` inside a `className` template literal, put each interpolation on its own line, and keep the full interpolation expression on that single line.

## TheTaleRoom Domain

Preserve the project identity: TheTaleRoom is an empathy-driven interactive story room for narrative release, gentle containment, and returning the user to the story line. Treat the product as a prototype, not a clinical replacement.

When building AI story features:

- Keep provider calls server-side through `src/lib/aiService.js` or a domain-specific service.
- Keep story prompt, parsing, safety checks, emotion tags, and response shaping in `src/lib/storyTherapy.js` or a feature-specific lib file.
- Return structured objects from API routes instead of flattened text.
- Normalize scores to `0-100` only when evaluation is truly required.
- Detect high-risk distress language and route to supportive, non-clinical crisis guidance.
- Persist records with stable fields: `id`, `account_id`, `feature`, `title`, `metadata`, `input`, `result`, `score`, `created_at`, `updated_at`.

## References

Read `references/architecture.md` before scaffolding or refactoring shared structure, API routes, handlers, helpers, persistence, or navigation.

Read `references/product.md` before changing story flow, UX language, narrator behavior, AI response logic, multimodal architecture, or visual direction.
