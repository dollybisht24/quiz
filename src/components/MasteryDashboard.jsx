import React from 'react'

export default function MasteryDashboard({reviewItems=[]}){
  const accuracy = reviewItems.length ? Math.round((reviewItems.filter(i=>i.correct).length / reviewItems.length) * 100) : 0
  const avgSpeed = reviewItems.length ? Math.round((reviewItems.reduce((a,b)=>a+(b.time||0),0) / reviewItems.length)) : 0

  return (
    <div className="glass-card">
      <h3 className="text-2xl text-white font-bold">Mastery Dashboard</h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded bg-white/5">
          <div className="text-3xl font-bold text-white">{accuracy}%</div>
          <div className="text-sm text-gray-300">Accuracy</div>
        </div>
        <div className="p-4 rounded bg-white/5">
          <div className="text-3xl font-bold text-white">{avgSpeed}s</div>
          <div className="text-sm text-gray-300">Avg Speed</div>
        </div>
        <div className="p-4 rounded bg-white/5">
          <div className="text-3xl font-bold text-white">{Math.max(0, reviewItems.filter(i=>!i.correct).length)}</div>
          <div className="text-sm text-gray-300">Topics to Review</div>
        </div>
      </div>
    </div>
  )
}
