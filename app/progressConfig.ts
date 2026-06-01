export type ProgressConfig<T extends string = string> = {
  storageKey: string;
  sectionIds: readonly T[];
  eventName: string;
  legacyKeyMap?: Partial<Record<T, string>>;
};

export function getSavedProgress<T extends string>(config: ProgressConfig<T>): Record<T, boolean> {
  if (typeof window === 'undefined') return createEmptyProgress(config);
  try {
    const raw = window.localStorage.getItem(config.storageKey);
    if (!raw) return createEmptyProgress(config);
    const parsed = JSON.parse(raw) as Partial<Record<string, boolean>>;
    return Object.fromEntries(
      config.sectionIds.map((id) => [id, parsed[id] ?? parsed[config.legacyKeyMap?.[id] ?? ''] ?? false])
    ) as Record<T, boolean>;
  } catch {
    return createEmptyProgress(config);
  }
}

export function computeProgress<T extends string>(
  config: ProgressConfig<T>,
  saved: Record<T, boolean>
): number {
  const completed = config.sectionIds.filter((id) => saved[id]).length;
  if (config.sectionIds.length === 0) return 0;
  return Math.round((completed / config.sectionIds.length) * 100);
}

export function saveProgress<T extends string>(config: ProgressConfig<T>, progress: Record<T, boolean>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(config.storageKey, JSON.stringify(progress));
  try {
    window.dispatchEvent(new CustomEvent(config.eventName, { detail: progress }));
  } catch {}
}

export function createEmptyProgress<T extends string>(config: ProgressConfig<T>): Record<T, boolean> {
  return Object.fromEntries(config.sectionIds.map((id) => [id, false])) as Record<T, boolean>;
}
//function createEmpty<T extends string>(config: ProgressConfig<T>): Record<T, boolean> {
//  return Object.fromEntries(config.sectionIds.map((id) => [id, false])) as Record<T, boolean>;
//}