import Link from 'next/link'

export default function BinaryArithmeticModule() {
  return (
    <main style={{padding: 24}}>
      <h1 style={{fontSize: 28, fontWeight: 700}}>Module 1: Binary Arithmetic</h1>
      <p style={{marginTop: 8}}>Choose a topic to explore the interactive simulations.</p>
      <nav style={{marginTop: 16, display: 'flex', gap: 12}}>
        <Link href="/modules/binary-arithmetic/intro"><button>Intro</button></Link>
        <Link href="/modules/binary-arithmetic/example"><button>Worked example</button></Link>
        <Link href="/modules/binary-arithmetic/simulation"><button>Simulation</button></Link>
        <Link href="/modules/binary-arithmetic/knowledge-check"><button>Knowledge check</button></Link>
        <Link href="/modules/binary-arithmetic/challenge"><button>Challenge</button></Link>
      </nav>
    </main>
  )
}
