import type { ScanReport } from "./types";

const KEY = "greenlight.history.v1";
const LIMIT = 12;

export interface HistoryItem {
  id: string;
  createdAt: string;
  title: string;
  verdict: ScanReport["verdict"];
  score: number;
  sourceLabel: string;
  report: ScanReport;
}

function read(): HistoryItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: HistoryItem[]) {
  const slim = items.slice(0, LIMIT).map((item) => ({
    ...item,
    report: {
      ...item.report,
      thumbDataUrl: undefined,
    },
  }));
  try {
    localStorage.setItem(KEY, JSON.stringify(slim));
  } catch {
    try {
      localStorage.setItem(KEY, JSON.stringify(slim.slice(0, 4)));
    } catch {
      /* quota — drop history rather than crash the scan */
    }
  }
}

export function loadHistory(): HistoryItem[] {
  return read();
}

export function saveReport(report: ScanReport): HistoryItem[] {
  const item: HistoryItem = {
    id: report.id,
    createdAt: report.createdAt,
    title: report.form.title.trim() || report.sourceLabel,
    verdict: report.verdict,
    score: report.score,
    sourceLabel: report.sourceLabel,
    report: {
      ...report,
      thumbDataUrl: undefined,
    },
  };
  const next = [item, ...read().filter((h) => h.id !== item.id)].slice(0, LIMIT);
  write(next);
  return next;
}

export function removeReport(id: string): HistoryItem[] {
  const next = read().filter((h) => h.id !== id);
  write(next);
  return next;
}
