import { memo, useMemo } from 'react';
import { roadmap } from '../content/index.js';
import { useProgress } from '../hooks/useProgress.js';
import { countDone, combine } from '../utils/progress.js';
import Accordion from '../components/Accordion.jsx';
import Checkbox from '../components/Checkbox.jsx';

// One roadmap item. Memoised: only re-renders when its own "done" changes.
const RoadmapRow = memo(function RoadmapRow({ id, title, done, onToggle }) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <Checkbox checked={done} onChange={(v) => onToggle(id, v)} label={`Mark "${title}" as done`} />
      <span className={`text-sm ${done ? 'text-slate-500 line-through dark:text-slate-400' : ''}`}>{title}</span>
    </li>
  );
});

// Buttons to tick or untick a whole section.
function SectionActions({ section, onSetMany }) {
  const ids = section.items.map((i) => i.id);
  const btn =
    'rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800';
  return (
    <div className="flex gap-2">
      <button type="button" className={btn} onClick={() => onSetMany(ids, true)}>
        Tick all
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => {
          if (window.confirm(`Untick all items in "${section.title}"?`)) onSetMany(ids, false);
        }}
      >
        Untick all
      </button>
    </div>
  );
}

export default function Roadmap() {
  const { state, actions } = useProgress();
  const map = state.roadmap;

  // Percent for every section and phase.
  const stats = useMemo(
    () =>
      roadmap.map((phase) => {
        const sections = phase.sections.map((s) => ({ id: s.id, ...countDone(s.items, map) }));
        return { id: phase.id, ...combine(sections), sections };
      }),
    [map]
  );
  const overall = useMemo(() => combine(stats), [stats]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Roadmap</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {overall.done} / {overall.total} done · {overall.percent}%
        </p>
      </div>

      {roadmap.map((phase, pi) => {
        const ps = stats[pi];
        return (
          <Accordion
            key={phase.id}
            title={phase.title}
            subtitle={`${ps.done} / ${ps.total} done`}
            percent={ps.percent}
            defaultOpen={pi === 0}
          >
            <div className="space-y-3">
              {phase.sections.map((section, si) => {
                const ss = ps.sections[si];
                return (
                  <Accordion
                    key={section.id}
                    level={2}
                    title={section.title}
                    subtitle={`${ss.done} / ${ss.total} done`}
                    percent={ss.percent}
                    actions={<SectionActions section={section} onSetMany={actions.setRoadmapMany} />}
                  >
                    <ul>
                      {section.items.map((item) => (
                        <RoadmapRow
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          done={!!(map[item.id] && map[item.id].done)}
                          onToggle={actions.toggleRoadmap}
                        />
                      ))}
                    </ul>
                  </Accordion>
                );
              })}
            </div>
          </Accordion>
        );
      })}
    </div>
  );
}
