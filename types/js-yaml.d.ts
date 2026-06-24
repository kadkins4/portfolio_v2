// Ambient declaration for js-yaml (pinned 4.1.1, offline-installed without
// @types). Lets `next build`'s typecheck pass for scripts/sync-resume.ts.
// Swap for `@types/js-yaml` when back online.
declare module "js-yaml";
