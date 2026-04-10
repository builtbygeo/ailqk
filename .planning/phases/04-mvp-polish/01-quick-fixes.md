---
phase: 04-mvp-polish
plan: 01
type: execute
wave: 1
depends_on: [03-decoupling]
files_modified: [package.json, src/main.jsx, src/pages/Map.jsx, src/pages/AddLocation.jsx, README.md, src/data/bulgaria.js]
autonomous: true
requirements: [MVP-01, MVP-02]

must_haves:
  truths:
    - "Unused heavy dependencies (moment, three, react-quill, jspdf, lodash) are uninstalled."
    - "Leaflet marker icons load correctly from `/public/`."
    - "Map restricts bounds strictly to Bulgaria with a 'Focus Mask' (rest of world faded)."
    - "README.md contains zero references to the Base44 system."
    - "'Add Location' form includes Vanlife amenities (Water, Shade, Signal, etc.)."
    - "'Add Location' form has a 'Grab GPS' button for auto-detecting current location."
  artifacts: []
---

<objective>
Execute the top 5 high-priority quick fixes to establish a stable, fast, and fully localized "Wow" MVP baseline for the Bulgarian vanlife community.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Dependency Diet</name>
  <files>package.json</files>
  <action>Run `npm uninstall moment three react-quill jspdf lodash` to remove bloat.</action>
  <verify>grep "\"moment\"" package.json # Should return nothing</verify>
  <done>Heavy dependencies removed.</done>
</task>

<task type="auto">
  <name>Task 2: Leaflet Icon Fix</name>
  <files>src/main.jsx, public/</files>
  <action>Copy marker icons from leaflet's dist to public/, and update `src/main.jsx` with the `L.Icon.Default.mergeOptions` override.</action>
  <verify>ls public/marker-icon.png && grep mergeOptions src/main.jsx</verify>
  <done>Leaflet icons stabilized for Cloudflare.</done>
</task>

<task type="auto">
  <name>Task 3: Focus Bulgaria (Map Mask)</name>
  <files>src/pages/Map.jsx, src/data/bulgaria.js</files>
  <action>Implement a GeoJSON layer that masks the world outside Bulgaria using a semi-transparent 'inverted' polygon.</action>
  <verify>grep GeoJSON src/pages/Map.jsx</verify>
  <done>Map focused strictly on Bulgaria with faded surroundings.</done>
</task>

<task type="auto">
  <name>Task 4: Vanlife 'Add Location' Redesign</name>
  <files>src/pages/AddLocation.jsx</files>
  <action>Update form with checkboxes for vanlife amenities (Water, Shade, Cell Signal, Flat Ground, etc.) and add a 'Get GPS' button.</action>
  <verify>grep geolocation src/pages/AddLocation.jsx</verify>
  <done>Form is geared towards vanlife community.</done>
</task>

<task type="auto">
  <name>Task 5: Purge Base44 Docs</name>
  <files>README.md</files>
  <action>Rewrite README.md to remove all Base44 setup instructions and focus on local execution and Cloudflare deployment.</action>
  <verify>grep base44 README.md | grep -v exclude_this_check # Should be 0</verify>
  <done>README.md is clean.</done>
</task>

</tasks>

<success_criteria>
- Significantly smaller footprint in `package.json`.
- Map UI doesn't break in production.
- Map UX is tailored to Bulgaria.
- Documentation accurately reflects the standalone architecture.
</success_criteria>
