export async function fetchText(
  url: string,
  init?: RequestInit,
  timeoutMs = 15_000
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "user-agent": "marketing-insights-agent/0.1.0",
        ...(init?.headers ?? {})
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}
