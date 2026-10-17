import { memo, useMemo, useState } from 'react';
import { ExternalLink, Flag, NotebookPen } from 'lucide-react';
import { dsa } from '../content/index.js';
import { useProgress } from '../hooks/useProgress.js';
import { countDone, groupBy } from '../utils/progress.js';
import Accordion from '../components/Accordion.jsx';
import Badge from '../components/Badge.jsx';
import Checkbox from '../components/Checkbox.jsx';
import DebouncedTextarea from '../components/DebouncedTextarea.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Select from '../components/Select.jsx';

const groups = groupBy(dsa, 'category');
const tone = { Easy: 'green', Medium: 'amber', Hard: 'red' };

const difficultyOptions = [
  { value: 'all', label: 'All difficulties' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
];
const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Done' },
  { value: 'todo', label: 'Not done' },
  { value: 'revisit', label: 'Revisit' },
];

// One problem row. Memoised so only the changed row re-renders.
const DsaRow = memo(function DsaRow({ problem, entry, onPatch }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const done = !!(entry && entry.done);
  const revisit = !!(entry && entry.revisit);
  const notes = (entry && entry.notes) || '';

  return (
    <li className="py-2">
      <div className="flex flex-wrap items-center gap-3">
        <Checkbox
          checked={done}
          onChange={(v) => onPatch(problem.id, { done: v })}
          label={`Mark "${problem.title}" as done`}
        />
        <span className={`min-w-0 flex-1 text-sm ${done ? 'text-slate-500 line-through dark:text-slate-400' : ''}`}>
          {problem.title}
        </span>
        <Badge tone={tone[problem.difficulty] || 'slate'}>{problem.difficulty}</Badge>
        <button
          type="button"
          aria-pressed={revisit}
          aria-label={`Revisit flag for "${problem.title}"`}
          onClick={() => onPatch(problem.id, { revisit: !revisit })}
          className={`rounded p-1.5 ${
            revisit
              ? 'bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100'
              : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Flag className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-expanded={notesOpen}
          aria-label={`Notes for "${problem.title}"`}
          onClick={() => setNotesOpen(!notesOpen)}
          className="relative rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          {notes && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-indigo-500" />}
        </button>
        {problem.url && (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open "${problem.title}" in a new tab`}
            className="rounded p-1.5 text-indigo-700 hover:bg-slate-200 dark:text-indigo-300 dark:hover:bg-slate-800"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
      {notesOpen && (
        <div className="mt-2 pl-8">
          <DebouncedTextarea
            label="Notes"
            value={notes}
            rows={3}
            placeholder="Approach, mistakes, complexity..."
            onSave={(text) => onPatch(problem.id, { notes: text })}
          />
        </div>
      )}
    </li>
  );
});

export default function Dsa() {
  const { state, actions } = useProgress();
  const map = state.dsa;
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  const filtering = difficulty !== 'all' || status !== 'all' || query.trim() !== '';

  // Apply filters to each category.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        shown: g.items.filter((p) => {
          const e = map[p.id];
          if (difficulty !== 'all' && p.difficulty !== difficulty) return false;
          if (status === 'done' && !(e && e.done)) return false;
          if (status === 'todo' && e && e.done) return false;
          if (status === 'revisit' && !(e && e.revisit)) return false;
          if (q && !p.title.toLowerCase().includes(q)) return false;
          return true;
        }),
      }))
      .filter((g) => g.shown.length > 0);
  }, [map, difficulty, status, query]);

  const overall = useMemo(() => countDone(dsa, map), [map]);
  const shownCount = visible.reduce((n, g) => n + g.shown.length, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">DSA</h1>
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
          {overall.done} / {overall.total} done · {overall.percent}%
        </p>
        <ProgressBar value={overall.percent} label="DSA overall progress" />
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
        <Select label="Difficulty" value={difficulty} onChange={setDifficulty} options={difficultyOptions} />
        <Select label="Status" value={status} onChange={setStatus} options={statusOptions} />
        <div className="self-end">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by title" />
        </div>
      </div>

      {filtering && (
        <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
          {shownCount} problem{shownCount === 1 ? '' : 's'} match your filters.
        </p>
      )}

      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          No problems match. Try clearing the filters.
        </p>
      )}

      {visible.map((g, idx) => {
        // Percent uses the whole category, not only the filtered rows.
        const s = countDone(g.items, map);
        return (
          <Accordion
            key={g.name}
            title={g.name}
            subtitle={`${s.done} / ${s.total} done`}
            percent={s.percent}
            defaultOpen={idx === 0}
            forceOpen={filtering}
          >
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {g.shown.map((p) => (
                <DsaRow key={p.id} problem={p} entry={map[p.id]} onPatch={actions.patchDsa} />
              ))}
            </ul>
          </Accordion>
        );
      })}
    </div>
  );
}
