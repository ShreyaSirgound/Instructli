'use client';

import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';

export default function StudentViewButton() {
  const router = useRouter();

  async function handleViewAsStudent() {
    await fetch('/api/admin/view-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'student' }),
    });
    router.push('/');
  }

  return (
    <button
      onClick={handleViewAsStudent}
      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
    >
      <Eye size={15} />
      View as student
    </button>
  );
}