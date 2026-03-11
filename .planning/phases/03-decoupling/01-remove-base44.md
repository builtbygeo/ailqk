---
phase: 03-decoupling
plan: 01
type: execute
wave: 1
depends_on: [02-deployment]
files_modified: [package.json, vite.config.js, src/lib/AuthContext.jsx, src/lib/app-params.js, src/api/base44client.js]
autonomous: true
requirements: [DECOUPLE-01]

must_haves:
  truths:
    - "Base44 packages removed from node_modules."
    - "App starts and renders locally without Base44 backend."
  artifacts:
    - path: "src/lib/AuthContext.jsx"
      provides: "Stubbed authentication for local testing."
---

<objective>
Completely decouple the application from Base44 infrastructure to allow for independent local execution and future Cloudflare deployment.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Remove Base44 Packages</name>
  <files>package.json, vite.config.js</files>
  <action>Remove @base44/sdk and @base44/vite-plugin. Clean up vite.config.js.</action>
  <verify>grep "@base44" package.json # Should be empty</verify>
  <done>Dependencies removed.</done>
</task>

<task type="auto">
  <name>Task 2: Stub Authentication</name>
  <files>src/lib/AuthContext.jsx</files>
  <action>Replace base44 SDK calls with mock auth state (user: { name: 'Local User' }).</action>
  <verify>Review AuthContext.jsx for @base44 imports.</verify>
  <done>Authentication stubbed.</done>
</task>

<task type="auto">
  <name>Task 3: Clean up API & Params</name>
  <files>src/api/base44client.js, src/lib/app-params.js</files>
  <action>Delete base44client.js and remove base44 keys from app-params.js.</action>
  <verify>ls src/api/base44client.js # Should fail</verify>
  <done>API and params cleaned.</done>
</task>

<task type="auto">
  <name>Task 4: Global Component Cleanup</name>
  <files>src/**/*</files>
  <action>Search and remove remaining @base44 imports across the codebase.</action>
  <verify>grep -r "@base44" src/ | wc -l # Should be 0</verify>
  <done>Codebase cleaned of base44 references.</done>
</task>

</tasks>

<success_criteria>
- No @base44 packages in project.
- No @base44 imports in source code.
- `npm run dev` works locally without external auth dependencies.
</success_criteria>
