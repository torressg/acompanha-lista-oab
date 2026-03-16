import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { OabItem } from "./scraper.js";

const DATA_DIR = join(import.meta.dirname, "..", "data");
const SNAPSHOT_PATH = join(DATA_DIR, "snapshot.json");

interface Snapshot {
  urls: string[];
}

async function loadSnapshot(): Promise<Snapshot> {
  try {
    const raw = await readFile(SNAPSHOT_PATH, "utf-8");
    return JSON.parse(raw) as Snapshot;
  } catch {
    return { urls: [] };
  }
}

async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
}

export async function detectNew(items: OabItem[]): Promise<OabItem[]> {
  const snapshot = await loadSnapshot();
  const knownUrls = new Set(snapshot.urls);

  const newItems = items.filter((item) => !knownUrls.has(item.url));

  // Save updated snapshot with all current URLs
  const allUrls = [...new Set([...snapshot.urls, ...items.map((i) => i.url)])];
  await saveSnapshot({ urls: allUrls });

  return newItems;
}
