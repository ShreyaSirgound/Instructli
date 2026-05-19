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
    <main style={containerStyle}>
      <h1 style={{fontSize:30, fontWeight:800, margin:0}}>Module 1: Binary Arithmetic</h1>
      <div style={{height:6}} />
      <div style={cardStyle}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <div style={tabsStyle}>
                <button style={{background:'#2f8ef6', color:'#fff', padding:'8px 14px', borderRadius:999, border:'none', fontWeight:700}}>Binary Addition</button>
                <button style={{background:'#fff', border:'1px solid #e6e6ea', padding:'8px 14px', borderRadius:999}}>Two's Complement</button>
                <button style={{background:'#fff', border:'1px solid #e6e6ea', padding:'8px 14px', borderRadius:999}}>Overflow</button>
              </div>
            </div>
            <h2 style={{fontSize:20, margin:'12px 0 6px 0'}}>Step-through adder</h2>
            <p style={{margin:0, color:'#444'}}>The following simulation lets you toggle bits to observe their addition. Try setting A = 0111 1111 and B = 0000 0001 (127 + 1 as signed). What what happens to the signed bit. This is a classic signed overflow.</p>
          </div>
        </div>

        <div style={{marginTop:18}}>
          <BinaryAdderStepper bitWidth={8} />
        </div>
      </div>
    </main>
  )
}
