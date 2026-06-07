"use client"

import { useState, type ReactNode } from 'react'
import { Binary, Cpu, MonitorCog, Rows2, AlertTriangle, Database, Eye, EyeOff, Lock, Unlock, MonitorCogIcon } from "lucide-react"
import ModuleCard from '@/components/ModuleCard'
import { binaryArithmeticConfig, cachingConfig, hazardsConfig, machineInstructionsConfig, pipelineConfig, singleCycleConfig } from '@/app/moduleConfigs';

const initialModules = [
  {
    id: 1,
    title: "Binary arithmetic",
    description: "Addition, overflow, two's complement",
    icon: <Binary size={20} />,
    iconBg: "#E6F1FB",
    iconColor: "#195FA5",
    hidden: false,
    locked: false,
  },
  {
    id: 2,
    title: "Single cycle",
    description: "Datapath, control signals",
    icon: <Cpu size={20} />,
    iconBg: "#E9F2DD",
    iconColor: "#3F681B",
    hidden: false,
    locked: false,
  },
  {
    id: 3,
    title: "5-stage pipeline",
    description: "IF, ID, EX, MEM, WB",
    icon: <Rows2 size={20} />,
    iconBg: "#EDECFD",
    iconColor: "#4F4898",
    hidden: false,
    locked: false,
  },
  {
    id: 4,
    title: "Machine Instructions",
    description: "Instruction types, opcodes",
    icon: <MonitorCog size={20} />,
    iconBg: "#fef9e0",
    iconColor: "#f9ab00",
    hidden: false,
    locked: true,
  },
  {
    id: 5,
    title: "Hazards and Detection",
    description: "RAW, WAR, WAW, structural",
    icon: <AlertTriangle size={20} />,
    iconBg: "#FAEEDC",
    iconColor: "#b6761d",
    hidden: false,
    locked: true,
  },
  {
    id: 6,
    title: "Caching",
    description: "Direct-mapped, set associative",
    icon: <Database size={20} />,
    iconBg: "#FBECE6",
    iconColor: "#b15636",
    hidden: true,
    locked: true,
  },
]

type Module = (typeof initialModules)[0]

function Toggle({
  enabled,
  onChange,
  colorOn,
}: {
  enabled: boolean
  onChange: () => void
  colorOn: string
}) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: enabled ? colorOn : "#e5e7eb" }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  )
}

export default function Dashboard() {
    const [modules, setModules] = useState(initialModules)

    const toggleHidden = (id: number) => {
    setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, hidden: !m.hidden } : m))
    )
    }

    const toggleLocked = (id: number) => {
    setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, locked: !m.locked } : m))
    )
    }
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Manage Modules</h1>
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-8 mt-6 mb-8">
          <button
            onClick={() => setModules((prev) => prev.map((m) => ({ ...m, hidden: false })))}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Show all
          </button>
          <button
            onClick={() => setModules((prev) => prev.map((m) => ({ ...m, hidden: true })))}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Hide all
          </button>
          <button
            onClick={() => setModules((prev) => prev.map((m) => ({ ...m, locked: false })))}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Unlock all
          </button>
          <button
            onClick={() => setModules((prev) => prev.map((m) => ({ ...m, locked: true })))}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Lock all
          </button>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
            const configs = [
            { config: binaryArithmeticConfig, scrollKey: undefined, href: "/modules/binary-arithmetic" },
            { config: singleCycleConfig, scrollKey: "singleCycleScrollProgress", href: "/modules/single-cycle" },
            { config: pipelineConfig, scrollKey: undefined, href: "/modules/pipeline" },
            { config: machineInstructionsConfig, scrollKey: undefined, href: "/modules/machine-instructions" },
            { config: hazardsConfig, scrollKey: undefined, href: "/modules/hazards" },
            { config: cachingConfig, scrollKey: undefined, href: "/modules/caching" },
            ];
            const { config, scrollKey, href } = configs[mod.id - 1];

            return (
            <div key={mod.id} className={`relative group block bg-white border rounded-2xl p-6 transition-all duration-200 ${mod.hidden ? 'opacity-50 border-gray-100' : 'border-gray-200 hover:shadow-md hover:border-gray-300'}`}>
                {/* Icon */}
                <div
                style={{ backgroundColor: mod.iconBg, color: mod.iconColor }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                >
                {mod.icon}
                </div>

                {/* Title + description */}
                <h3 className="text-lg font-semibold text-gray-900">{mod.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{mod.description}</p>

                {/* Hide + Lock toggles */}
                <div className="flex items-center gap-4 mt-4">
                <button
                onClick={() => toggleHidden(mod.id)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
                    mod.hidden
                    ? 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100'
                    : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                }`}
                >
                {mod.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                {mod.hidden ? 'Hidden' : 'Visible'}
                </button>

                <button
                onClick={() => toggleLocked(mod.id)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
                    mod.locked
                    ? 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100'
                    : 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'
                }`}
                >
                {mod.locked ? <Lock size={13} /> : <Unlock size={13} />}
                {mod.locked ? 'Locked' : 'Unlocked'}
                </button>
                </div>
            </div>
            );
        })}
        </div>
      </div>
    </main>
  );
}