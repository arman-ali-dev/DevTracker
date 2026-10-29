import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { dsa, interview, roadmap, roadmapItems } from "../content/index.js";
import { useProgress } from "../hooks/useProgress.js";
import {
  combine,
  countDone,
  countDoneSince,
  groupBy,
  projectProgress,
  recentActivity,
  startOfToday,
  startOfWeek,
} from "../utils/progress.js";
import ProgressBar from "../components/ProgressBar.jsx";

// Pre-grouped content (content never changes while the app runs).
const dsaGroups = groupBy(dsa, "category");
const interviewGroups = groupBy(interview, "topic");
const phaseItems = roadmap.map((phase) => ({
  name: phase.title,
  items: roadmapItems.filter((i) => i.phaseId === phase.id),
}));

function ProjectBars({ projects }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold">Projects</h3>
      {projects.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No projects yet.{" "}
          <Link
            to="/projects"
            className="font-medium text-indigo-700 underline dark:text-indigo-300"
          >
            Add one
          </Link>
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const s = projectProgress(p);
            return (
              <li key={p.id}>
                <div className="mb-1 flex justify-between text-sm font-medium">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="tabular-nums">{s.all.percent}%</span>
                </div>
                {[
                  ["Frontend", s.frontend],
                  ["Backend", s.backend],
                ].map(([label, x]) => (
                  <div key={label} className="mb-2">
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{label}</span>
                      <span className="tabular-nums text-slate-600 dark:text-slate-400">
                        {x.done}/{x.total} · {x.percent}%
                      </span>
                    </div>
                    <ProgressBar
                      value={x.percent}
                      label={`${p.name} ${label} progress`}
                      size="sm"
                    />
                  </div>
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function SummaryCard({ title, to, stats }) {
  return (
    <Link
      to={to}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-2xl font-bold tabular-nums">
          {stats.percent}%
        </span>
      </div>
      <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
        {stats.done} / {stats.total} done
      </p>
      <ProgressBar value={stats.percent} label={`${title} progress`} />
    </Link>
  );
}

function MiniBars({ title, groups, map }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-3">
        {groups.map((g) => {
          const s = countDone(g.items, map);
          return (
            <li key={g.name}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="truncate pr-2">{g.name}</span>
                <span className="tabular-nums text-slate-600 dark:text-slate-400">
                  {s.done}/{s.total} · {s.percent}%
                </span>
              </div>
              <ProgressBar
                value={s.percent}
                label={`${g.name} progress`}
                size="sm"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Dashboard() {
  const { state } = useProgress();

  const stats = useMemo(() => {
    const r = countDone(roadmapItems, state.roadmap);
    const d = countDone(dsa, state.dsa);
    const i = countDone(interview, state.interview);
    const overall = combine([r, d, i]);

    // Project tasks (done today / recent activity also include them).
    const allTasks = state.projects.flatMap((p) =>
      p.tasks.map((t) => ({ ...t, projectName: p.name })),
    );
    const pj = combine(state.projects.map((p) => projectProgress(p).all));

    const today = startOfToday();
    const week = startOfWeek();
    const sinceCount = (since) =>
      countDoneSince(roadmapItems, state.roadmap, since) +
      countDoneSince(dsa, state.dsa, since) +
      countDoneSince(interview, state.interview, since) +
      allTasks.filter((t) => t.done && t.updatedAt >= since).length;

    const recentBase = recentActivity(
      [
        {
          kind: "Roadmap",
          items: roadmapItems,
          map: state.roadmap,
          linkTo: "/roadmap",
          getTitle: (x) => x.title,
        },
        {
          kind: "DSA",
          items: dsa,
          map: state.dsa,
          linkTo: "/dsa",
          getTitle: (x) => x.title,
        },
        {
          kind: "Interview",
          items: interview,
          map: state.interview,
          linkTo: "/interview",
          getTitle: (x) => x.question,
        },
      ],
      5,
    );
    const recentTasks = allTasks.map((t) => ({
      id: t.id,
      kind: "Project",
      title: `${t.title} (${t.projectName})`,
      done: t.done,
      updatedAt: t.updatedAt,
      linkTo: "/projects",
    }));
    const recent = [...recentBase, ...recentTasks]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    return {
      r,
      d,
      i,
      pj,
      overall,
      doneToday: sinceCount(today),
      doneWeek: sinceCount(week),
      recent,
    };
  }, [state.roadmap, state.dsa, state.interview, state.projects]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Overall + counters */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-1">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Overall completion
          </p>
          <p className="text-4xl font-bold tabular-nums">
            {stats.overall.percent}%
          </p>
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            {stats.overall.done} / {stats.overall.total} items
          </p>
          <ProgressBar value={stats.overall.percent} label="Overall progress" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Done today
          </p>
          <p className="text-4xl font-bold tabular-nums">{stats.doneToday}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Done this week
          </p>
          <p className="text-4xl font-bold tabular-nums">{stats.doneWeek}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Week starts on Monday
          </p>
        </div>
      </section>

      {/* Three summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Roadmap" to="/roadmap" stats={stats.r} />
        <SummaryCard title="DSA" to="/dsa" stats={stats.d} />
        <SummaryCard title="Interview" to="/interview" stats={stats.i} />
        <SummaryCard title="Projects" to="/projects" stats={stats.pj} />
      </section>

      {/* Mini bars */}
      <section className="grid gap-4 lg:grid-cols-3">
        <MiniBars
          title="Roadmap phases"
          groups={phaseItems}
          map={state.roadmap}
        />
        <MiniBars title="DSA categories" groups={dsaGroups} map={state.dsa} />
        <MiniBars
          title="Interview topics"
          groups={interviewGroups}
          map={state.interview}
        />
      </section>

      <ProjectBars projects={state.projects} />

      {/* Continue where you left */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">Continue where you left</h2>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nothing yet. Tick or edit an item and it will show up here.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {stats.recent.map((row) => (
              <li key={`${row.kind}-${row.id}`}>
                <Link
                  to={row.linkTo}
                  className="flex items-center justify-between gap-3 rounded py-2 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {row.title}
                    </span>
                    <span className="block text-xs text-slate-600 dark:text-slate-400">
                      {row.kind} · {row.done ? "done" : "edited"} ·{" "}
                      {new Date(row.updatedAt).toLocaleString()}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
