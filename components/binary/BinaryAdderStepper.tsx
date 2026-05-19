"use client"
import React, {useMemo, useState} from 'react'

type Props = { bitWidth?: number }

function toUnsigned(bits: number[]) {
  return bits.reduce((acc, b) => acc * 2 + b, 0)
}

function toSigned(unsigned: number, bits: number) {
  const mask = 1 << (bits - 1)
  return (unsigned & mask) !== 0 ? unsigned - (1 << bits) : unsigned
}

export default function BinaryAdderStepper({bitWidth = 8}: Props) {
  const [A, setA] = useState<number[]>(() => Array(bitWidth).fill(0))
  const [B, setB] = useState<number[]>(() => Array(bitWidth).fill(0))

  const toggleA = (i: number) => {
    const next = A.slice()
    next[i] = next[i] ? 0 : 1
    setA(next)
  }
  const toggleB = (i: number) => {
    const next = B.slice()
    next[i] = next[i] ? 0 : 1
    setB(next)
  }

  const computed = useMemo(() => {
    const n = bitWidth
    const result = Array(n).fill(0)
    const carries = Array(n).fill(0)
    let carry = 0
    for (let i = n - 1; i >= 0; i--) {
      const total = A[i] + B[i] + carry
      result[i] = total % 2
      carry = Math.floor(total / 2)
      carries[i] = carry
    }
    const carryOut = carry
    const unsignedA = toUnsigned(A)
    const unsignedB = toUnsigned(B)
    const unsignedResult = toUnsigned(result)
    const carryBitsValue = toUnsigned(carries)
    const signedA = toSigned(unsignedA, n)
    const signedB = toSigned(unsignedB, n)
    const signedResult = toSigned(unsignedResult, n)
    const overflow = (signedA >= 0 && signedB >= 0 && signedResult < 0) || (signedA < 0 && signedB < 0 && signedResult >= 0)
    return {result, carries, unsignedA, unsignedB, unsignedResult, signedA, signedB, signedResult, carryOut, carryBitsValue, overflow}
  }, [A, B, bitWidth])

  const boxStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 10, border: '1px solid #e6e6ea', marginRight: 10, fontWeight:700}
  const bitButtonStyle: React.CSSProperties = {...boxStyle, cursor: 'pointer', userSelect: 'none', background:'#fff'}
  const plusBoxStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, fontSize: 20, color: '#4b4b57', fontWeight: 800}
  const bitRowWidth = bitWidth * 58 - 10
  const adderWidth = 96 + bitRowWidth + 14
  const labelWidth = 96
  const labelStyle: React.CSSProperties = {width: labelWidth, color:'#8b8b95', fontWeight:700, minWidth: labelWidth}
  const emptyLabelStyle: React.CSSProperties = {width: labelWidth}

  return (
    <section style={{width:'100%', overflowX:'auto', minWidth: bitRowWidth + 120}}>
      <div style={{display:'grid', gap:14, width:adderWidth}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={labelStyle}>Carry over</div>
          <div style={{display:'flex'}}>
            {computed.carries.map((c, i) => (
              <div key={i} style={{...boxStyle, background: c ? '#dff7dc' : '#fafafa', border: c ? '1px solid #cfeadf' : '1px solid #eee', color: c ? '#064e1a' : '#444'}}>{c}</div>
            ))}
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={labelStyle}>A</div>
          <div style={{display:'flex'}}>
            {A.map((b, i) => (
              <button aria-label={`Toggle A bit ${i}`} key={i} onClick={() => toggleA(i)} style={{...bitButtonStyle, background: b ? '#e6f0ff' : '#fff', border: b ? '1px solid #a8c7ff' : '1px solid #eee'}}>{b}</button>
            ))}
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={labelStyle}>B</div>
          <div style={{display:'flex'}}>
            {B.map((b, i) => (
              <button aria-label={`Toggle B bit ${i}`} key={i} onClick={() => toggleB(i)} style={{...bitButtonStyle, background: b ? '#e6f0ff' : '#fff', border: b ? '1px solid #a8c7ff' : '1px solid #eee'}}>{b}</button>
            ))}
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={{...labelStyle, justifyContent:'center', display:'flex'}}>
            <span style={{fontSize:20, color:'#4b4b57', fontWeight:800}}>+</span>
          </div>
          <div style={{width: bitRowWidth}} />
        </div>

        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={emptyLabelStyle} />
          <div style={{width: bitRowWidth, height:2, background:'#efefef', marginTop:6, marginBottom:6}} />
        </div>

        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={labelStyle}>Result</div>
          <div style={{display:'flex'}}>
            {computed.result.map((b, i) => (
              <div key={i} style={{...boxStyle, background: '#f0e8ff', border: '1px solid #d9cfff'}}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap:12, marginTop:12, alignItems:'stretch'}}>
        <div style={{padding:14, border: '1px solid #eee', borderRadius:10, width:160, textAlign:'center'}}>
          <div style={{fontSize:12, color:'#777'}}>A (decimal)</div>
          <div style={{fontWeight:800, fontSize:20}}>{computed.unsignedA}</div>
          <div style={{fontSize:12, color:'#666'}}>signed: {computed.signedA}</div>
        </div>
        <div style={{padding:14, border: '1px solid #eee', borderRadius:10, width:160, textAlign:'center'}}>
          <div style={{fontSize:12, color:'#777'}}>B (decimal)</div>
          <div style={{fontWeight:800, fontSize:20}}>{computed.unsignedB}</div>
          <div style={{fontSize:12, color:'#666'}}>signed: {computed.signedB}</div>
        </div>
        <div style={{padding:14, border: '1px solid #cfc3ff', borderRadius:10, width:200, textAlign:'center', background:'#f7f2ff'}}>
          <div style={{fontSize:12, color:'#777'}}>Result (decimal)</div>
          <div style={{fontWeight:800, fontSize:20}}>{computed.unsignedResult}</div>
          <div style={{fontSize:12, color:'#666'}}>signed: {computed.signedResult}</div>
        </div>
        <div style={{padding:14, border: '1px solid #cfeadf', borderRadius:10, width:200, textAlign:'center', background:'#f2fff6'}}>
          <div style={{fontSize:12, color:'#666'}}>Carry over (decimal)</div>
          <div style={{fontWeight:800, fontSize:20}}>{computed.carryBitsValue}</div>
          <div style={{fontSize:12, color:'#666'}}>signed: {computed.carryOut}</div>
        </div>
      </div>

      {computed.overflow && (
        <div style={{marginTop:12, padding:12, borderRadius:8, background:'#fff4f2', border: '1px solid #f5c2c2', display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:20, height:20, borderRadius:4, background:'#f8d7da', display:'flex', alignItems:'center', justifyContent:'center', color:'#b02a37', fontWeight:800}}>!</div>
          <div style={{color:'#7a1b1b'}}>Overflow detected — the result doesn't fit in {bitWidth} bits. The decimal and signed results are not equal.</div>
        </div>
      )}
    </section>
  )
}
