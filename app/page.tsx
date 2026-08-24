'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModuleCard from '@/components/ModuleCard'
import { recordAnalyticsVisit } from '../src/utils/analytics';
import { getModuleIcon } from '../lib/moduleIcons';
import type { ModuleRow } from './api/modules/route';
import { ShieldCheck } from 'lucide-react';

const MODULE_META: Record<string, { href: string; sections: string[]; simulations: number; exercises: number; duration: string }> = {
  'binary-arithmetic': {
    href: '/modules/binary-arithmetic',
    sections: ['Interpreting Numbers', 'Representation Formats', 'Arithmetic', 'Overflow'],
    simulations: 2,
    exercises: 8,
    duration: '~20 minutes',
  },
  'single-cycle': {
    href: '/modules/single-cycle',
    sections: ['Hardware Blocks', 'Muxes & Control Signals', 'Instruction Datapaths'],
    simulations: 1,
    exercises: 7,
    duration: '~18 minutes',
  },
  pipeline: {
    href: '/modules/pipeline',
    sections: ['Pipeline Overview', 'Interactive Simulation'],
    simulations: 1,
    exercises: 5,
    duration: '~15 minutes',
  },
  'machine-instructions': {
    href: '/modules/machine-instructions',
    sections: ['R-Format', 'I-Format', 'S-Format', 'Interactive Simulation'],
    simulations: 1,
    exercises: 9,
    duration: '~22 minutes',
  },
  hazards: {
    href: '/modules/hazards',
    sections: ['Hazards Overview', 'Interactive Simulation'],
    simulations: 1,
    exercises: 6,
    duration: '~18 minutes',
  },
  caching: {
    href: '/modules/caching',
    sections: ['Caching Fundamentals', 'Associative Caching', 'Interactive Simulation'],
    simulations: 1,
    exercises: 8,
    duration: '~20 minutes',
  },
};

export default function Dashboard() {
  const router = useRouter();
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [viewingAsStudent, setViewingAsStudent] = useState(false);
  const [switchingView, setSwitchingView] = useState(false);

  useEffect(() => {
    recordAnalyticsVisit('app');
  }, []);

  useEffect(() => {
    let active = true;

    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.isAdmin && data.viewMode === 'admin') {
          router.replace('/admin');
        } else if (data.isAdmin && data.viewMode === 'student') {
          setViewingAsStudent(true);
        }
      })
      .catch(() => {
        // Not an admin, or the check failed — just show the student view.
      });

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) return;
        const data = await res.json();
        if (data.name) setUserName(data.name);
      } catch {
        // ignore
      }
    };

    loadUserName();
  }, []);

  useEffect(() => {
    fetch('/api/modules')
      .then((res) => res.json())
      .then((data) => setModules(data.modules ?? []))
      .finally(() => setLoading(false));
  }, []);

  const visibleModules = modules.filter((m) => !m.hidden);

  async function handleReturnToAdmin() {
    setSwitchingView(true);
    try {
      await fetch('/api/admin/view-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'admin' }),
      });
      router.push('/admin');
    } finally {
      setSwitchingView(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {viewingAsStudent ? (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} />
              You&apos;re previewing the student view.
            </span>
            <button
              onClick={handleReturnToAdmin}
              disabled={switchingView}
              className="text-sm font-medium underline underline-offset-2 hover:text-indigo-900 disabled:opacity-50"
            >
              {switchingView ? 'Switching…' : 'Return to admin view'}
            </button>
          </div>
        ) : null}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-medium text-gray-900">
              {userName ? `Welcome to Instructli, ${userName}` : 'Welcome to Instructli'}
            </h1>
            <p className="text-gray-500 mt-4 max-w-4x1 mx-auto">This platform provides interactive practice modules for CSC258. Each module reinforces material already introduced in lecture and is intended to support review, not first exposure to new content. Click on a module to begin.</p>
          </div>
        </div>

        {/* Module grid */}
        {loading ? (
          <p className="text-center text-sm text-gray-400">Loading modules…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {visibleModules.map((mod) => {
              const meta = MODULE_META[mod.id];
              if (!meta) return null;
              const Icon = getModuleIcon(mod.icon_key);
              return (
                <ModuleCard
                  key={mod.id}
                  title={mod.title}
                  description={meta.sections.join(', ')}
                  href={meta.href}
                  icon={<Icon size={22} />}
                  iconBg={mod.icon_bg}
                  barColor={mod.bar_color}
                  sections={meta.sections}
                  simulations={meta.simulations}
                  exercises={meta.exercises}
                  duration={meta.duration}
                  moduleKey={mod.id}
                  locked={mod.locked}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
