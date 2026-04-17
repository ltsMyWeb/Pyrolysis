# Pyrolysis Website

Static website built with pure `HTML`, `CSS`, `JavaScript`, and custom `SVG`.

## Local preview

This project includes a small PowerShell server, so no Node or Python is required.

Run this inside the project folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-local.ps1 -Port 8080
```

Then open:

```text
http://localhost:8080
```

## Publish to GitHub Pages

This project is GitHub Pages-friendly because it is a plain static site:

- `index.html`
- `styles.css`
- `script.js`
- `assets/`
- `.nojekyll`

### GitHub Pages setup

1. Open the GitHub repository.
2. Go to `Settings -> Pages`.
3. Under `Build and deployment`, choose:
   - `Source: Deploy from a branch`
   - `Branch: main`
   - `Folder: / (root)`
4. Save.

GitHub Pages will publish the site automatically.

## Project structure

```text
.
|-- index.html
|-- styles.css
|-- script.js
|-- serve-local.ps1
|-- publish-github-pages.bat
|-- .nojekyll
`-- assets/
```

## Notes

- Relative paths are already set up for GitHub Pages root deployment.
- `.nojekyll` prevents GitHub Pages from applying Jekyll processing rules.
