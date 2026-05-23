import React from 'react';
import { colors } from './types';

type Variant = 'concept' | 'worked' | 'practice' | 'simulation';

const variantStyles: Record<Variant, { bg: string; color: string }> = {
  concept:    { bg: colors.green.light,  color: colors.green.dark },
  worked:     { bg: colors.blue.light,   color: colors.blue.dark },
  practice:   { bg: colors.purple.light, color: colors.purple.dark },
  simulation: { bg: colors.yellow.light, color: colors.yellow.dark },
};

export function Badge({ variant }: { variant: Variant }) {
  const label: Record<Variant, string> = {
    concept: 'Concept', worked: 'Worked example',
    practice: 'Practice', simulation: 'Simulation',
  };
  const s = variantStyles[variant];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {label[variant]}
    </span>
  );
}