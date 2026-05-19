import Link from 'next/link'

export default function IntroPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Module 1</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">Binary Arithmetic</h1>
          <p className="mt-4 max-w-2xl text-gray-500">These are the basics for binary arithmetic, covering the fundamental rules you need before moving on to addition, signed values, and overflow.</p>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-200 bg-slate-50 p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Learning goals</h2>
              <ul className="mt-4 space-y-3 text-gray-700 list-disc list-inside">
                <li>Read binary numbers using base-2 place values.</li>
                <li>Perform binary addition bit by bit, including carries.</li>
                <li>Explain how two's complement encodes signed integers.</li>
                <li>Identify signed overflow in fixed-width arithmetic.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900">Why this matters</h2>
              <p className="mt-4 text-gray-700">Computers store all values as binary digits. Understanding how binary addition works is the foundation for arithmetic logic units, machine instructions, and the way CPUs compute both positive and negative numbers.</p>
              <p className="mt-4 text-gray-700">In this module, you will move from the basic rules of binary addition to the most common signed representation used in processors: two's complement. That prepares you to see overflow and how hardware decides whether a result is valid.</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900">Key definitions</h2>
              <dl className="mt-4 space-y-4 text-gray-700">
                <div>
                  <dt className="font-semibold text-gray-900">Bit</dt>
                  <dd className="mt-1">A binary digit, either 0 or 1. Each bit represents a power of two in a binary number.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Unsigned binary</dt>
                  <dd className="mt-1">A binary value interpreted as a non-negative integer using powers of two.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Two's complement</dt>
                  <dd className="mt-1">A signed binary representation where the highest-order bit indicates the sign and negative values are formed by inverting bits and adding one.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Overflow</dt>
                  <dd className="mt-1">When a binary addition result is too large or too small to fit in the available number of bits.</dd>
                </div>
              </dl>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
              <h3 className="text-xl font-semibold text-indigo-900">Binary place values</h3>
              <p className="mt-4 text-gray-700">Each position in an n-bit binary number represents a power of two, starting with 2⁰ at the rightmost bit.</p>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4">
                <div className="grid grid-cols-8 gap-2 text-center text-sm font-medium text-gray-700">
                  <span>2⁷</span><span>2⁶</span><span>2⁵</span><span>2⁴</span><span>2³</span><span>2²</span><span>2¹</span><span>2⁰</span>
                </div>
                <div className="mt-3 grid grid-cols-8 gap-2 text-center text-gray-900 text-lg font-semibold">
                  <span>128</span><span>64</span><span>32</span><span>16</span><span>8</span><span>4</span><span>2</span><span>1</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">Binary addition rules</h3>
              <ul className="mt-4 space-y-3 text-gray-700 list-disc list-inside">
                <li>0 + 0 = 0</li>
                <li>0 + 1 = 1</li>
                <li>1 + 1 = 0, carry 1</li>
                <li>1 + 1 + carry 1 = 1, carry 1</li>
              </ul>
              <p className="mt-4">Carry values move to the next higher bit, just like carrying tens in decimal addition.</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">Signed representation</h3>
              <p className="mt-4 text-gray-700">In two's complement, the leftmost bit is the sign bit. Positive numbers look like normal binary, while negative values use bit inversion plus one.</p>
              <p className="mt-4 text-gray-700">For example, 8-bit <span className="font-semibold">0000 0011</span> is +3, while <span className="font-semibold">1111 1101</span> is -3.</p>
            </div>
          </aside>
        </section>

        <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Next step</h2>
          <p className="mt-4 text-gray-700">After you’ve mastered these basics, move to the worked example to see binary addition in action with annotated carries and signed overflow analysis.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/modules/binary-arithmetic/example" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">Start worked example</Link>
            <Link href="/modules/binary-arithmetic/simulation" className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Go to simulation</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
