import type { Logger } from "pino";

import type { RawObservation, SourceSeed } from "../domain/contracts.js";

import { HtmlCollector } from "./html-collector.js";
import { RedditCollector } from "./reddit-collector.js";
import { RssCollector } from "./rss-collector.js";

export class CollectorService {
  private readonly rssCollector = new RssCollector();
  private readonly htmlCollector = new HtmlCollector();
  private readonly redditCollector = new RedditCollector();

  public constructor(private readonly logger: Logger) {}

  public async collectAll(sources: SourceSeed[]): Promise<RawObservation[]> {
    const observations: RawObservation[] = [];

    for (const source of sources.filter((item) => item.enabled)) {
      try {
        const collected = await this.collectOne(source);
        observations.push(...collected);
      } catch (error) {
        this.logger.warn(
          {
            err: error,
            sourceId: source.id
          },
          "Collector failed for source."
        );
      }
    }

    return observations;
  }

  private async collectOne(source: SourceSeed): Promise<RawObservation[]> {
    switch (source.kind) {
      case "rss":
        return this.rssCollector.collect(source);
      case "html":
        return this.htmlCollector.collect(source);
      case "reddit":
        return this.redditCollector.collect(source);
      default:
        return [];
    }
  }
}
