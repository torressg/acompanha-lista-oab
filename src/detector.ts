import type { OabItem } from "./scraper.js";

interface Snapshot {
  urls: string[];
}

export async function detectNew(
  items: OabItem[],
  kv: KVNamespace
): Promise<OabItem[]> {
  const raw = await kv.get("snapshot");
  const snapshot: Snapshot = raw ? JSON.parse(raw) : { urls: [] };
  const knownUrls = new Set(snapshot.urls);

  const newItems = items.filter((item) => !knownUrls.has(item.url));

  const allUrls = [
    ...new Set([...snapshot.urls, ...items.map((i) => i.url)]),
  ];
  await kv.put("snapshot", JSON.stringify({ urls: allUrls }));

  return newItems;
}
