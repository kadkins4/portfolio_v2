# Projects-Only Portfolio with Category Tags

## Decision

Simplify portfolio to projects-only. Remove writing/hobby types. Replace fixed type system with freeform category tags. Rename /work to /projects.

## Rationale

- Writing content isn't being used and won't be
- Hobbies are better suited to a separate tracker app (future side project)
- Freeform tags ("Game", "Work", "Tool", etc.) are more flexible than fixed types
- "/projects" communicates intent better than "/work" for a portfolio

## Design

### Keystatic Schema

- Remove: `type` select field (project/writing/hobby)
- Add: `tags` array of freeform text strings
- Keep: `featured`, `order`, and all other existing fields
- Rename content directory: `content/work/` -> `content/projects/`
- Update collection path in keystatic.config.ts

### Routes

- `/work` -> `/projects`
- `/work/[slug]` -> `/projects/[slug]`
- No redirects needed (site not yet widely visited)

### Grid Page (/projects)

- Title: "Projects"
- Filter buttons generated dynamically from all tags across entries
- "All" button stays as default
- Cards show tag(s) with single neutral style

### Card Component

- Support multiple tags per card
- Remove TagVariant type and per-type color mapping
- Single neutral tag style
- Remove placeholder type icons (pencil/gear/diamond) — keep letter initial only

### Detail Page (/projects/[slug])

- Tags shown below title
- Remove single type tag, show all tags instead

### Navigation

- Header "Work" link -> "Projects"

### Types

- Remove `WorkItemType`
- Update `WorkItem` to replace `type` with `tags: string[]`

### Files Affected

- `keystatic.config.ts` — schema changes
- `src/types.ts` — type changes
- `src/app/(portfolio)/work/` -> `src/app/(portfolio)/projects/` — route rename
- `src/components/WorkCard.tsx` — tag display changes
- `src/components/WorkGrid.tsx` — filter logic changes
- `src/components/Tag.tsx` — simplify to single variant
- `src/components/Header.tsx` — nav link update
- `content/work/` -> `content/projects/` — content migration
