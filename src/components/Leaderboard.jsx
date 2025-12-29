import React, {useEffect, useState} from 'react'

const STORAGE_KEY = 'vast_leaderboard'

export default function Leaderboard(){
  const [items, setItems] = useState([])

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw) setItems(JSON.parse(raw))
  },[])

  return (
    <div className="glass-card">
      <h3 className="text-2xl text-white font-bold">Leaderboard</h3>
      {items.length === 0 ? (
        <div className="text-gray-300 mt-4">No scores yet — be the first!</div>
      ) : (
        <ol className="mt-4 list-decimal list-inside text-white">
          {items.map((it, idx)=>(
            <li key={idx} className="mb-2">{it.name || 'Anonymous'} — {it.score} pts — {it.mode} — {it.date}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
