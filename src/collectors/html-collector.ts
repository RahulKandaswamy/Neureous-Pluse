import { load } from "cheerio";

import type { RawObservation, SourceSeed } from "../domain/contracts.js";
import { sha256 } from "../lib/hash.js";
import { fetchText } from "../lib/http.js";
import { normalizeWhitespace, truncate } from "../lib/text.js";

export class HtmlCollector {
  public async collect(source: SourceSeed): Promise<RawObservation[]> {
    const html = await fetchText(source.url);
    const $ = load(html);

    $("script, style, noscript").remove();

    const title = normalizeWhitespace($("title").first().text() || source.label);
    const bodyText = normalizeWhitespace($("body").text());
    const snippet = truncate(bodyText, 280);

    return source.categories.map((category) => ({
      sourceId: source.id,
      sourceKind: source.kind,
      category,
      title,
      url: source.url,
      capturedAt: new Date(),
      snippet,
      rawText: bodyText,
      contentHash: sha256(`${source.id}:${category}:${title}:${bodyText}`)
    }));
  }
}
