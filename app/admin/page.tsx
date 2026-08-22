'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Lock, Unlock, BarChart3, LogOut, Users } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { recordAnalyticsVisit } from '../../src/utils/analytics'
import { getModuleIcon } from '../../lib/moduleIcons'
import type { ModuleRow } from '../api/modules/route'

function SortableCard({
  mod,
  onToggleHidden,
  onToggleLocked,
}: {
  mod: ModuleRow
  onToggleHidden: () => void
  onToggleLocked: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id })
  const Icon = getModuleIcon(mod.icon_key)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white border rounded-2xl p-6 transition-colors duration-200 ${
        isDragging ? 'shadow-lg border-gray-300' : mod.hidden ? 'opacity-50 border-gray-100' : 'border-gray-200'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </div>
      <div style={{ backgroundColor: mod.icon_bg, color: mod.bar_color }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-4">
        <Icon size={20} />
      </div>
      <h3 className={`text-lg font-semibold ${mod.hidden ? 'text-gray-400' : 'text-gray-900'}`}>{mod.title}</h3>
      <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={onToggleHidden}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
            mod.hidden ? 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100' : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
          }`}
        >
          {mod.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
          {mod.hidden ? 'Hidden' : 'Visible'}
        </button>
        <button
          onClick={onToggleLocked}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
            mod.locked ? 'border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100' : 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'
          }`}
        >
          {mod.locked ? <Lock size={13} /> : <Unlock size={13} />}
          {mod.locked ? 'Locked' : 'Unlocked'}
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [modules, setModules] = useState<ModuleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    recordAnalyticsVisit('admin')
  }, [])

  useEffect(() => {
    fetch('/api/modules')
      .then((res) => res.json())
      .then((data) => setModules(data.modules ?? []))
      .catch(() => setError('Could not load modules.'))
      .finally(() => setLoading(false))
  }, [])

  const sensors = useSensors(useSensor(PointerSensor))

  const persist = useCallback(async (next: ModuleRow[]) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: next.map((m, index) => ({
            id: m.id,
            order_index: index,
            locked: m.locked,
            hidden: m.hidden,
          })),
        }),
      })
      if (!res.ok) throw new Error();
    } catch {
      setError('Failed to save changes. Your last change may not have been saved.')
    } finally {
      setSaving(false)
    }
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setModules(prev => {
      const oldIndex = prev.findIndex(m => m.id === active.id)
      const newIndex = prev.findIndex(m => m.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      persist(reordered)
      return reordered
    })
  }

  const toggleHidden = (id: string) =>
    setModules(prev => {
      const next = prev.map(m => m.id === id ? { ...m, hidden: !m.hidden } : m)
      persist(next)
      return next
    })

  const toggleLocked = (id: string) =>
    setModules(prev => {
      const next = prev.map(m => m.id === id ? { ...m, locked: !m.locked } : m)
      persist(next)
      return next
    })

  const bulkUpdate = (fn: (m: ModuleRow) => ModuleRow) =>
    setModules(prev => {
      const next = prev.map(fn)
      persist(next)
      return next
    })

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  async function handleViewAsStudent() {
    await fetch('/api/admin/view-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'student' }),
    })
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Manage Modules</h1>
          {saving ? <p className="text-xs text-gray-400 mt-2">Saving…</p> : null}
          {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-6 mb-8">
          <button onClick={() => bulkUpdate(m => ({ ...m, hidden: false }))} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Show all</button>
          <button onClick={() => bulkUpdate(m => ({ ...m, hidden: true }))} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Hide all</button>
          <button onClick={() => bulkUpdate(m => ({ ...m, locked: false }))} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Unlock all</button>
          <button onClick={() => bulkUpdate(m => ({ ...m, locked: true }))} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Lock all</button>
          <Link href="/admin/stats" className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">
            <BarChart3 size={15} />
            View stats
          </Link>
          <Link href="/admin/admins" className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">
            <Users size={15} />
            Manage admins
          </Link>
          <button onClick={handleViewAsStudent} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <Eye size={15} />
            View as student
          </button>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            <LogOut size={15} />
            Log out
          </button>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-400">Loading modules…</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map(m => m.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map(mod => (
                  <SortableCard
                    key={mod.id}
                    mod={mod}
                    onToggleHidden={() => toggleHidden(mod.id)}
                    onToggleLocked={() => toggleLocked(mod.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </main>
  )
}
