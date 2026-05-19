"use client"
import React from 'react'

export default function TwosComplementVisualizer({bitWidth = 8}:{bitWidth?:number}){
  return (
    <div style={{padding:12, border:'1px solid #ddd', borderRadius:8}}>
      <div>Two's complement visualizer (stub)</div>
      <div style={{marginTop:8}}>This will show invert + add-one animations and conversions.</div>
    </div>
  )
}
