# Pyrolysis Website

Static website built with pure `HTML`, `CSS`, `JavaScript`, and inline/custom `SVG`.

## Local preview

This project includes a small PowerShell server, so no Node or Python is required.

Run this inside `E:\PYROLYSIS`:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-local.ps1 -Port 8080
```

Then open:

```text
http://localhost:8080
```

## Publish to GitHub Pages

This project is already GitHub Pages-friendly because it is a plain static site:

- `index.html`
- `styles.css`
- `script.js`
- `assets/`
- `.nojekyll`

### Fastest way

1. Create a GitHub repository.
2. Push this folder to the repository root.
3. Open the repository on GitHub.
4. Go to `Settings -> Pages`.
5. Under `Build and deployment`, choose:
   - `Source: Deploy from a branch`
   - `Branch: main`
   - `Folder: / (root)`
6. Save.

GitHub Pages will publish the site automatically.

## Project structure

```text
.
|-- index.html
|-- styles.css
|-- script.js
|-- serve-local.ps1
|-- .nojekyll
`-- assets/
```

## Notes

- Because the site uses relative paths, it works well on GitHub Pages when deployed from the repo root.
- `.nojekyll` prevents GitHub Pages from applying Jekyll processing rules.
