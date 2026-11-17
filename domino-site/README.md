# DÖMÌNO — static site (no build step)

Files: index.html, app.js, style.css, img/, vercel.json

## Deploy on Vercel
1. Push this folder to a GitHub repo (files at the repo root).
2. vercel.com > Add New > Project > import the repo.
3. Framework Preset: **Other**. Build Command: empty. Output Directory: `.` (or leave default). Deploy.
(Or: `npx vercel` in this folder, then `npx vercel --prod`.)

## Editing content
Site content (email, bio, series, works, room settings) lives in the JSON block
`<script id="sitedata">` in index.html. Image paths point to img/. The in-page
"Edit site" / Design saving only works inside the Claude artifact; on Vercel,
edit the JSON and push to update. The 3D room needs internet (three.js + Google Fonts CDNs).
