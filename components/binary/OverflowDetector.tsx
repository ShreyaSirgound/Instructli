"use client"
import React from 'react'

export default function OverflowDetector({bitWidth = 8}:{bitWidth?: number}){
  return (
    <div style={{padding:12, border:'1px solid #ddd', borderRadius:8}}>
      <div>Overflow detector (stub)</div>
      <div style={{marginTop:8}}>This will demonstrate signed/unsigned overflow cases.</div>
    </div>
  )
}
