import { memo, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useProgress } from "../hooks/useProgress.js";
import { projectProgress } from "../utils/progress.js";
import Accordion from "../components/Accordion.jsx";
import Checkbox from "../components/Checkbox.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

// Every project has these two categories.
const CATEGORIES = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

const TaskRow = memo(function TaskRow({ projectId, task, onToggle, onDelete }) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <Checkbox
        checked={task.done}
        onChange={(v) => onToggle(projectId, task.id, v)}
        label={`Mark "${task.title}" as done`}
      />
      <span
        className={`min-w-0 flex-1 break-words text-sm ${task.done ? "text-slate-500 line-through dark:text-slate-400" : ""}`}
      >
        {task.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(projectId, task.id)}
        aria-label={`Delete task "${task.title}"`}
        className="rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
});

function AddTaskForm({ label, onAdd }) {
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    const title = text.trim();
    if (!title) return;
    onAdd(title);
    setText("");
  }

  return (
    <form onSubmit={submit} className="mt-3 flex gap-2">
      <label className="sr-only" htmlFor={`add-${label}`}>
        {label}
      </label>
      <input
        id={`add-${label}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
        placeholder="Add a task..."
        className={inputClass}
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white "
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Add
      </button>
    </form>
  );
}

function ProjectBlock({ project, actions }) {
  const stats = useMemo(() => projectProgress(project), [project]);

  return (
    <Accordion
      title={project.name}
      subtitle={`${stats.all.done} / ${stats.all.total} tasks done`}
      percent={stats.all.percent}
      defaultOpen
      actions={
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `Delete project "${project.name}" and all its tasks?`,
              )
            ) {
              actions.deleteProject(project.id);
            }
          }}
          aria-label={`Delete project "${project.name}"`}
          className="rounded p-1.5 text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const s = stats[cat.key];
          const tasks = project.tasks.filter((t) => t.category === cat.key);
          return (
            <div
              key={cat.key}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="mb-1 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">{cat.label}</h3>
                <span className="text-xs tabular-nums text-slate-600 dark:text-slate-400">
                  {s.done}/{s.total} · {s.percent}%
                </span>
              </div>
              <ProgressBar
                value={s.percent}
                label={`${project.name} ${cat.label} progress`}
                size="sm"
              />
              {tasks.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  No {cat.label.toLowerCase()} tasks yet.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-slate-200 dark:divide-slate-800">
                  {tasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      projectId={project.id}
                      task={t}
                      onToggle={actions.toggleTask}
                      onDelete={actions.deleteTask}
                    />
                  ))}
                </ul>
              )}
              <AddTaskForm
                label={`${project.id}-${cat.key}`}
                onAdd={(title) => actions.addTask(project.id, cat.key, title)}
              />
            </div>
          );
        })}
      </div>
    </Accordion>
  );
}

export default function Projects() {
  const { state, actions } = useProgress();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function submit(e) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    actions.addProject(clean);
    setName("");
    setAdding(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Add your own projects. Each project has Frontend and Backend tasks.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white "
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add project
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={submit}
          className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <label className="sr-only" htmlFor="new-project-name">
            Project name
          </label>
          <input
            id="new-project-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Project name"
            className={`${inputClass} min-w-[12rem] flex-1`}
          />
          <button
            type="submit"
            className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white"
          >
            Save project
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setName("");
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </form>
      )}

      {state.projects.length === 0 && !adding && (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          No projects yet. Click "Add project" to create your first one.
        </p>
      )}

      {state.projects.map((p) => (
        <ProjectBlock key={p.id} project={p} actions={actions} />
      ))}
    </div>
  );
}
