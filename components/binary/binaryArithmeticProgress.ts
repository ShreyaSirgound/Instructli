'use client';

export const STORAGE_KEY = 'binaryArithmeticProgress';

export const SECTION_IDS = ['number-systems', 'signed-integers', 'addition-overflow', 'precision'] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export type BinaryArithmeticProgress = Record<SectionId, boolean>;

export function createEmptyProgress(): BinaryArithmeticProgress {
  return {
    'number-systems': false,
    'signed-integers': false,
    'addition-overflow': false,
    precision: false,
  };
}

export function getSavedProgress(): BinaryArithmeticProgress {
  if (typeof window === 'undefined') {
    return createEmptyProgress();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createEmptyProgress();
    }

    const parsed = JSON.parse(raw) as Partial<BinaryArithmeticProgress>;
    return {
      'number-systems': parsed['number-systems'] ?? false,
      'signed-integers': parsed['signed-integers'] ?? false,
      'addition-overflow': parsed['addition-overflow'] ?? false,
      precision: parsed.precision ?? false,
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress: BinaryArithmeticProgress) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  try {
    // dispatch a custom event so same-tab components can react immediately
    const ev = new CustomEvent('binary-progress-updated', { detail: progress });
    window.dispatchEvent(ev);
  } catch {}
}

export function computeProgress(progress: BinaryArithmeticProgress) {
  const completed = SECTION_IDS.filter((id) => progress[id]).length;
  return completed * 25;
}
