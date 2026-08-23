'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Users, Eye } from 'lucide-react';

export default function AdminMenu() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (active) setIsAdmin(!!data.isAdmin);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  /*useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);*/

  if (!isAdmin) return null;

  async function handleViewAsStudent() {
    await fetch('/api/admin/view-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'student' }),
    });
    router.push('/');
  }

  return (
    <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
      <Link
        href="/admin/stats"
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
      >
        <BarChart3 size={15} />
        View stats
      </Link>
      <Link
        href="/admin/admins"
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
      >
        <Users size={15} />
        Manage admins
      </Link>
      <button
        onClick={handleViewAsStudent}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
        >
        <Eye size={15} />
        View as student
      </button>
    </div>
  );
}
