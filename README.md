# Folio — EPUB Reader

Minimalist desktop EPUB reader with auto-updates.

---

## 🚀 First-time setup

```bash
npm install
npm start        # test it
npm run dist     # build installer locally → dist/Folio Setup x.x.x.exe
```

---

## 📦 Publishing an update (the whole workflow)

### 1. Make your code changes

Edit files in `src/index.html`, `main.js`, etc.

### 2. Bump the version in package.json

```json
"version": "1.0.1"
```

### 3. Push to GitHub + tag the release

```bash
git add .
git commit -m "your changes"
git push
git tag v1.0.1
git push origin v1.0.1
```

That's it. GitHub Actions will:
- Spin up a Windows build machine
- Run `npm install` + `npm run release`
- Upload the installer to a GitHub Release automatically

### 4. Users get updated automatically

Every installed copy of Folio checks GitHub for new releases on startup.
When a new version is found it downloads silently in the background.
A small banner appears: **"Update ready → Restart & Install"**

---

## 🗂 File structure

```
folio-app/
├── main.js                          ← Electron main + auto-updater
├── package.json                     ← version lives here
├── src/
│   ├── index.html                   ← full UI
│   ├── preload.js                   ← IPC bridge
│   └── jszip.min.js
└── .github/workflows/release.yml   ← auto build on git tag
```

## ⌨️ Keyboard shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Prev / Next chapter |
| `B` | Bookmark |
| `Esc` | Close settings |
