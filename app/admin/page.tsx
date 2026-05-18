"use client"

import { useState } from "react"
import { Binary, Cpu, MonitorCog, Rows2, AlertTriangle, Database, Eye, EyeOff, Lock, Unlock } from "lucide-react"

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

function ModuleRow({
  mod,
  onToggleHidden,
  onToggleLocked,
}: {
  mod: Module
  onToggleHidden: () => void
  onToggleLocked: () => void
}) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${mod.hidden ? "bg-gray-50 border-gray-100" : "bg-white border-gray-200"} transition-all duration-200`}>
      {/* Left: icon + info */}
      <div className="flex items-center gap-4">
        <div
          style={{ backgroundColor: mod.iconBg, color: mod.iconColor }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mod.hidden ? "opacity-40" : ""}`}
        >
          {mod.icon}
        </div>
        <div>
          <p className={`font-semibold text-sm ${mod.hidden ? "text-gray-400" : "text-gray-900"}`}>
            {mod.title}
          </p>
          <p className="text-xs text-gray-400">{mod.description}</p>
        </div>
      </div>

      {/* Hide/Lock toggles */}
      <div className="flex items-center gap-6">
        {/* Visible toggle */}
        <div className="flex items-center gap-2">
          {mod.hidden ? (
            <EyeOff size={15} className="text-gray-300" />
          ) : (
            <Eye size={15} className="text-gray-400" />
          )}
          <Toggle
            enabled={!mod.hidden}
            onChange={onToggleHidden}
            colorOn="#1E9C07"
          />
          <span className="text-xs text-gray-400 w-14">
            {mod.hidden ? "Hidden" : "Visible"}
          </span>
        </div>

        {/* Locked toggle */}
        <div className="flex items-center gap-2">
          {mod.locked ? (
            <Lock size={15} className="text-gray-300" />
          ) : (
            <Unlock size={15} className="text-gray-400" />
          )}
          <Toggle
            enabled={!mod.locked}
            onChange={onToggleLocked}
            colorOn="#2684FC"
          />
          <span className="text-xs text-gray-400 w-16">
            {mod.locked ? "Locked" : "Unlocked"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
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
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mt-0.5">Manage Modules</h1>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-6 mb-8">
          <button
            onClick={() => setModules((prev) => prev.map((m) => ({ ...m, hidden: false })))}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Show all
          </button>
          <button
            onClick={() => setModules((prev) => prev.map((m) => ({ ...m, hidden: true })))}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Hide all
          </button>
          <button
            onClick={() => setModules((prev) => prev.map((m) => ({ ...m, locked: false })))}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Unlock all
          </button>
          <button
            onClick={() => setModules((prev) => prev.map((m) => ({ ...m, locked: true })))}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Lock all
          </button>
        </div>

        {/* Module list */}
        <div className="flex flex-col gap-3">
          {modules.map((mod) => (
            <ModuleRow
              key={mod.id}
              mod={mod}
              onToggleHidden={() => toggleHidden(mod.id)}
              onToggleLocked={() => toggleLocked(mod.id)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}