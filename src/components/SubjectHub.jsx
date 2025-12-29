import React from 'react'

export default function SubjectHub({onSelectMode}){
  const subjects = [
    {id: 'react', name: 'React.js'},
    {id: 'python', name: 'Python'},
    {id: 'dsa', name: 'DSA'},
    {id: 'css', name: 'CSS Layouts'},
  ]

  return (
    <div className="setup-screen glass-card">
      <h1 className="text-4xl font-extrabold text-white">Vast Learning Hub</h1>
      <p className="text-gray-300 mt-2">Choose Practice or Compete, then pick a subject.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map(s => (
          <div key={s.id} className="p-6 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:scale-105 transition" onClick={() => onSelectMode('practice', s.id)}>
            <div className="text-xl font-semibold text-white">{s.name}</div>
            <div className="text-sm text-gray-300 mt-1">Beginner • Advanced</div>
            <div className="mt-3 flex gap-2">
              <button onClick={(e)=>{e.stopPropagation(); onSelectMode('practice', s.id, 'easy')}} className="px-3 py-1 rounded-md bg-indigo-600 text-white">Practice</button>
              <button onClick={(e)=>{e.stopPropagation(); onSelectMode('compete', s.id, 'hard')}} className="px-3 py-1 rounded-md bg-rose-500 text-white">Compete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-400">Practice: immediate feedback. Compete: Blitz mode with leaderboard.</div>
    </div>
  )
}
