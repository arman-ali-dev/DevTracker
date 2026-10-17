# Dev Tracker

A personal progress tracker for job interview preparation. You tick items when you finish them and the app shows completion percentages.

- No login, no backend, no database. Everything runs in your browser.
- Progress is saved in `localStorage` (key `prep-tracker:v1`) and never leaves your browser.
- No analytics and no network requests (except the DSA links you click).

Stack: React 18, Vite, Tailwind CSS, react-router-dom (HashRouter), lucide-react.

## Install and run

You need Node.js 18 or newer.

```bash
npm install
npm run dev        # open the address shown in the terminal (usually http://localhost:5173)
```

Other commands:

```bash
npm run build      # production build into dist/
npm run preview    # serve the build locally
npm test           # run unit tests (Vitest)
```

## Edit the content

The app is fully driven by three files in `src/content/`. Replace the sample content with your real lists. No code change is needed.

**roadmap.json**

```json
[
  {
    "id": "phase-1",
    "title": "Core Java",
    "sections": [
      {
        "id": "p1-oop",
        "title": "OOP Concepts",
        "items": [
          { "id": "p1-oop-001", "title": "Classes, Objects, Constructors" }
        ]
      }
    ]
  }
]
```

**dsa.json**

```json
[
  {
    "id": "dsa-arrays-001",
    "category": "Arrays & Hashing",
    "title": "Contains Duplicate",
    "difficulty": "Easy",
    "url": "https://leetcode.com/problems/contains-duplicate/"
  }
]
```

**interview.json**

```json
[
  {
    "id": "java-collections-001",
    "group": "Core Java",
    "topic": "Collections",
    "priority": "must",
    "question": "What is the Java Collections Framework?"
  }
]
```

Rules:

- Every `id` must be unique and must never change. Your progress is saved by id.
- `difficulty` is `Easy`, `Medium` or `Hard`. `priority` is `must` or `extra`.
- Items appear in the order of the file. Categories and topics appear in the order they are first used.
- If you remove an item, its saved progress is kept but ignored in totals. If you add the same id back, the progress returns.
- In dev mode (`npm run dev`) a duplicate id is logged as an error in the browser console.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project to the `main` branch.
2. In the repository go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` runs the tests, builds with Vite and deploys.
4. Your site will be at `https://<your-user>.github.io/<repo-name>/`.

The workflow sets `VITE_BASE=/<repo-name>/` for you. To build by hand for a repo called `prep-tracker`:

```bash
VITE_BASE=/prep-tracker/ npm run build
```

The default base is `./`, which works for local use. The app uses HashRouter, so refreshing a page on GitHub Pages works (the address looks like `.../#/dsa`).

## Your progress is separate on localhost and on the live site

Browsers store `localStorage` per origin. `http://localhost:5173` and `https://<user>.github.io` are different origins, so **progress saved locally does not appear on the live site, and the other way round**. The same is true for different browsers and for private windows.

To move your progress:

1. On the old site open **Settings > Export JSON**.
2. On the new site open **Settings > Import progress** and choose the file.
3. Pick **Merge** (keep both, newest change wins) or **Replace** (use the file only).

Export now and then as a backup. Clearing browser data deletes your progress.

## Project structure

```
src/
  content/     roadmap.json, dsa.json, interview.json, index.js
  context/     ProgressContext.jsx (state + saving)
  hooks/       useProgress.js, useDebouncedValue.js
  pages/       Dashboard, Roadmap, Dsa, Interview, Settings
  components/  Layout, Accordion, ProgressBar, Checkbox, Badge, SearchInput, Select, ...
  utils/       progress.js (maths), storage.js, validate.js, contentCheck.js
  tests/       Vitest tests
```
