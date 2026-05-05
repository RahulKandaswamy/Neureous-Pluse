import { XMLParser } from "fast-xml-parser";

import type { RawObservation, SourceSeed } from "../domain/contracts.js";
import { sha256 } from "../lib/hash.js";
import { fetchText } from "../lib/http.js";
import { normalizeWhitespace, truncate } from "../lib/text.js";

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
};

export class RssCollector {
  private readonly parser = new XMLParser({
    ignoreAttributes: false
  });

  public async collect(source: SourceSeed): Promise<RawObservation[]> {
    const xml = await fetchText(source.url);
    const parsed = this.parser.parse(xml) as {
      rss?: {
        channel?: {
          item?: RssItem | RssItem[];
        };
      };
    };

    const rawItems = parsed.rss?.channel?.item;
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    return items.flatMap((item) => {
      const title = normalizeWhitespace(item.title ?? "Untitled RSS item");
      const url = item.link ?? source.url;
      const description = normalizeWhitespace(item.description ?? "");
      const rawText = normalizeWhitespace(`${title}\n${description}`);

      return source.categories.map((category) => ({
        sourceId: source.id,
        sourceKind: source.kind,
        category,
        title,
        url,
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        capturedAt: new Date(),
        snippet: truncate(description || title, 280),
        rawText,
        contentHash: sha256(`${source.id}:${category}:${title}:${url}:${description}`)
      }));
    });
  }
}
