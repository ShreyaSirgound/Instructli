'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';
import { getSavedProgress, computeProgress } from './binaryArithmeticProgress';

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  iconBg: string;
  barColor: string;
};

export default function BinaryArithmeticHomeCard({
  title,
  description,
  href,
  icon,
  iconBg,
  barColor,
}: ModuleCardProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const saved = getSavedProgress();
      setProgress(computeProgress(saved));
    };

    update();
    window.addEventListener('storage', update);
    window.addEventListener('binary-progress-updated', update as EventListener);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('binary-progress-updated', update as EventListener);
    };
  }, []);

  const displayColor = progress === 100 ? '#16a34a' : '#195FA5';

  return (
    <Link href={href} className="group block bg-white border border-gray-200 rounded-2xl p-6 min-w-74 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div
        style={{ backgroundColor: iconBg, color: displayColor }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
      >
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>

      <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: displayColor }}
        />
      </div>

      <p className="text-sm text-gray-400 mt-2">{progress}% complete</p>
    </Link>
  );
}
