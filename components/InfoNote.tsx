import React from 'react';
import { colors } from './types';
import {  Info, TriangleAlert } from 'lucide-react';

type Tone = 'info' | 'warn';

export function InfoNote({ children, tone = 'info' }: { children: React.ReactNode; tone?: Tone }) {
  const bg   = tone === 'info' ? colors.blue.light   : colors.yellow.light;
  const text = tone === 'info' ? colors.blue.dark     : colors.yellow.dark;
  const Icon = tone === 'info' ? Info : TriangleAlert;

  return (
    <div
      className="rounded-2xl px-5 py-3 text-sm leading-relaxed mt-3"
      style={{ backgroundColor: bg, color: text, display: 'flex', alignItems: 'flex-start', gap: '8px' }}
    >
      <Icon size={15} style={{ flexShrink: 0, marginTop: '3px' }} />
      <div>{children}</div>
    </div>
  );
}