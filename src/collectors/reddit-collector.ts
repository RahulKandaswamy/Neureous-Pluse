import type { RawObservation, SourceSeed } from "../domain/contracts.js";
import { sha256 } from "../lib/hash.js";
import { fetchText } from "../lib/http.js";
import { normalizeWhitespace, truncate } from "../lib/text.js";

type RedditListing = {
  data?: {
    children?: Array<{
      data?: {
        title?: string;
        permalink?: string;
        selftext?: string;
        url?: string;
        created_utc?: number;
      };
    }>;
  };
};

export class RedditCollector {
  public async collect(source: SourceSeed): Promise<RawObservation[]> {
    const json = await fetchText(source.url, {
      headers: {
        accept: "application/json"
      }
    });

    const parsed = JSON.parse(json) as RedditListing;
    const posts = parsed.data?.children ?? [];

    return posts.flatMap((post) => {
      const title = normalizeWhitespace(post.data?.title ?? "Untitled Reddit post");
      const permalink = post.data?.permalink
        ? `https://www.reddit.com${post.data.permalink}`
        : post.data?.url ?? source.url;
      const selfText = normalizeWhitespace(post.data?.selftext ?? "");
      const rawText = normalizeWhitespace(`${title}\n${selfText}`);

      return source.categories.map((category) => ({
        sourceId: source.id,
        sourceKind: source.kind,
        category,
        title,
        url: permalink,
        publishedAt: post.data?.created_utc
          ? new Date(post.data.created_utc * 1000)
          : undefined,
        capturedAt: new Date(),
        snippet: truncate(selfText || title, 280),
        rawText,
        contentHash: sha256(`${source.id}:${category}:${title}:${permalink}:${selfText}`)
      }));
    });
  }
}
