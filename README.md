# DRD Fitness Static Site

## Route map (static)
- / maps to /index.html
- /cut-controller/ maps to /cut-controller/index.html
- /macro-calculator/ maps to /macro-calculator/index.html
- /workouts/ maps to /workouts/index.html

## Vercel 404 checklist
- Confirm each route folder exists at repo root and contains an index.html.
- Confirm vercel.json has cleanUrls + trailingSlash and explicit rewrites.
- Redeploy after adding new folders or routes.
- Test both with and without trailing slash.
- Check that the URL matches the folder name exactly.
