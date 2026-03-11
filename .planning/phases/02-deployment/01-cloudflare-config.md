---
phase: 02-deployment
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/lib/AuthContext.js, wrangler.toml, .node-version]
autonomous: true
requirements: [DEPLOY-01]

must_haves:
  truths:
    - "Build command `npm run build` succeeds locally."
  artifacts:
    - path: "src/lib/AuthContext.jsx"
      provides: "Renamed AuthContext with JSX support."
    - path: "wrangler.toml"
      provides: "Cloudflare Pages configuration."
---

<objective>
Prepare the repository for Cloudflare Pages deployment by fixing build-breaking syntax issues and adding necessary configuration files.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Fix JSX Extensions</name>
  <files>src/lib/AuthContext.js</files>
  <action>Rename `src/lib/AuthContext.js` to `src/lib/AuthContext.jsx`.</action>
  <verify>ls src/lib/AuthContext.jsx</verify>
  <done>AuthContext renamed to .jsx.</done>
</task>

<task type="auto">
  <name>Task 2: Add Cloudflare Configuration</name>
  <files>wrangler.toml, .node-version</files>
  <action>Create `wrangler.toml` with basic Pages settings and `.node-version` set to `20`.</action>
  <verify>cat wrangler.toml && cat .node-version</verify>
  <done>Configuration files created.</done>
</task>

<task type="auto">
  <name>Task 3: Verify Build</name>
  <files>dist/</files>
  <action>Run `npm run build` and ensure success.</action>
  <verify>ls dist/index.html</verify>
  <done>Build successful.</done>
</task>

</tasks>

<success_criteria>
- File extensions corrected for JSX.
- Cloudflare configuration files present.
- `npm run build` completes without errors.
</success_criteria>
