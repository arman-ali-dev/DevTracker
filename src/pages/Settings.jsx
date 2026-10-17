import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import pkg from "../../package.json";
import { useProgress } from "../hooks/useProgress.js";
import { formatBytes, storageSize } from "../utils/storage.js";
import { validateProgress } from "../utils/validate.js";

const card =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900";
const button =
  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium";
const primary = `${button} bg-indigo-600 text-white hover:bg-indigo-700`;
const neutral = `${button} border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800`;

// Count how many items a progress object has.
function countEntries(data) {
  return ["roadmap", "dsa", "interview"].reduce(
    (n, k) => n + Object.keys(data[k] || {}).length,
    0,
  );
}

export default function Settings() {
  const { state, actions } = useProgress();
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null); // validated data waiting for merge / replace
  const [error, setError] = useState(null); // { title, details[] }
  const [message, setMessage] = useState("");

  // Download progress as a JSON file.
  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `prep-tracker-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setError(null);
    setMessage("Progress exported.");
  }

  // Read the chosen file and validate it before asking merge / replace.
  async function onFileChosen(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    setMessage("");
    setPending(null);
    setError(null);

    let data;
    try {
      data = JSON.parse(await file.text());
    } catch (err) {
      setError({
        title: "This file is not valid JSON.",
        details: ["Choose a file exported from Dev Tracker."],
      });
      return;
    }
    const result = validateProgress(data);
    if (!result.valid) {
      setError({
        title: "This file is not a valid Dev Tracker export.",
        details: result.errors,
      });
      return;
    }
    setPending(data);
  }

  function applyImport(mode) {
    actions.importData(pending, mode);
    setMessage(
      mode === "merge"
        ? "Imported and merged with your current progress."
        : "Imported and replaced your progress.",
    );
    setPending(null);
  }

  function resetAll() {
    if (
      !window.confirm(
        "Reset ALL progress? This deletes every tick, note and answer.",
      )
    )
      return;
    if (
      !window.confirm(
        "Last check: this cannot be undone. Did you export a backup? Reset now?",
      )
    )
      return;
    actions.resetAll();
    setPending(null);
    setError(null);
    setMessage("All progress was reset.");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      {message && (
        <p
          role="status"
          className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-950 dark:bg-emerald-900/40 dark:text-emerald-100"
        >
          {message}
        </p>
      )}

      <section className={card}>
        <h2 className="mb-1 font-semibold">Export progress</h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Download your progress as a JSON file. Use it as a backup or to move
          progress to another browser or site.
        </p>
        <button type="button" onClick={exportProgress} className={primary}>
          <Download className="h-4 w-4" aria-hidden="true" /> Export JSON
        </button>
      </section>

      <section className={card}>
        <h2 className="mb-1 font-semibold">Import progress</h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Choose a file you exported before. It is checked first, then you pick
          merge or replace.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onFileChosen}
          className="sr-only"
          id="import-file"
        />
        <button
          type="button"
          onClick={() => fileRef.current && fileRef.current.click()}
          className={neutral}
        >
          <Upload className="h-4 w-4" aria-hidden="true" /> Choose JSON file
        </button>

        {error && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100"
          >
            <p className="font-semibold">{error.title}</p>
            <ul className="mt-1 list-inside list-disc">
              {error.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="mt-1">Nothing was changed.</p>
          </div>
        )}

        {pending && (
          <div className="mt-3 rounded-lg border border-indigo-300 bg-indigo-50 p-3 text-sm dark:border-indigo-800 dark:bg-indigo-950/40">
            <p className="mb-2">
              File is valid ({countEntries(pending)} saved items). How do you
              want to import it?
            </p>
            <ul className="mb-3 list-inside list-disc text-slate-700 dark:text-slate-300">
              <li>
                <strong>Merge</strong>: keep both. If an item is in both, the
                newest change wins.
              </li>
              <li>
                <strong>Replace</strong>: delete current progress and use the
                file only.
              </li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyImport("merge")}
                className={primary}
              >
                Merge
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Replace all current progress with the file?",
                    )
                  )
                    applyImport("replace");
                }}
                className={neutral}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className={neutral}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-1 font-semibold">Reset all progress</h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Deletes every tick, note and answer from this browser. You will be
          asked twice.
        </p>
        <button
          type="button"
          onClick={resetAll}
          className={`${button} bg-red-700 text-white hover:bg-red-800`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Reset all progress
        </button>
      </section>
    </div>
  );
}
