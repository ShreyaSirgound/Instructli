'use client';

export const STORAGE_KEY = 'binaryArithmeticProgress';

export const SECTION_IDS = ['interpreting', 'representation-formats', 'addition-subtraction', 'overflow-saturating'] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export type BinaryArithmeticProgress = Record<SectionId, boolean>;

export function createEmptyProgress(): BinaryArithmeticProgress {
  return {
    'interpreting': false,
    'representation-formats': false,
    'addition-subtraction': false,
    'overflow-saturating': false,
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

    const parsed = JSON.parse(raw) as Partial<Record<string, boolean>>;
    return {
      interpreting: parsed['interpreting'] ?? parsed['number-systems'] ?? false,
      'representation-formats': parsed['representation-formats'] ?? parsed['signed-integers'] ?? false,
      'addition-subtraction': parsed['addition-subtraction'] ?? parsed['addition-overflow'] ?? false,
      'overflow-saturating': parsed['overflow-saturating'] ?? parsed['precision'] ?? false,
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
