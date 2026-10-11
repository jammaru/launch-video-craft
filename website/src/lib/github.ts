import { repoUrl } from "./i18n";

export async function getGithubStars(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const response = await fetch("https://api.github.com/repos/jammaru/launch-video-craft", {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const repo = await response.json();
    return typeof repo?.stargazers_count === "number" ? repo.stargazers_count : null;
  } catch {
    return null;
  }
}

export function formatStars(stars: number | null): string | null {
  if (stars == null) return null;
  return new Intl.NumberFormat("en").format(stars);
}

export { repoUrl };
