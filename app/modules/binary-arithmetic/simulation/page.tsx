import BinaryAdderStepper from '../../../../components/binary/BinaryAdderStepper'

const containerStyle = {
  padding: 24,
  width: '100%',
  marginTop: 18,
}

const cardStyle = {
  minWidth: 1120,
  borderRadius: 14,
  border: '1px solid #e6e6ea',
  padding: 22,
  boxShadow: '0 6px 18px rgba(28,30,40,0.04)',
  background: '#fff'
}

const tabsStyle = {
  display: 'flex',
  gap: 10,
  marginBottom: 16
}

export default function SimulationPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Module 1</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">Binary Arithmetic</h1>
          <p className="mt-4 max-w-2xl text-gray-500">The following simulation lets you toggle bits to observe their addition. Try setting A = 0111 1111 and B = 0000 0001 (127 + 1 as signed). What what happens to the signed bit. This is a classic signed overflow.</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 items-center">
            <div className="flex flex-wrap gap-3 justify-center">
              <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white">Binary Addition</button>
              <button className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm text-gray-700">Two's Complement</button>
              <button className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm text-gray-700">Overflow</button>
            </div>

            <div className="w-full flex justify-center">
              <BinaryAdderStepper bitWidth={8} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
