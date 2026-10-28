// Validation for imported progress files.
const CONFIDENCE = ["none", "weak", "ok", "strong"];

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Returns { valid: boolean, errors: string[] }
export function validateProgress(data) {
  const errors = [];

  if (!isObject(data)) {
    return { valid: false, errors: ["The file must contain a JSON object."] };
  }
  if (data.version !== 1) {
    errors.push(
      `Unsupported version: ${JSON.stringify(data.version)} (expected 1).`,
    );
  }

  // Each section must be an object keyed by item id.
  for (const key of ["roadmap", "dsa", "interview"]) {
    if (!isObject(data[key])) {
      errors.push(`"${key}" must be an object.`);
      continue;
    }
    for (const [id, entry] of Object.entries(data[key])) {
      if (!isObject(entry)) {
        errors.push(`${key}.${id} must be an object.`);
        continue;
      }
      if (typeof entry.done !== "boolean")
        errors.push(`${key}.${id}.done must be true or false.`);
      if (typeof entry.updatedAt !== "number")
        errors.push(`${key}.${id}.updatedAt must be a number.`);
      if (key === "dsa") {
        if (entry.revisit !== undefined && typeof entry.revisit !== "boolean")
          errors.push(`dsa.${id}.revisit must be true or false.`);
        if (entry.notes !== undefined && typeof entry.notes !== "string")
          errors.push(`dsa.${id}.notes must be text.`);
      }
      if (key === "interview") {
        if (
          entry.confidence !== undefined &&
          !CONFIDENCE.includes(entry.confidence)
        )
          errors.push(
            `interview.${id}.confidence must be one of ${CONFIDENCE.join(", ")}.`,
          );
        if (entry.answer !== undefined && typeof entry.answer !== "string")
          errors.push(`interview.${id}.answer must be text.`);
      }
    }
  }

  if (data.settings !== undefined) {
    if (!isObject(data.settings)) errors.push('"settings" must be an object.');
    else if (
      data.settings.theme !== undefined &&
      !["light", "dark"].includes(data.settings.theme)
    )
      errors.push('settings.theme must be "light" or "dark".');
  }

  // Projects are optional (older exports do not have them).
  if (data.projects !== undefined) {
    if (!Array.isArray(data.projects)) {
      errors.push('"projects" must be a list.');
    } else {
      data.projects.forEach((p, i) => {
        if (
          !isObject(p) ||
          typeof p.id !== "string" ||
          typeof p.name !== "string"
        ) {
          errors.push(`projects[${i}] needs an id and a name.`);
          return;
        }
        if (!Array.isArray(p.tasks)) {
          errors.push(`projects[${i}].tasks must be a list.`);
          return;
        }
        p.tasks.forEach((t, j) => {
          const ok =
            isObject(t) &&
            typeof t.id === "string" &&
            typeof t.title === "string" &&
            typeof t.done === "boolean" &&
            ["frontend", "backend"].includes(t.category);
          if (!ok)
            errors.push(`projects[${i}].tasks[${j}] is not a valid task.`);
        });
      });
    }
  }

  // Keep the message list short.
  const shown = errors.slice(0, 8);
  if (errors.length > shown.length)
    shown.push(`...and ${errors.length - shown.length} more problems.`);
  return { valid: errors.length === 0, errors: shown };
}

// Merge imported progress into current progress. The newest updatedAt wins per item.
export function mergeProgress(current, incoming) {
  const result = { ...current, settings: { ...current.settings } };
  for (const key of ["roadmap", "dsa", "interview"]) {
    const merged = { ...current[key] };
    for (const [id, entry] of Object.entries(incoming[key] || {})) {
      const mine = merged[id];
      if (!mine || (entry.updatedAt || 0) >= (mine.updatedAt || 0))
        merged[id] = entry;
    }
    result[key] = merged;
  }

  // Projects: match by project id, then tasks by task id (newest change wins).
  const projects = new Map((current.projects || []).map((p) => [p.id, p]));
  for (const inc of incoming.projects || []) {
    const mine = projects.get(inc.id);
    if (!mine) {
      projects.set(inc.id, inc);
      continue;
    }
    const tasks = new Map(mine.tasks.map((t) => [t.id, t]));
    for (const t of inc.tasks) {
      const m = tasks.get(t.id);
      if (!m || (t.updatedAt || 0) >= (m.updatedAt || 0)) tasks.set(t.id, t);
    }
    const newer = (inc.updatedAt || 0) > (mine.updatedAt || 0);
    projects.set(inc.id, {
      ...mine,
      name: newer ? inc.name : mine.name,
      tasks: [...tasks.values()],
    });
  }
  result.projects = [...projects.values()];
  return result;
}
