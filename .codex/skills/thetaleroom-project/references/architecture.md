# TheTaleRoom Architecture Reference

## Purpose

Use this reference to keep TheTaleRoom maintainable as a Next.js App Router full-stack project. The goal is clear ownership: pages compose, route-local folders hold feature details, shared folders hold reusable behavior, and server-only work stays off the client.

## Directory Standard

```txt
src/
  app/
    page.js
    layout.js
    globals.css
    (pages)/
      <routeSlug>/
        page.js
        components/
        helpers/
        handlers/
    api/
      <domain>/
        <action>/
          route.js
  components/
    layout/
    navigation/
    tools/
    ui/
  config/
  hooks/
  lib/
```

Use `src/app/(pages)/<routeSlug>/page.js` for public pages. Keep the main entry in `page.js`; split sibling `components`, `helpers`, and `handlers` once the page does more than simple composition.

Use `src/app/api/<domain>/<action>/route.js` for API routes. Validate request body, call server-side lib code, return standard JSON, and avoid embedding domain-heavy logic directly in the route handler.

## Shared Layers

Use `src/components/ui/` for repeated controls: Button, TextField, SelectField, TextAreaField, SegmentedControl, Pill, PillList, ContentBlock, StatusRow, Modal, Drawer, Tabs, and RecordFields.

Use `src/components/layout/`, `src/components/navigation/`, `src/components/sidebar/`, and `src/components/tools/` for shell-level UI and tool chrome.

Use `src/hooks/` for logic involving lifecycle, state, effects, listeners, refs, and browser APIs. Do not put pure data transforms in hooks.

Use `src/config/` for stable options, navigation, route definitions, labels, story metadata, feature flags, and form choices.

Use `src/lib/` for pure functions, formatting, validation, HTTP helpers, storage wrappers, auth/session, database facades, AI provider wrappers, records, and server-side domain logic.

## Naming

Use PascalCase for component files:

```txt
StoryCard.js
DashboardPanel.js
RecordDetailModal.js
```

Use camelCase for non-component JavaScript files:

```txt
storyTherapy.js
httpJson.js
valueValidation.js
```

Use kebab-case only for URL route slugs:

```txt
story-studio
account-settings
```

Use camelCase for non-route folders and feature folders:

```txt
storyRoom/
storyRoom/helpers/
storyRoom/methods/
storyRoom/hooks/
```

Inside a feature or route-local area, keep responsibilities in separate sibling folders:

```txt
components/  # PascalCase component files
helpers/     # camelCase pure data transforms, labels, formatting, copy helpers
methods/     # camelCase event calculations and reusable client-side procedures
hooks/       # camelCase React state/effect/ref orchestration
```

Do not place components, helpers, methods, and hooks together in one catch-all feature folder. Split them before a component file starts handling rendering, request orchestration, text helpers, motion helpers, and state hooks at the same time.

Name route-local helper files as `help<Route><Thing>.js`. Export helper functions with a `help` prefix.

Name route-local handler files as `handle<Route><Action>.js` or `handle<Container><Action>.js`. Export handler functions with a `handle` prefix.

## Helper Rules

Use helpers for pure data transformation, mapping, validation, parsing, formatting, route-local calculation, and non-React logic.

Promote a helper to `src/lib/` when multiple routes need it. Search first:

```bash
rg "functionName"
rg "similar logic keyword"
rg --files
```

Do not create duplicate `cn`, `cx`, formatting, validation, normalization, or scoring wrappers. Use the shared utility when it exists.

## Handler Rules

Use handlers for user events, async actions, API requests, form submit orchestration, localStorage/sessionStorage operations, multi-state updates, and reusable callbacks.

Keep JSX wiring thin:

```js
<button onClick={handleSubmit}>Save</button>
```

Move bulky request, validation, state, and transformation logic out of the component body.

## Client and Server Boundaries

Client components may handle UI interaction, local state, form input, draft cache, route transition, and internal `/api/...` calls.

Server-side code handles database access, authentication, provider API calls, file system access, secrets, server-only validation, and persistence.

Never expose database calls, private API keys, provider secrets, file system access, auth secrets, or raw environment secrets to client components.

## Records and Persistence

Use a shared persistence facade such as `src/lib/database.js`, `src/lib/localDatabase.js`, or `src/lib/storage.js`. Do not write SQL or direct file operations in pages, components, handlers, or API route bodies.

Use versioned draft keys:

```js
const DRAFT_KEY = "featureName:v2:draft";
```

For story or history records, prefer:

```txt
id
account_id
feature
title
metadata
input
result
score
created_at
updated_at
```

Keep live result rendering and history detail rendering aligned by using the same structured result shape.

## AI Feature Pattern

For a new AI-driven feature, scaffold:

```txt
src/config/<featureName>Options.js
src/lib/<featureName>Service.js
src/lib/<featureName>Practice.js
src/app/api/ai/<featureName>/<action>/route.js
src/app/(pages)/<featureName>/page.js
```

Flow:

1. Define options in config.
2. Put prompts, parsing, scoring, and validation in lib.
3. Expose API under `src/app/api/ai/<featureName>/<action>/route.js`.
4. Call external AI providers only from server-side lib.
5. Let the client call only local `/api/...` routes.
6. Create a record after successful submission.
7. Load history through a records API.
8. Use versioned draft cache for user input.

## UI and Styling

Prefer Tailwind utilities for ordinary styling. Keep global CSS limited to root/body, tokens, scrollbars, complex reusable animation, third-party resets, and layout-level background.

Keep the visual system consistent: color, typography, spacing, border, radius, hover/focus/disabled states, metadata display, form controls, and layout density.

Do not create pass-through wrappers that only rename shared components. A wrapper needs real value: domain rendering, data transformation, layout behavior, local state, or interaction logic.

## Feature Checklist

When adding a complete feature:

1. Define the route.
2. Update navigation config.
3. Create `page.js`.
4. Split route-local components.
5. Add route-local helpers.
6. Add route-local handlers.
7. Add needed shared config.
8. Add API routes.
9. Put server-side domain logic in `src/lib`.
10. Add auth/session validation when relevant.
11. Add persistence through the shared layer.
12. Add versioned draft cache when needed.
13. Add records/history if the user submits meaningful work.
14. Use shared UI components.
15. Remove duplicate helpers, wrappers, and empty legacy folders.
