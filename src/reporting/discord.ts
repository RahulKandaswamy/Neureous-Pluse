import type { ReportPayload } from "../domain/contracts.js";

type DiscordField = {
  name: string;
  value: string;
  inline?: boolean;
};

type DiscordWebhookBody = {
  content?: string;
  embeds: Array<{
    title: string;
    description: string;
    fields?: DiscordField[];
    timestamp: string;
  }>;
};

export class DiscordPublisher {
  public constructor(private readonly webhookUrl?: string) {}

  public buildPayload(report: ReportPayload): DiscordWebhookBody {
    return {
      embeds: [
        {
          title: report.title,
          description: report.summary,
          fields: report.insights.map((insight) => ({
            name: `[${formatCategory(insight.category)}] ${insight.headline}`,
            value: `${insight.summary}\n\nSo what: ${insight.soWhat}\nConfidence: ${insight.confidence}/100\nSources: ${insight.sourceUrls.join(", ") || "n/a"}`
          })),
          timestamp: report.generatedAt
        }
      ]
    };
  }

  public async publish(report: ReportPayload, dryRun: boolean): Promise<void> {
    if (dryRun || !this.webhookUrl) {
      return;
    }

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(this.buildPayload(report))
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed with status ${response.status}.`);
    }
  }
}

function formatCategory(value: string): string {
  return value.replaceAll("_", " ");
}
