import { memo, useEffect, useMemo, useRef, useState } from "react";
import { MessageSquareText, Shuffle } from "lucide-react";
import { interview } from "../content/index.js";
import { useProgress } from "../hooks/useProgress.js";
import { countDone, groupBy } from "../utils/progress.js";
import Accordion from "../components/Accordion.jsx";
import Badge from "../components/Badge.jsx";
import Checkbox from "../components/Checkbox.jsx";
import DebouncedTextarea from "../components/DebouncedTextarea.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SearchInput from "../components/SearchInput.jsx";
import Select from "../components/Select.jsx";

const groups = groupBy(interview, "topic");
const mustItems = interview.filter((q) => q.priority === "must");

const CONFIDENCE = ["none", "weak", "ok", "strong"];
const confTone = { none: "slate", weak: "red", ok: "amber", strong: "green" };

const topicOptions = [
  { value: "all", label: "All topics" },
  ...groups.map((g) => ({ value: g.name, label: g.name })),
];
const priorityOptions = [
  { value: "all", label: "All" },
  { value: "must", label: "Must only" },
];
const statusOptions = [
  { value: "all", label: "All" },
  { value: "done", label: "Done" },
  { value: "todo", label: "Not done" },
];
const confidenceOptions = [
  { value: "all", label: "All" },
  ...CONFIDENCE.map((c) => ({ value: c, label: c })),
];

const QuestionRow = memo(function QuestionRow({
  q,
  entry,
  onPatch,
  focusToken,
}) {
  const [answerOpen, setAnswerOpen] = useState(false);
  const rowRef = useRef(null);
  const done = !!(entry && entry.done);
  const confidence = (entry && entry.confidence) || "none";
  const answer = (entry && entry.answer) || "";

  useEffect(() => {
    if (focusToken > 0) {
      setAnswerOpen(true);
      if (rowRef.current)
        rowRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [focusToken]);

  return (
    <li
      ref={rowRef}
      className={`py-3 ${focusToken > 0 ? "rounded-lg bg-indigo-50 px-2 ring-2 ring-indigo-400 dark:bg-indigo-950/40" : ""}`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={done}
            onChange={(v) => onPatch(q.id, { done: v })}
            label={`Mark "${q.question}" as done`}
          />
        </div>
        <p
          className={`min-w-0 flex-1 text-sm ${done ? "text-slate-500 line-through dark:text-slate-400" : ""}`}
        >
          {q.question}
        </p>

        <div className="flex items-center gap-1">
          <Badge tone={confTone[confidence]}>{confidence}</Badge>
          <label className="sr-only" htmlFor={`conf-${q.id}`}>
            Confidence for "{q.question}"
          </label>
          <select
            id={`conf-${q.id}`}
            value={confidence}
            onChange={(e) => onPatch(q.id, { confidence: e.target.value })}
            className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {CONFIDENCE.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          aria-expanded={answerOpen}
          aria-label={`My answer for "${q.question}"`}
          onClick={() => setAnswerOpen(!answerOpen)}
          className="relative rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          {answer && (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-indigo-500" />
          )}
        </button>
      </div>
      {answerOpen && (
        <div className="mt-2 pl-8">
          <DebouncedTextarea
            label="My answer"
            value={answer}
            rows={5}
            placeholder="Write your answer in your own words..."
            onSave={(text) => onPatch(q.id, { answer: text })}
          />
        </div>
      )}
    </li>
  );
});

export default function Interview() {
  const { state, actions } = useProgress();
  const map = state.interview;

  const [topic, setTopic] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [confidence, setConfidence] = useState("all");
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(null); // { id, topic, n }
  const [notice, setNotice] = useState("");

  const filtering =
    topic !== "all" ||
    priority !== "all" ||
    status !== "all" ||
    confidence !== "all" ||
    query.trim() !== "";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => topic === "all" || g.name === topic)
      .map((g) => ({
        ...g,
        shown: g.items.filter((item) => {
          const e = map[item.id];
          if (priority === "must" && item.priority !== "must") return false;
          if (status === "done" && !(e && e.done)) return false;
          if (status === "todo" && e && e.done) return false;
          if (
            confidence !== "all" &&
            ((e && e.confidence) || "none") !== confidence
          )
            return false;
          if (q && !item.question.toLowerCase().includes(q)) return false;
          return true;
        }),
      }))
      .filter((g) => g.shown.length > 0);
  }, [map, topic, priority, status, confidence, query]);

  const all = useMemo(() => countDone(interview, map), [map]);
  const must = useMemo(() => countDone(mustItems, map), [map]);
  const shownCount = visible.reduce((n, g) => n + g.shown.length, 0);

  // Pick a random question with confidence = weak.
  function pickRandomWeak() {
    const weak = interview.filter(
      (item) => map[item.id] && map[item.id].confidence === "weak",
    );
    if (weak.length === 0) {
      setNotice(
        'No question is marked "weak" yet. Set a confidence tag first.',
      );
      return;
    }
    const pick = weak[Math.floor(Math.random() * weak.length)];
    // Clear filters so the question is visible.
    setTopic("all");
    setPriority("all");
    setStatus("all");
    setConfidence("all");
    setQuery("");
    setNotice(`Random weak question: ${weak.length} weak in total.`);
    setFocus({ id: pick.id, topic: pick.topic, n: Date.now() });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Interview</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
              All questions: {all.done} / {all.total} · {all.percent}%
            </p>
            <ProgressBar
              value={all.percent}
              label="Interview overall progress"
            />
          </div>
          <div>
            <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
              Must only: {must.done} / {must.total} · {must.percent}%
            </p>
            <ProgressBar
              value={must.percent}
              label="Interview must-only progress"
              color="bg-emerald-600 dark:bg-emerald-400"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Topic"
            value={topic}
            onChange={setTopic}
            options={topicOptions}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={priorityOptions}
          />
          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />
          <Select
            label="Confidence"
            value={confidence}
            onChange={setConfidence}
            options={confidenceOptions}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[12rem] flex-1">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search questions"
            />
          </div>
          <button
            type="button"
            onClick={pickRandomWeak}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white "
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Random weak question
          </button>
        </div>
        {notice && (
          <p
            className="text-sm text-slate-700 dark:text-slate-300"
            aria-live="polite"
          >
            {notice}
          </p>
        )}
      </div>

      {filtering && (
        <p
          className="text-sm text-slate-600 dark:text-slate-400"
          aria-live="polite"
        >
          {shownCount} question{shownCount === 1 ? "" : "s"} match your filters.
        </p>
      )}

      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          No questions match. Try clearing the filters.
        </p>
      )}

      {visible.map((g, idx) => {
        // Percent uses the whole topic, not only the filtered rows.
        const s = countDone(g.items, map);
        const m = countDone(
          g.items.filter((x) => x.priority === "must"),
          map,
        );
        return (
          <Accordion
            key={g.name}
            title={g.name}
            subtitle={`${s.done} / ${s.total} done · must only ${m.percent}%`}
            percent={s.percent}
            defaultOpen={idx === 0}
            forceOpen={filtering}
            openSignal={focus && focus.topic === g.name ? focus.n : undefined}
          >
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {g.shown.map((item) => (
                <QuestionRow
                  key={item.id}
                  q={item}
                  entry={map[item.id]}
                  onPatch={actions.patchInterview}
                  focusToken={focus && focus.id === item.id ? focus.n : 0}
                />
              ))}
            </ul>
          </Accordion>
        );
      })}
    </div>
  );
}
