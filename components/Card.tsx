import React from 'react';
import { Badge } from './Badge';

type Variant = 'concept' | 'worked' | 'practice' | 'simulation';

interface CardProps {
  variant: Variant;
  title: string;
  children: React.ReactNode;
}

export function Card({ variant, title, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white px-8 py-6 shadow-sm mb-4">
      <Badge variant={variant} />
      <h2 className="mt-3 text-xl font-medium text-gray-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}