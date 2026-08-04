'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { recordAnalyticsClick } from '../src/utils/analytics';

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  iconBg: string;
  barColor: string;
  sections: string[];
  simulations: number;
  exercises: number;
  duration: string;
  moduleKey?: string;
  locked?: boolean;
};

export default function ModuleCard({
  title, description, href, icon, iconBg, barColor, sections, simulations, exercises, duration, moduleKey, locked
}: ModuleCardProps) {

  if (locked) {
    return (
      <div className="relative block h-full bg-white border border-gray-100 rounded-2xl p-6 min-w-74 opacity-60 cursor-not-allowed">
        <div className="absolute top-4 right-4 text-gray-400">
          <Lock size={16} />
        </div>
        <div
          style={{ backgroundColor: iconBg, color: barColor }}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
        <p className="text-sm text-gray-400 mt-4">Locked by your instructor</p>
      </div>
    );
  }

  const segmentColors = ['#c7d2fe', '#d9f99d', '#fca5a5', '#fcd34d', '#a5f3fc', '#f5d0fe'];

  return (
    <Link href={href} onClick={() => recordAnalyticsClick(moduleKey)} className="group block h-full flex flex-col bg-white border border-gray-200 rounded-2xl p-6 min-w-74 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div
        style={{ backgroundColor: iconBg, color: barColor }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
      >
        {icon}
      </div>

      <div className="min-h-[6rem]">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-0">{description}</p>
      </div>

      <div className="mt-0">
        <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-600 overflow-x-auto">
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <span className="text-slate-500">{simulations}</span>
            <span className="text-slate-500">simulations</span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <span className="text-slate-500">{exercises}</span>
            <span className="text-slate-500">exercises</span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <span className="text-slate-500">{duration}</span>
          </div>
        </div>

        <div className="h-3 rounded-full overflow-hidden border border-gray-200 flex">
          {sections.map((section, index) => (
            <div
              key={section}
              className="h-full"
              style={{
                width: `${100 / sections.length}%`,
                backgroundColor: segmentColors[index % segmentColors.length],
              }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
