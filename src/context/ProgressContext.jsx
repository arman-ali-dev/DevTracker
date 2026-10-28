// Holds all progress in one place and saves it to localStorage.
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  clearState,
  emptyState,
  loadState,
  migrate,
  saveState,
} from "../utils/storage.js";
import { mergeProgress } from "../utils/validate.js";

export const ProgressContext = createContext(null);

// Default entries for each kind of item.
const defaults = {
  roadmap: { done: false },
  dsa: { done: false, revisit: false, notes: "" },
  interview: { done: false, confidence: "none", answer: "" },
};

// Update one item. Every change refreshes updatedAt.
function patchItem(state, kind, id, patch, now) {
  const old = state[kind][id] || defaults[kind];
  return {
    ...state,
    [kind]: {
      ...state[kind],
      [id]: { ...defaults[kind], ...old, ...patch, updatedAt: now },
    },
  };
}

// Make a unique id for a new project or task.
function newId() {
  if (window.crypto && window.crypto.randomUUID)
    return window.crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Change one project and leave the others as they are.
function mapProject(state, projectId, fn) {
  return {
    ...state,
    projects: state.projects.map((p) => (p.id === projectId ? fn(p) : p)),
  };
}

function reducer(state, action) {
  const now = Date.now();
  switch (action.type) {
    case "patch":
      return patchItem(state, action.kind, action.id, action.patch, now);
    case "setMany": {
      // Used by "tick all / untick all". Skips items that already have this value.
      let next = state;
      for (const id of action.ids) {
        const cur = state.roadmap[id];
        if (!!(cur && cur.done) === action.done) continue;
        next = patchItem(next, "roadmap", id, { done: action.done }, now);
      }
      return next;
    }

    case "addProject":
      return {
        ...state,
        projects: [
          ...state.projects,
          {
            id: action.id,
            name: action.name,
            createdAt: now,
            updatedAt: now,
            tasks: [],
          },
        ],
      };
    case "deleteProject":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
      };
    case "addTask":
      return mapProject(state, action.projectId, (p) => ({
        ...p,
        updatedAt: now,
        tasks: [
          ...p.tasks,
          {
            id: action.id,
            category: action.category,
            title: action.title,
            done: false,
            updatedAt: now,
          },
        ],
      }));
    case "toggleTask":
      return mapProject(state, action.projectId, (p) => ({
        ...p,
        updatedAt: now,
        tasks: p.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, done: action.done, updatedAt: now }
            : t,
        ),
      }));
    case "deleteTask":
      return mapProject(state, action.projectId, (p) => ({
        ...p,
        updatedAt: now,
        tasks: p.tasks.filter((t) => t.id !== action.taskId),
      }));
    case "theme":
      return { ...state, settings: { ...state.settings, theme: action.theme } };
    case "import":
      return action.mode === "replace"
        ? migrate(action.data)
        : mergeProgress(state, migrate(action.data));
    case "reset":
      return { ...emptyState(), settings: state.settings };
    default:
      return state;
  }
}

export function ProgressProvider({ children }) {
  // Load once. If storage fails we keep working in memory.
  const initial = useRef(null);
  if (initial.current === null) initial.current = loadState();

  const [state, dispatch] = useReducer(reducer, initial.current.state);
  const [storageOk, setStorageOk] = useState(initial.current.ok);
  const firstRun = useRef(true);

  // Save after changes (short delay so quick clicks are saved together).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }
    const t = setTimeout(() => setStorageOk(saveState(state)), 250);
    const flush = () => saveState(state);
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pagehide", flush);
    };
  }, [state]);

  // Apply theme to the page.
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      state.settings.theme === "dark",
    );
  }, [state.settings.theme]);

  // Stable action functions so memoised rows do not re-render for no reason.
  const actions = useMemo(
    () => ({
      toggleRoadmap: (id, done) =>
        dispatch({ type: "patch", kind: "roadmap", id, patch: { done } }),
      setRoadmapMany: (ids, done) => dispatch({ type: "setMany", ids, done }),
      patchDsa: (id, patch) =>
        dispatch({ type: "patch", kind: "dsa", id, patch }),
      patchInterview: (id, patch) =>
        dispatch({ type: "patch", kind: "interview", id, patch }),
      addProject: (name) => dispatch({ type: "addProject", id: newId(), name }),
      deleteProject: (id) => dispatch({ type: "deleteProject", id }),
      addTask: (projectId, category, title) =>
        dispatch({ type: "addTask", projectId, category, title, id: newId() }),
      toggleTask: (projectId, taskId, done) =>
        dispatch({ type: "toggleTask", projectId, taskId, done }),
      deleteTask: (projectId, taskId) =>
        dispatch({ type: "deleteTask", projectId, taskId }),
      setTheme: (theme) => dispatch({ type: "theme", theme }),
      importData: (data, mode) => dispatch({ type: "import", data, mode }),
      resetAll: () => {
        dispatch({ type: "reset" });
        clearState();
      },
    }),
    [],
  );

  const value = useMemo(
    () => ({ state, storageOk, actions }),
    [state, storageOk, actions],
  );
  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}
