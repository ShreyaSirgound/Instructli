import Link from 'next/link'

const topics = [
  { href: '/modules/binary-arithmetic/intro', title: 'Intro', description: 'Concept overview and definitions' },
  { href: '/modules/binary-arithmetic/example', title: 'Worked example', description: 'Step-by-step binary addition' },
  { href: '/modules/binary-arithmetic/simulation', title: 'Simulation', description: 'Interactive adder practice' },
  { href: '/modules/binary-arithmetic/knowledge-check', title: 'Knowledge check', description: 'Short questions to reinforce learning' },
  { href: '/modules/binary-arithmetic/challenge', title: 'Challenge', description: 'Apply your skills to a harder problem' },
]

export default function BinaryArithmeticModule() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Module 1</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">Binary Arithmetic</h1>
          <p className="mt-4 max-w-2xl text-gray-500">Explore binary addition, two's complement, overflow detection.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((topic) => (
            <Link key={topic.href} href={topic.href} className="group block bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              <h2 className="text-lg font-semibold text-gray-900">{topic.title}</h2>
              <p className="mt-3 text-sm text-gray-500">{topic.description}</p>
              <div className="mt-6 text-sm font-semibold text-indigo-600">Go to {topic.title} →</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
