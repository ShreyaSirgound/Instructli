import Link from 'next/link'

export default function ExamplePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Module 1</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">Binary arithmetic worked example</h1>
          <p className="mt-4 max-w-2xl text-gray-500">Walk through a concrete binary addition example, then see how two's complement and signed overflow are evaluated for fixed-width values.</p>
        </div>

        <div className="space-y-8">
          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Example 1: Unsigned binary addition</h2>
            <p className="mt-4 text-gray-700">Add the two 8-bit unsigned values <span className="font-semibold">0000 0101</span> and <span className="font-semibold">0000 0011</span>. Work from right to left, carrying whenever two 1s are added.</p>

            <div className="mt-6 overflow-x-auto rounded-3xl border border-gray-100 bg-slate-50 p-5">
              <div className="grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-sm text-gray-600">
                <span className="col-span-9 font-semibold text-gray-800">Place values</span>
                <span>2⁷</span><span>2⁶</span><span>2⁵</span><span>2⁴</span><span>2³</span><span>2²</span><span>2¹</span><span>2⁰</span>
              </div>

              <div className="mt-5 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">Carry</span>
                <span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>1</span><span>0</span><span>0</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">A</span>
                <span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>1</span><span>0</span><span>1</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">B</span>
                <span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>1</span><span>1</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-indigo-700 font-semibold">
                <span className="font-semibold">Sum</span>
                <span>0</span><span>0</span><span>0</span><span>0</span><span>1</span><span>0</span><span>0</span><span>0</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-gray-700">
              <p>The rightmost column adds <span className="font-semibold">1 + 1</span>, which gives 0 and carries 1 to the next position.</p>
              <p>The next column then adds <span className="font-semibold">1 (carry) + 0 + 0</span>, which gives 1 with no further carry.</p>
              <p>The final result is <span className="font-semibold">0000 1000</span>, which is <span className="font-semibold">8</span> in decimal.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Example 2: Signed overflow with two's complement</h2>
            <p className="mt-4 text-gray-700">Add two 8-bit signed values in two's complement: <span className="font-semibold">0111 1111</span> (+127) and <span className="font-semibold">0000 0001</span> (+1).</p>

            <div className="mt-6 rounded-3xl border border-gray-100 bg-slate-50 p-5">
              <div className="grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-sm text-gray-600">
                <span className="col-span-9 font-semibold text-gray-800">Signed bit positions</span>
                <span>2⁷</span><span>2⁶</span><span>2⁵</span><span>2⁴</span><span>2³</span><span>2²</span><span>2¹</span><span>2⁰</span>
              </div>
              <div className="mt-5 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">Carry</span>
                <span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>1</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">A</span>
                <span>0</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">B</span>
                <span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>1</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-indigo-700 font-semibold">
                <span className="font-semibold">Sum</span>
                <span>1</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-gray-700">
              <p>Adding these values produces <span className="font-semibold">1000 0000</span>. As an 8-bit two's complement number, that bit pattern represents <span className="font-semibold">-128</span>, not +128.</p>
              <p>This is signed overflow because the true sum (+128) cannot be represented in 8-bit range (-128 to +127).</p>
              <p>The sign bit flips from positive to negative, which is the overflow indicator for signed addition in two's complement.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Example 3: Overflow from positive operands</h2>
            <p className="mt-4 text-gray-700">Add these two positive 8-bit two's complement values: <span className="font-semibold">0101 1011</span> (+91) and <span className="font-semibold">0110 1101</span> (+109).</p>

            <div className="mt-6 overflow-x-auto rounded-3xl border border-gray-100 bg-slate-50 p-5">
              <div className="grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-sm text-gray-600">
                <span className="col-span-9 font-semibold text-gray-800">Signed addition details</span>
                <span>2⁷</span><span>2⁶</span><span>2⁵</span><span>2⁴</span><span>2³</span><span>2²</span><span>2¹</span><span>2⁰</span>
              </div>
              <div className="mt-5 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">Carry</span>
                <span>0</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">A</span>
                <span>0</span><span>1</span><span>0</span><span>1</span><span>1</span><span>0</span><span>1</span><span>1</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-gray-900">
                <span className="font-semibold">B</span>
                <span>0</span><span>1</span><span>1</span><span>0</span><span>1</span><span>1</span><span>0</span><span>1</span>
              </div>
              <div className="mt-3 grid grid-cols-[repeat(9,minmax(0,1fr))] gap-2 text-center text-indigo-700 font-semibold">
                <span className="font-semibold">Sum</span>
                <span>1</span><span>0</span><span>0</span><span>0</span><span>1</span><span>0</span><span>0</span><span>0</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-gray-700">
              <p>The bitwise result is <span className="font-semibold">1000 1000</span>, which as an 8-bit two's complement value represents <span className="font-semibold">-120</span>.</p>
              <p>Even though both operands are positive, the sign bit becomes 1, so the result appears negative. That change is the signed overflow signal.</p>
              <p>In two's complement arithmetic, the extra carry out of the sign bit is ignored for overflow detection. The important test is whether the sign of the result matches the expected sign from the operands.</p>
            </div>
          </section>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">What to remember</h2>
            <ul className="mt-4 space-y-3 text-gray-700 list-disc list-inside">
              <li>Binary addition works the same way bit by bit, with carries moving left.</li>
              <li>Unsigned addition result is interpreted as a normal non-negative number.</li>
              <li>Two's complement uses the top bit for sign and wraps around when overflow occurs.</li>
              <li>Signed overflow is detected when the sign bit changes unexpectedly after adding two numbers with the same sign.</li>
              <li>For two's complement, the extra carry out of the sign bit is ignored; overflow depends on the result sign, not the final carry.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/modules/binary-arithmetic/intro" className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Back to intro</Link>
              <Link href="/modules/binary-arithmetic/simulation" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">Open the simulation</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
