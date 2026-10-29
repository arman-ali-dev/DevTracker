import roadmapData from "./roadmap.json";
import dsaData from "./dsa.json";
import interviewData from "./interview.json";
import { findDuplicateIds } from "../utils/contentCheck.js";

export const roadmap = roadmapData;
export const dsa = dsaData;
export const interview = interviewData;

export const roadmapItems = roadmap.flatMap((phase) =>
  phase.sections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      phaseId: phase.id,
      sectionId: section.id,
    })),
  ),
);

if (import.meta.env.DEV) {
  const checks = [
    ["roadmap.json (items)", roadmapItems],
    ["dsa.json", dsa],
    ["interview.json", interview],
  ];
  checks.forEach(([name, list]) => {
    const dupes = findDuplicateIds(list);
    if (dupes.length > 0) {
      console.error(
        `[Dev Tracker] Duplicate ids in ${name}: ${dupes.join(", ")}`,
      );
    }
  });
}
