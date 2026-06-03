import React from 'react';
import { colors } from './types';

type Tone = 'info' | 'warn';

export function InfoNote({ children, tone = 'info' }: { children: React.ReactNode; tone?: Tone }) {
  const bg   = tone === 'info' ? colors.blue.light   : colors.yellow.light;
  const text = tone === 'info' ? colors.blue.dark     : colors.yellow.dark;
  return (
    <div
      className="rounded-2xl px-5 py-3 text-sm leading-relaxed mt-3"
      style={{ backgroundColor: bg, color: text }}
    >
      {children}
    </div>
  );
}