'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';
import { ProgressConfig, getSavedProgress, computeProgress } from '../app/progressConfig';

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  iconBg: string;
  barColor: string;
  progressConfig: ProgressConfig<string>;
};

export default function ModuleCard({
  title, description, href, icon, iconBg, barColor, progressConfig,
}: ModuleCardProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const saved = getSavedProgress(progressConfig);
      setProgress(computeProgress(progressConfig, saved));
    };

    update();
    window.addEventListener('storage', update);
    window.addEventListener(progressConfig.eventName, update as EventListener);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener(progressConfig.eventName, update as EventListener);
    };
  }, [progressConfig]);

  return (
    <Link href={href} className="group block bg-white border border-gray-200 rounded-2xl p-6 min-w-74 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div
        style={{ backgroundColor: iconBg, color: barColor }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
      >
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>

      <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: barColor }}
        />
      </div>

      <p className="text-sm text-gray-400 mt-2">{progress}% complete</p>
    </Link>
  );
}
